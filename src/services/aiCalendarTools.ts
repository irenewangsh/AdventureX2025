// AI日历工具集 - 智能日程管理解决方案
import CalendarService, { CalendarEvent } from './calendarService'
import ChatHistoryService from './chatHistoryService'
import { Location } from './mapService'

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
  eventId?: string
  eventTitle?: string
}

export interface ConflictInfo {
  hasConflict: boolean
  conflictingEvents: CalendarEvent[]
  suggestions: TimeSlot[]
}

export interface ScheduleAnalysis {
  totalEvents: number
  totalHours: number
  averageEventDuration: number
  busiestDay: string
  busiestTimeSlot: string
  fragmentedTime: number
  focusTimeBlocks: TimeSlot[]
  recommendations: string[]
}

export interface OptimalMeetingTime {
  slot: TimeSlot
  score: number
  reasons: string[]
}

export interface AICalendarTools {
  // 今日事件
  getTodayEvents(): Promise<CalendarEvent[]>
  
  // 获取指定日期范围的事件
  getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>
  
  // 创建事件（带冲突检测）
  createEvent(eventData: Partial<CalendarEvent>): Promise<{ 
    success: boolean
    event?: CalendarEvent
    conflicts?: ConflictInfo
    message: string
  }>
  
  // 更新事件
  updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<{
    success: boolean
    event?: CalendarEvent
    conflicts?: ConflictInfo
    message: string
  }>
  
  // 删除事件
  deleteEvent(eventId: string): Promise<{ success: boolean; message: string }>
  
  // 搜索事件
  findEvents(query: string): Promise<CalendarEvent[]>
  
  // 查找可用时间段
  findAvailableTimeSlots(date: Date, duration: number, workingHours?: { start: string; end: string }): Promise<TimeSlot[]>
  
  // 冲突检测
  checkForConflicts(startTime: Date, endTime: Date, excludeEventId?: string): Promise<ConflictInfo>
  
  // 分析忙碌时间和模式
  analyzeBusyTimes(startDate: Date, endDate: Date): Promise<ScheduleAnalysis>
  
  // 寻找最佳会议时间
  findOptimalMeetingTime(
    duration: number,
    preferredDays: string[],
    preferredTimes: string[],
    participants?: string[]
  ): Promise<OptimalMeetingTime[]>
  
  // 重新安排事件
  rescheduleEvent(eventId: string, newStartTime: Date): Promise<{
    success: boolean
    event?: CalendarEvent
    conflicts?: ConflictInfo
    message: string
  }>
  
  // 智能建议
  getScheduleSuggestions(date: Date): Promise<{
    focusTimeBlocks: TimeSlot[]
    breakSuggestions: TimeSlot[]
    optimizationTips: string[]
  }>
}

class AICalendarToolsService implements AICalendarTools {
  
