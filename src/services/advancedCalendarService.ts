
import { RRule, RRuleSet, rrulestr } from 'rrule'
import { format, parseISO, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { addDays, addWeeks, addMonths, addYears, isSameDay, isAfter, isBefore } from 'date-fns'
import Papa from 'papaparse'
import ical from 'ical-generator'
import { CalendarEvent } from './calendarService'

export interface RecurrenceRule {
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  byWeekDay?: number[]
  byMonthDay?: number[]
  byMonth?: number[]
  count?: number
  until?: Date
  exceptions?: Date[]
}

export interface AdvancedCalendarEvent extends CalendarEvent {
  timezone: string
  recurrence?: RecurrenceRule
  googleId?: string
  originalEvent?: string
  isException?: boolean
  exceptionDate?: Date
}

export interface ImportResult {
  success: number
  failed: number
  errors: string[]
  events: AdvancedCalendarEvent[]
}

export interface ExportOptions {
  format: 'ics' | 'csv'
  dateRange?: {
    start: Date
    end: Date
  }
  calendars?: string[]
  includeRecurring?: boolean
}

class AdvancedCalendarService {
  private events: AdvancedCalendarEvent[] = []
  private timezones: string[] = []

  constructor() {
    this.loadTimezones()
    this.loadFromStorage()
  }

  // 加载时区列表
  private loadTimezones(): void {
    this.timezones = [
      'Asia/Shanghai',
      'Asia/Tokyo',
      'Asia/Seoul',
      'Asia/Kolkata',
      'Asia/Dubai',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Moscow',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Toronto',
      'America/Sao_Paulo',
      'Australia/Sydney',
      'Australia/Melbourne',
      'Pacific/Auckland',
      'UTC'
    ]
  }

  // 获取支持的时区列表
  getTimezones(): string[] {
    return this.timezones
  }

  // 创建高级事件
  createAdvancedEvent(eventData: Partial<AdvancedCalendarEvent>): AdvancedCalendarEvent {
    const now = new Date()
    const timezone = eventData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    
    const event: AdvancedCalendarEvent = {
      id: this.generateId(),
      title: eventData.title || '新事件',
      description: eventData.description,
      startTime: eventData.startTime || now,
      endTime: eventData.endTime || new Date(now.getTime() + 60 * 60 * 1000),
      allDay: eventData.allDay || false,
      location: eventData.location,
      category: eventData.category || 'personal',
      color: eventData.color || '#3b82f6',
      timezone,
      recurrence: eventData.recurrence,
      reminders: eventData.reminders,
      attendees: eventData.attendees,
      createdAt: now,
      updatedAt: now
    }

    this.events.push(event)
    this.saveToStorage()
    return event
  }

  // 更新事件
  updateAdvancedEvent(id: string, eventData: Partial<AdvancedCalendarEvent>): AdvancedCalendarEvent | null {
    const index = this.events.findIndex(event => event.id === id)
    if (index === -1) return null

    const updatedEvent = {
      ...this.events[index],
      ...eventData,
      id,
      updatedAt: new Date()
    }

    this.events[index] = updatedEvent
    this.saveToStorage()
    return updatedEvent
  }

  // 删除事件或重复事件实例
  deleteAdvancedEvent(id: string, deleteMode: 'single' | 'following' | 'all' = 'single', instanceDate?: Date): boolean {
    const eventIndex = this.events.findIndex(event => event.id === id)
    if (eventIndex === -1) return false

    const event = this.events[eventIndex]

    if (!event.recurrence || deleteMode === 'all') {
      // 删除单个事件或整个重复系列
      this.events.splice(eventIndex, 1)
    } else if (deleteMode === 'single' && instanceDate) {
      // 添加例外日期
      if (!event.recurrence.exceptions) {
        event.recurrence.exceptions = []
      }
      event.recurrence.exceptions.push(instanceDate)
    } else if (deleteMode === 'following' && instanceDate) {
      // 修改重复结束日期
      event.recurrence.until = instanceDate
    }

    this.saveToStorage()
    return true
  }

  // 获取指定时间范围内的事件（展开重复事件）
  getEventsInRange(startDate: Date, endDate: Date, timezone?: string): AdvancedCalendarEvent[] {
    const expandedEvents: AdvancedCalendarEvent[] = []
    const targetTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

    for (const event of this.events) {
      if (event.recurrence) {
        // 展开重复事件
        const instances = this.expandRecurringEvent(event, startDate, endDate, targetTimezone)
        expandedEvents.push(...instances)
      } else {
        // 单个事件
        const eventStart = this.convertTimezone(event.startTime, event.timezone, targetTimezone)
        const eventEnd = this.convertTimezone(event.endTime, event.timezone, targetTimezone)
        
        if (this.isEventInRange(eventStart, eventEnd, startDate, endDate)) {
          expandedEvents.push({
            ...event,
            startTime: eventStart,
            endTime: eventEnd,
            timezone: targetTimezone
          })
        }
      }
    }

    return expandedEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  // 展开重复事件
  private expandRecurringEvent(
    event: AdvancedCalendarEvent,
    rangeStart: Date,
    rangeEnd: Date,
    targetTimezone: string
  ): AdvancedCalendarEvent[] {
    if (!event.recurrence) return []

    const instances: AdvancedCalendarEvent[] = []
    const rule = this.createRRule(event.recurrence, event.startTime, event.timezone)
    
    // 获取时间范围内的重复实例
    const occurrences = rule.between(rangeStart, rangeEnd, true)
    
    for (const occurrence of occurrences) {
      // 检查是否为例外日期
      if (event.recurrence.exceptions?.some(exception => 
        isSameDay(exception, occurrence)
      )) {
        continue
      }

      // 计算实例的结束时间
      const duration = event.endTime.getTime() - event.startTime.getTime()
      const instanceEnd = new Date(occurrence.getTime() + duration)

      // 转换时区
      const startInTarget = this.convertTimezone(occurrence, event.timezone, targetTimezone)
      const endInTarget = this.convertTimezone(instanceEnd, event.timezone, targetTimezone)

      instances.push({
        ...event,
        id: `${event.id}_${occurrence.getTime()}`,
        startTime: startInTarget,
        endTime: endInTarget,
        timezone: targetTimezone,
        originalEvent: event.id,
        isException: false
      })
    }

    return instances
  }

  // 创建 RRule 对象
  private createRRule(recurrence: RecurrenceRule, startTime: Date, timezone: string): RRule {
    const options: any = {
      freq: this.mapFrequency(recurrence.freq),
      interval: recurrence.interval,
      dtstart: startTime
    }

    if (recurrence.byWeekDay) {
      options.byweekday = recurrence.byWeekDay
    }

    if (recurrence.byMonthDay) {
      options.bymonthday = recurrence.byMonthDay
    }

    if (recurrence.byMonth) {
      options.bymonth = recurrence.byMonth
    }

    if (recurrence.count) {
      options.count = recurrence.count
    }

    if (recurrence.until) {
      options.until = recurrence.until
    }

    return new RRule(options)
  }

  // 映射频率
  private mapFrequency(freq: string): number {
    const freqMap: Record<string, number> = {
      daily: RRule.DAILY,
      weekly: RRule.WEEKLY,
      monthly: RRule.MONTHLY,
      yearly: RRule.YEARLY
    }
    return freqMap[freq] || RRule.WEEKLY
  }

  // 时区转换
  convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
    if (fromTimezone === toTimezone) return date
    
    try {
      // 将本地时间转换为 UTC
      const utcDate = zonedTimeToUtc(date, fromTimezone)
      // 将 UTC 转换为目标时区
      return utcToZonedTime(utcDate, toTimezone)
    } catch (error) {
      console.error('时区转换失败:', error)
      return date
    }
  }

  // 检查事件是否在时间范围内
  private isEventInRange(eventStart: Date, eventEnd: Date, rangeStart: Date, rangeEnd: Date): boolean {
    return !(isAfter(eventStart, rangeEnd) || isBefore(eventEnd, rangeStart))
  }

  // 导入 ICS 文件
  async importFromICS(icsContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      events: []
    }

    try {
      const nodeIcal = await import('node-ical')
      const parsedData = nodeIcal.parseICS(icsContent)

      for (const key in parsedData) {
        const item = parsedData[key]
        
        if (item.type === 'VEVENT') {
          try {
            const event = this.convertIcsToEvent(item)
            const created = this.createAdvancedEvent(event)
            result.events.push(created)
            result.success++
          } catch (error) {
            result.failed++
            result.errors.push(`导入事件失败: ${error}`)
          }
        }
      }
    } catch (error) {
      result.errors.push(`ICS 文件解析失败: ${error}`)
    }

    return result
  }

  // 导入 CSV 文件
  importFromCSV(csvContent: string): ImportResult {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      events: []
    }

    try {
      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true
      })

      for (const row of parsed.data as any[]) {
        try {
          const event = this.convertCsvToEvent(row)
          const created = this.createAdvancedEvent(event)
          result.events.push(created)
          result.success++
        } catch (error) {
          result.failed++
          result.errors.push(`导入行失败: ${error}`)
        }
      }
    } catch (error) {
      result.errors.push(`CSV 文件解析失败: ${error}`)
    }

    return result
  }

  // 导出为 ICS
  exportToICS(options: ExportOptions): string {
    const cal = ical({
      domain: 'calendar-workspace.app',
      name: '我的日历',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })

    let eventsToExport = this.events

    // 应用过滤条件
    if (options.dateRange) {
      eventsToExport = this.getEventsInRange(
        options.dateRange.start,
        options.dateRange.end
      )
    }

    for (const event of eventsToExport) {
      const icalEvent = cal.createEvent({
        id: event.id,
        start: event.startTime,
        end: event.endTime,
        summary: event.title,
        description: event.description,
        location: event.location,
        allDay: event.allDay
      })

      // 添加重复规则
      if (event.recurrence && options.includeRecurring) {
        const rule = this.createRRule(event.recurrence, event.startTime, event.timezone)
        icalEvent.repeating(rule.toString())
      }

      // 添加提醒
      if (event.reminders) {
        for (const reminder of event.reminders) {
          icalEvent.createAlarm({
            type: reminder.type === 'email' ? 'email' : 'display',
            trigger: reminder.minutes * 60
          })
        }
      }
    }

    return cal.toString()
  }

  // 导出为 CSV
  exportToCSV(options: ExportOptions): string {
    let eventsToExport = this.events

    if (options.dateRange) {
      eventsToExport = this.getEventsInRange(
        options.dateRange.start,
        options.dateRange.end
      )
    }

    const csvData = eventsToExport.map(event => ({
      'Title': event.title,
      'Description': event.description || '',
      'Start Date': format(event.startTime, 'yyyy-MM-dd', { timeZone: event.timezone }),
      'Start Time': event.allDay ? '' : format(event.startTime, 'HH:mm', { timeZone: event.timezone }),
      'End Date': format(event.endTime, 'yyyy-MM-dd', { timeZone: event.timezone }),
      'End Time': event.allDay ? '' : format(event.endTime, 'HH:mm', { timeZone: event.timezone }),
      'All Day': event.allDay ? 'TRUE' : 'FALSE',
      'Location': event.location || '',
      'Category': event.category,
      'Timezone': event.timezone
    }))

    return Papa.unparse(csvData)
  }

  // AI 助手 - 自然语言解析
  async parseNaturalLanguage(input: string): Promise<Partial<AdvancedCalendarEvent> | null> {
    const text = input.toLowerCase().trim()
    
    // 基础模式匹配
    const patterns = {
      // 时间模式
      time: /(\d{1,2}):(\d{2})|(\d{1,2})\s*(am|pm)/gi,
      date: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})|明天|今天|后天|下周|下月/gi,
      duration: /(\d+)\s*(小时|分钟|hour|minute)/gi,
      
      // 事件类型
      meeting: /会议|meeting|讨论/i,
      appointment: /预约|约会|appointment/i,
      reminder: /提醒|reminder|记住/i,
      
      // 重复模式
      daily: /每天|daily|天天/i,
      weekly: /每周|weekly|周周/i,
      monthly: /每月|monthly|月月/i
    }

    const event: Partial<AdvancedCalendarEvent> = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    // 提取标题（移除时间和日期信息后的主要内容）
    let title = text
    title = title.replace(patterns.time, '')
    title = title.replace(patterns.date, '')
    title = title.replace(/在|at|on|的/gi, '')
    event.title = title.trim() || '新事件'

    // 解析时间
    const timeMatches = Array.from(text.matchAll(patterns.time))
    if (timeMatches.length > 0) {
      const [, hour, minute, hour12, ampm] = timeMatches[0]
      let parsedHour = parseInt(hour || hour12)
      
      if (ampm && ampm.toLowerCase() === 'pm' && parsedHour < 12) {
        parsedHour += 12
      }
      
      const now = new Date()
      const startTime = new Date(now)
      startTime.setHours(parsedHour, parseInt(minute) || 0, 0, 0)
      
      event.startTime = startTime
      event.endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 默认1小时
    }

    // 解析日期
    const dateMatches = Array.from(text.matchAll(patterns.date))
    if (dateMatches.length > 0) {
      const dateStr = dateMatches[0][0]
      let targetDate = new Date()
      
      if (dateStr.includes('明天')) {
        targetDate = addDays(new Date(), 1)
      } else if (dateStr.includes('后天')) {
        targetDate = addDays(new Date(), 2)
      } else if (dateStr.includes('下周')) {
        targetDate = addWeeks(new Date(), 1)
      } else if (dateStr.includes('下月')) {
        targetDate = addMonths(new Date(), 1)
      }
      
      if (event.startTime) {
        event.startTime.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
        event.endTime = new Date(event.startTime.getTime() + 60 * 60 * 1000)
      }
    }

    // 解析事件类型
    if (patterns.meeting.test(text)) {
      event.category = 'meeting'
      event.color = '#059669'
    } else if (patterns.appointment.test(text)) {
      event.category = 'personal'
      event.color = '#3b82f6'
    }

    // 解析重复模式
    if (patterns.daily.test(text)) {
      event.recurrence = {
        freq: 'daily',
        interval: 1
      }
    } else if (patterns.weekly.test(text)) {
      event.recurrence = {
        freq: 'weekly',
        interval: 1
      }
    } else if (patterns.monthly.test(text)) {
      event.recurrence = {
        freq: 'monthly',
        interval: 1
      }
    }

    return event
  }

  // 转换 ICS 事件
  private convertIcsToEvent(icsEvent: any): Partial<AdvancedCalendarEvent> {
    return {
      title: icsEvent.summary || '导入的事件',
      description: icsEvent.description,
      startTime: icsEvent.start,
      endTime: icsEvent.end,
      location: icsEvent.location,
      allDay: !icsEvent.start.getHours && !icsEvent.start.getMinutes,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  // 转换 CSV 事件
  private convertCsvToEvent(csvRow: any): Partial<AdvancedCalendarEvent> {
    const startDate = parseISO(csvRow['Start Date'] || csvRow['开始日期'])
    const endDate = parseISO(csvRow['End Date'] || csvRow['结束日期'])
    
    return {
      title: csvRow['Title'] || csvRow['标题'] || '导入的事件',
      description: csvRow['Description'] || csvRow['描述'],
      startTime: startDate,
      endTime: endDate,
      location: csvRow['Location'] || csvRow['地点'],
      allDay: (csvRow['All Day'] || csvRow['全天']) === 'TRUE',
      timezone: csvRow['Timezone'] || csvRow['时区'] || Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  // 生成唯一ID
  private generateId(): string {
    return `advanced_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 保存到本地存储
  private saveToStorage(): void {
    try {
      localStorage.setItem('advanced_calendar_events', JSON.stringify(this.events))
    } catch (error) {
      console.error('保存日历数据失败:', error)
    }
  }

  // 从本地存储加载
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('advanced_calendar_events')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.events = parsed.map((event: any) => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
          recurrence: event.recurrence ? {
            ...event.recurrence,
            until: event.recurrence.until ? new Date(event.recurrence.until) : undefined,
            exceptions: event.recurrence.exceptions?.map((d: string) => new Date(d)) || []
          } : undefined
        }))
      }
    } catch (error) {
      console.error('加载日历数据失败:', error)
    }
  }
}

export default new AdvancedCalendarService()
