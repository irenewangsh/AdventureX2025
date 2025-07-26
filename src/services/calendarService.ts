
// 日历服务 - 管理日历事件的CRUD操作
import { Location } from './mapService'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  allDay: boolean
  location?: Location | null
  category: 'work' | 'personal' | 'meeting' | 'holiday' | 'travel' | 'health'
  color: string
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  reminders?: number[] // 提前提醒时间（分钟）
}

export type CalendarView = 'day' | 'week' | 'month' | 'year'

class CalendarService {
  private events: CalendarEvent[] = []
  private timezone: string = 'Asia/Shanghai'

  constructor() {
    this.loadFromStorage()
    this.initializeSampleData()
  }

  // 获取时区
  getTimezone(): string {
    return this.timezone
  }

  // 设置时区
  setTimezone(timezone: string): void {
    this.timezone = timezone
    this.saveToStorage()
  }

  // 从本地存储加载数据
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('calendar_events')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.events = parsed.map((event: any) => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt)
        }))
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error)
    }
  }

  // 保存到本地存储
  saveToStorage(): void {
    try {
      localStorage.setItem('calendar_events', JSON.stringify(this.events))
    } catch (error) {
      console.error('Failed to save calendar data:', error)
    }
  }

  // 初始化示例数据
  private initializeSampleData(): void {
    if (this.events.length === 0) {
      const now = new Date()
      const sampleEvents: Partial<CalendarEvent>[] = [
        {
          title: '团队会议',
          description: '讨论项目进展和下周计划',
          startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
          endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0),
          allDay: false,
          category: 'meeting',
          color: '#059669',
          location: '会议室A'
        },
        {
          title: '项目截止日',
          description: '完成Q1项目交付',
          startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
          endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
          allDay: true,
          category: 'work',
          color: '#374151'
        },
        {
          title: '健康检查',
          description: '年度体检',
          startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 9, 0),
          endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 12, 0),
          allDay: false,
          category: 'health',
          color: '#ea580c',
          location: '医院'
        }
      ]

      sampleEvents.forEach(event => this.createEvent(event))
    }
  }

  // 创建事件
  createEvent(eventData: Partial<CalendarEvent>): CalendarEvent {
    console.log('CalendarService.createEvent 被调用，输入数据:', eventData)
    
    const now = new Date()
    const event: CalendarEvent = {
      id: this.generateId(),
      title: eventData.title || '新事件',
      description: eventData.description,
      startTime: eventData.startTime || now,
      endTime: eventData.endTime || new Date(now.getTime() + 60 * 60 * 1000),
      allDay: eventData.allDay || false,
      location: eventData.location,
      category: eventData.category || 'personal',
      color: eventData.color || this.getCategoryColor(eventData.category || 'personal'),
      recurring: eventData.recurring,
      reminders: eventData.reminders,
      attendees: eventData.attendees,
      createdAt: now,
      updatedAt: now
    }

    console.log('创建的事件对象:', event)
    this.events.push(event)
    console.log('事件添加到数组后，总事件数:', this.events.length)
    this.saveToStorage()
    console.log('事件已保存到存储')
    return event
  }

  // 更新事件
  updateEvent(id: string, eventData: Partial<CalendarEvent>): CalendarEvent | null {
    const index = this.events.findIndex(event => event.id === id)
    if (index === -1) return null

    const updatedEvent = {
      ...this.events[index],
      ...eventData,
      id, // 确保ID不被覆盖
      updatedAt: new Date()
    }

    this.events[index] = updatedEvent
    this.saveToStorage()
    return updatedEvent
  }

  // 删除事件
  deleteEvent(id: string): boolean {
    const index = this.events.findIndex(event => event.id === id)
    if (index === -1) return false

    this.events.splice(index, 1)
    this.saveToStorage()
    return true
  }

  // 获取事件
  getEvents(startDate?: Date, endDate?: Date): CalendarEvent[] {
    let filteredEvents = [...this.events]

    if (startDate && endDate) {
      filteredEvents = filteredEvents.filter(event => {
        return event.startTime >= startDate && event.startTime <= endDate
      })
    }

    return filteredEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  // 根据ID获取事件
  getEventById(id: string): CalendarEvent | null {
    return this.events.find(event => event.id === id) || null
  }

  // 根据标题查找事件
  findEventByTitle(title: string): CalendarEvent | undefined {
    return this.events.find(event => 
      event.title.toLowerCase().includes(title.toLowerCase())
    )
  }

  // 搜索事件
  searchEvents(query: string): CalendarEvent[] {
    const lowerQuery = query.toLowerCase()
    return this.events.filter(event =>
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description?.toLowerCase().includes(lowerQuery) ||
      event.location?.name?.toLowerCase().includes(lowerQuery)
    )
  }

  // 获取统计信息
  getStats() {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const thisWeekEvents = this.events.filter(event =>
      event.startTime >= weekStart && event.startTime < weekEnd
    )

    const upcomingEvents = this.events
      .filter(event => event.startTime > now)
      .slice(0, 10)

    const meetings = this.events.filter(event => event.category === 'meeting').length
    const efficiency = Math.min(100, Math.round((thisWeekEvents.length / 7) * 20))

    return {
      total: this.events.length,
      thisWeek: thisWeekEvents.length,
      meetings,
      efficiency,
      upcomingEvents,
      categories: this.getCategoryStats()
    }
  }

  // 导出日历数据
  exportCalendar(): string {
    return JSON.stringify({
      events: this.events,
      timezone: this.timezone,
      exportDate: new Date().toISOString()
    }, null, 2)
  }

  // 导入日历数据
  importCalendar(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (parsed.events && Array.isArray(parsed.events)) {
        this.events = parsed.events.map((event: any) => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt)
        }))
        
        if (parsed.timezone) {
          this.timezone = parsed.timezone
        }
        
        this.saveToStorage()
        return true
      }
    } catch (error) {
      console.error('Failed to import calendar data:', error)
    }
    return false
  }

  // 生成唯一ID
  private generateId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 获取分类颜色
  private getCategoryColor(category: string): string {
    const colors = {
      work: '#374151',
      personal: '#3b82f6',
      meeting: '#059669',
      holiday: '#dc2626',
      travel: '#7c3aed',
      health: '#ea580c'
    }
    return colors[category as keyof typeof colors] || '#6b7280'
  }

  // 获取分类统计
  private getCategoryStats() {
    const stats: Record<string, number> = {}
    this.events.forEach(event => {
      stats[event.category] = (stats[event.category] || 0) + 1
    })
    return stats
  }
}

// 导出单例实例
export default new CalendarService()