  // 获取今日事件
  async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    
    return CalendarService.getEvents(startOfDay, endOfDay)
  }

  // 获取指定范围的事件
  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    return CalendarService.getEvents(startDate, endDate)
  }

  // 创建事件（带智能冲突检测）
  async createEvent(eventData: Partial<CalendarEvent>): Promise<{
    success: boolean
    event?: CalendarEvent
    conflicts?: ConflictInfo
    message: string
  }> {
    try {
      if (!eventData.startTime || !eventData.endTime) {
        return {
          success: false,
          message: '请提供开始时间和结束时间'
        }
      }

      // 检查冲突
      const conflicts = await this.checkForConflicts(eventData.startTime, eventData.endTime)
      
      if (conflicts.hasConflict) {
        // 尝试自动解决冲突
        const suggestions = await this.findAvailableTimeSlots(
          eventData.startTime,
          (eventData.endTime.getTime() - eventData.startTime.getTime()) / (1000 * 60)
        )
        
        return {
          success: false,
          conflicts: {
            ...conflicts,
            suggestions: suggestions.slice(0, 3) // 提供3个建议时间
          },
          message: `检测到时间冲突。建议的替代时间：${suggestions.slice(0, 3).map(s => 
            `${s.start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}-${s.end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
          ).join(', ')}`
        }
      }

      // 增强事件数据
      const enhancedEvent = await this.enhanceEventData(eventData)
      
      // 创建事件
      const event = CalendarService.createEvent(enhancedEvent)
      
      // 学习用户习惯
      this.learnFromEvent(event)
      
      return {
        success: true,
        event,
        message: `成功创建事件"${event.title}"，时间：${event.startTime.toLocaleString('zh-CN')}`
      }
    } catch (error) {
      console.error('创建事件失败:', error)
      return {
        success: false,
        message: `创建事件失败: ${error}`
      }
    }
  }

  // 更新事件
  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<{
    success: boolean
    event?: CalendarEvent
    conflicts?: ConflictInfo
    message: string
  }> {
    try {
      const existingEvent = CalendarService.getEventById(eventId)
      if (!existingEvent) {
        return {
          success: false,
          message: '事件不存在'
        }
      }

      // 如果更新时间，检查冲突
      if (updates.startTime || updates.endTime) {
        const newStartTime = updates.startTime || existingEvent.startTime
        const newEndTime = updates.endTime || existingEvent.endTime
        
        const conflicts = await this.checkForConflicts(newStartTime, newEndTime, eventId)
        
        if (conflicts.hasConflict) {
          return {
            success: false,
            conflicts,
            message: `更新会产生时间冲突：${conflicts.conflictingEvents.map(e => e.title).join(', ')}`
          }
        }
      }

      const updatedEvent = CalendarService.updateEvent(eventId, updates)
      
      return {
        success: true,
        event: updatedEvent,
        message: `成功更新事件"${updatedEvent?.title}"`
      }
    } catch (error) {
      return {
        success: false,
        message: `更新事件失败: ${error}`
      }
    }
  }

  // 删除事件
  async deleteEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    try {
      const event = CalendarService.getEventById(eventId)
      if (!event) {
        return {
          success: false,
          message: '事件不存在'
        }
      }

      CalendarService.deleteEvent(eventId)
      
      return {
        success: true,
        message: `成功删除事件"${event.title}"`
      }
    } catch (error) {
      return {
        success: false,
        message: `删除事件失败: ${error}`
      }
    }
  }

  // 搜索事件
  async findEvents(query: string): Promise<CalendarEvent[]> {
    return CalendarService.filterEvents(query)
  }

  // 查找可用时间段
  async findAvailableTimeSlots(
    date: Date, 
    durationMinutes: number, 
    workingHours = { start: '09:00', end: '18:00' }
  ): Promise<TimeSlot[]> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    
    // 获取当天的所有事件
    const events = await this.getEvents(startOfDay, endOfDay)
    events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    
    const availableSlots: TimeSlot[] = []
    
    // 工作时间范围
    const [startHour, startMinute] = workingHours.start.split(':').map(Number)
    const [endHour, endMinute] = workingHours.end.split(':').map(Number)
    
    const workStart = new Date(startOfDay)
    workStart.setHours(startHour, startMinute, 0, 0)
    
    const workEnd = new Date(startOfDay)
    workEnd.setHours(endHour, endMinute, 0, 0)
    
    let currentTime = new Date(workStart)
    
    for (const event of events) {
      if (event.allDay) continue
      
      // 检查当前时间到下一个事件之间的空隙
      if (event.startTime.getTime() > currentTime.getTime()) {
        const gapDuration = event.startTime.getTime() - currentTime.getTime()
        const gapMinutes = gapDuration / (1000 * 60)
        
        if (gapMinutes >= durationMinutes) {
          availableSlots.push({
            start: new Date(currentTime),
            end: new Date(Math.min(event.startTime.getTime(), currentTime.getTime() + durationMinutes * 60 * 1000)),
            available: true
          })
        }
      }
      
      currentTime = new Date(Math.max(currentTime.getTime(), event.endTime.getTime()))
    }
    
    // 检查最后一个事件到工作日结束的时间
    if (currentTime < workEnd) {
      const remainingTime = workEnd.getTime() - currentTime.getTime()
      const remainingMinutes = remainingTime / (1000 * 60)
      
      if (remainingMinutes >= durationMinutes) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(Math.min(workEnd.getTime(), currentTime.getTime() + durationMinutes * 60 * 1000)),
          available: true
        })
      }
    }
    
    return availableSlots
  }

  // 冲突检测
  async checkForConflicts(startTime: Date, endTime: Date, excludeEventId?: string): Promise<ConflictInfo> {
    const allEvents = CalendarService.getAllEvents()
    
    const conflictingEvents = allEvents.filter(event => {
      if (excludeEventId && event.id === excludeEventId) return false
      if (event.allDay) return false
      
      return (
        (startTime >= event.startTime && startTime < event.endTime) ||
        (endTime > event.startTime && endTime <= event.endTime) ||
        (startTime <= event.startTime && endTime >= event.endTime)
      )
    })
    
    const suggestions = conflictingEvents.length > 0 ? 
      await this.findAvailableTimeSlots(startTime, (endTime.getTime() - startTime.getTime()) / (1000 * 60)) : []
    
    return {
      hasConflict: conflictingEvents.length > 0,
      conflictingEvents,
      suggestions: suggestions.slice(0, 3)
    }
  }

  // 分析忙碌时间和模式
  async analyzeBusyTimes(startDate: Date, endDate: Date): Promise<ScheduleAnalysis> {
    const events = await this.getEvents(startDate, endDate)
    const nonAllDayEvents = events.filter(e => !e.allDay)
    
    // 基本统计
    const totalEvents = nonAllDayEvents.length
    const totalMinutes = nonAllDayEvents.reduce((sum, event) => {
      return sum + (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60)
    }, 0)
    const totalHours = totalMinutes / 60
    const averageEventDuration = totalEvents > 0 ? totalMinutes / totalEvents : 0
    
    // 按天分析
    const eventsByDay: Record<string, CalendarEvent[]> = {}
    nonAllDayEvents.forEach(event => {
      const dayKey = event.startTime.toDateString()
      if (!eventsByDay[dayKey]) eventsByDay[dayKey] = []
      eventsByDay[dayKey].push(event)
    })
    
    const busiestDay = Object.entries(eventsByDay)
      .sort(([,a], [,b]) => b.length - a.length)[0]?.[0] || '无数据'
    
    // 按时间段分析
    const hourlyActivity: Record<number, number> = {}
    nonAllDayEvents.forEach(event => {
      const hour = event.startTime.getHours()
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1
    })
    
    const busiestHour = Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '无数据'
    const busiestTimeSlot = busiestHour !== '无数据' ? `${busiestHour}:00-${parseInt(busiestHour) + 1}:00` : '无数据'
    
    // 碎片化时间分析
    let fragmentedTime = 0
    const focusTimeBlocks: TimeSlot[] = []
    
    for (const dayEvents of Object.values(eventsByDay)) {
      dayEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      
      for (let i = 0; i < dayEvents.length - 1; i++) {
        const gap = dayEvents[i + 1].startTime.getTime() - dayEvents[i].endTime.getTime()
        const gapMinutes = gap / (1000 * 60)
        
        if (gapMinutes > 0 && gapMinutes < 60) {
          fragmentedTime += gapMinutes
        } else if (gapMinutes >= 120) { // 2小时以上的空隙认为是专注时间
          focusTimeBlocks.push({
            start: dayEvents[i].endTime,
            end: dayEvents[i + 1].startTime,
            available: true
          })
        }
      }
    }
    
    // 生成建议
    const recommendations: string[] = []
    
    if (fragmentedTime > 120) {
      recommendations.push('你的日程较为碎片化，建议合并相似的会议减少切换成本')
    }
    
    if (totalEvents > 8) {
      recommendations.push('今日会议较多，建议预留缓冲时间避免疲劳')
    }
    
    if (focusTimeBlocks.length === 0) {
      recommendations.push('缺少长时间的专注时块，建议安排一些2小时以上的深度工作时间')
    }
    
    if (Object.keys(hourlyActivity).some(hour => parseInt(hour) < 9 || parseInt(hour) > 18)) {
      recommendations.push('存在非工作时间的安排，注意工作生活平衡')
    }
    
    return {
      totalEvents,
      totalHours: Math.round(totalHours * 100) / 100,
      averageEventDuration: Math.round(averageEventDuration),
      busiestDay: new Date(busiestDay).toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' }),
      busiestTimeSlot,
      fragmentedTime: Math.round(fragmentedTime),
      focusTimeBlocks,
      recommendations
    }
  }

  // 寻找最佳会议时间
  async findOptimalMeetingTime(
    durationMinutes: number,
    preferredDays: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    preferredTimes: string[] = ['09:00', '10:00', '14:00', '15:00'],
    participants: string[] = []
  ): Promise<OptimalMeetingTime[]> {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const optimalTimes: OptimalMeetingTime[] = []
    
    // 获取用户偏好
    const userProfile = ChatHistoryService.getUserProfile()
    const workingHours = userProfile.preferences.workingHours
    
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i + 1)
      
      const dayName = date.toLocaleDateString('en', { weekday: 'long' }).toLowerCase()
      if (!preferredDays.includes(dayName)) continue
      
      const availableSlots = await this.findAvailableTimeSlots(date, durationMinutes, workingHours)
      
      for (const slot of availableSlots) {
        const timeString = slot.start.toTimeString().substr(0, 5)
        let score = 50 // 基础分数
        const reasons: string[] = []
        
        // 偏好时间加分
        if (preferredTimes.some(prefTime => Math.abs(
          slot.start.getHours() * 60 + slot.start.getMinutes() - 
          (parseInt(prefTime.split(':')[0]) * 60 + parseInt(prefTime.split(':')[1]))
        ) <= 30)) {
          score += 20
          reasons.push('符合偏好时间段')
        }
        
        // 工作日加分
        if (['monday', 'tuesday', 'wednesday', 'thursday'].includes(dayName)) {
          score += 15
          reasons.push('工作日效率更高')
        }
        
        // 上午时间加分
        if (slot.start.getHours() >= 9 && slot.start.getHours() <= 11) {
          score += 10
          reasons.push('上午精力充沛')
        }
        
        // 避免午餐时间
        if (slot.start.getHours() === 12) {
          score -= 15
          reasons.push('避开午餐时间')
        }
        
        // 避免下午晚些时候
        if (slot.start.getHours() >= 16) {
          score -= 10
        }
        
        optimalTimes.push({
          slot,
          score,
          reasons
        })
      }
    }
    
    return optimalTimes
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // 返回前5个最佳时间
  }

  // 重新安排事件
  async rescheduleEvent(eventId: string, newStartTime: Date): Promise<{
    success: boolean
    event?: CalendarEvent
    conflicts?: ConflictInfo
    message: string
  }> {
    const event = CalendarService.getEventById(eventId)
    if (!event) {
      return {
        success: false,
        message: '事件不存在'
      }
    }
    
    const duration = event.endTime.getTime() - event.startTime.getTime()
    const newEndTime = new Date(newStartTime.getTime() + duration)
    
    return this.updateEvent(eventId, {
      startTime: newStartTime,
      endTime: newEndTime
    })
  }

  // 智能建议
  async getScheduleSuggestions(date: Date): Promise<{
    focusTimeBlocks: TimeSlot[]
    breakSuggestions: TimeSlot[]
    optimizationTips: string[]
  }> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    
    const analysis = await this.analyzeBusyTimes(startOfDay, endOfDay)
    const availableSlots = await this.findAvailableTimeSlots(date, 30)
    
    // 专注时间块（2小时以上）
    const focusTimeBlocks = availableSlots.filter(slot => 
      (slot.end.getTime() - slot.start.getTime()) >= 2 * 60 * 60 * 1000
    )
    
    // 休息建议（15-30分钟的空隙）
    const breakSuggestions = availableSlots.filter(slot => {
      const duration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60)
      return duration >= 15 && duration <= 30
    })
    
    const optimizationTips: string[] = [
      ...analysis.recommendations,
      '建议在重要会议前预留15分钟准备时间',
      '连续会议间安排5-10分钟缓冲时间',
      '将相似类型的会议安排在相邻时间段'
    ]
    
    return {
      focusTimeBlocks,
      breakSuggestions,
      optimizationTips
    }
  }

  // 增强事件数据（基于AI和用户习惯）
  private async enhanceEventData(eventData: Partial<CalendarEvent>): Promise<Partial<CalendarEvent>> {
    const userProfile = ChatHistoryService.getUserProfile()
    const enhanced = { ...eventData }
    
    // 根据事件类型推荐时长
    if (!enhanced.endTime && enhanced.startTime && enhanced.title) {
      const eventType = this.categorizeEvent(enhanced.title)
      const preferredDuration = userProfile.habits.commonEventDurations[eventType] || 60
      enhanced.endTime = new Date(enhanced.startTime.getTime() + preferredDuration * 60 * 1000)
    }
    
    // 推荐分类
    if (!enhanced.category && enhanced.title) {
      enhanced.category = this.categorizeEvent(enhanced.title) as any
    }
    
    // 推荐颜色
    if (!enhanced.color && enhanced.category) {
      const categoryColors: Record<string, string> = {
        'work': '#3b82f6',
        'meeting': '#8b5cf6',
        'personal': '#10b981',
        'health': '#f59e0b',
        'travel': '#ef4444'
      }
      enhanced.color = categoryColors[enhanced.category] || '#6b7280'
    }
    
    return enhanced
  }
  
  // 事件分类
  private categorizeEvent(title: string): string {
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('会议') || lowerTitle.includes('meeting')) return '会议'
    if (lowerTitle.includes('电话') || lowerTitle.includes('call')) return '电话'
    if (lowerTitle.includes('培训') || lowerTitle.includes('training')) return '培训'
    if (lowerTitle.includes('面试') || lowerTitle.includes('interview')) return '面试'
    if (lowerTitle.includes('医生') || lowerTitle.includes('医院')) return '健康'
    if (lowerTitle.includes('旅行') || lowerTitle.includes('出差')) return '旅行'
    
    return '工作'
  }
  
  // 学习用户习惯
  private learnFromEvent(event: CalendarEvent) {
    const userProfile = ChatHistoryService.getUserProfile()
    const eventType = this.categorizeEvent(event.title)
    const duration = (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60)
    
    // 更新常用事件时长
    if (!userProfile.habits.commonEventDurations[eventType]) {
      userProfile.habits.commonEventDurations[eventType] = duration
    } else {
      // 加权平均
      userProfile.habits.commonEventDurations[eventType] = 
        (userProfile.habits.commonEventDurations[eventType] * 0.7 + duration * 0.3)
    }
    
    // 更新偏好时间
    const timeString = event.startTime.toTimeString().substr(0, 5)
    if (!userProfile.habits.frequentEventTimes[eventType]) {
      userProfile.habits.frequentEventTimes[eventType] = []
    }
    
    if (!userProfile.habits.frequentEventTimes[eventType].includes(timeString)) {
      userProfile.habits.frequentEventTimes[eventType].push(timeString)
      // 保持最多5个偏好时间
      if (userProfile.habits.frequentEventTimes[eventType].length > 5) {
        userProfile.habits.frequentEventTimes[eventType].shift()
      }
    }
    
    ChatHistoryService.updateUserProfile({ habits: userProfile.habits })
  }
}

// 创建全局实例
const aiCalendarTools = new AICalendarToolsService()
export default aiCalendarTools 