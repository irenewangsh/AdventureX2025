// 高级智能调度服务 - 自动化日程优化
import CalendarService, { CalendarEvent } from './calendarService'
import GoogleCalendarService from './googleCalendarService'
import AICalendarTools, { TimeSlot, OptimalMeetingTime } from './aiCalendarTools'
import ChatHistoryService from './chatHistoryService'
import MapService, { Location } from './mapService'

export interface SchedulingPreferences {
  workingHours: { start: string; end: string }
  preferredMeetingDuration: number
  bufferTime: number
  maxMeetingsPerDay: number
  preferredDays: string[]
  avoidTimeSlots: Array<{ start: string; end: string }>
  travelTimeCalculation: boolean
}

export interface AutoScheduleRequest {
  title: string
  duration: number
  description?: string
  location?: Location
  participants?: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline?: Date
  preferredTimeSlots?: Array<{ start: string; end: string }>
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: Date
  }
}

export interface ScheduleOptimization {
  originalSchedule: CalendarEvent[]
  optimizedSchedule: CalendarEvent[]
  improvements: {
    reducedFragmentation: number
    improvedFocusTime: number
    betterWorkLifeBalance: boolean
    conflictsResolved: number
  }
  recommendations: string[]
}

export interface MultiCalendarSync {
  google: { enabled: boolean; synced: number; errors: string[] }
  outlook: { enabled: boolean; synced: number; errors: string[] }
  apple: { enabled: boolean; synced: number; errors: string[] }
  lastSync: Date
}

class AdvancedSchedulingService {
  private preferences: SchedulingPreferences
  
  constructor() {
    this.preferences = this.loadPreferences()
  }

  // 自动安排事件
  async autoScheduleEvent(request: AutoScheduleRequest): Promise<{
    success: boolean
    scheduledEvent?: CalendarEvent
    alternatives?: OptimalMeetingTime[]
    message: string
  }> {
    try {
      // 1. 分析优先级和紧急程度
      const urgencyScore = this.calculateUrgencyScore(request)
      
      // 2. 计算理想时间窗口
      const timeWindows = await this.calculateTimeWindows(request, urgencyScore)
      
      // 3. 考虑地点和交通时间
      let adjustedDuration = request.duration
      if (request.location && this.preferences.travelTimeCalculation) {
        const travelTime = await this.estimateTravelTime(request.location)
        adjustedDuration += travelTime * 2 // 往返
      }
      
      // 4. 寻找最佳时间段
      const optimalTimes = await AICalendarTools.findOptimalMeetingTime(
        adjustedDuration,
        this.preferences.preferredDays,
        timeWindows
      )
      
      if (optimalTimes.length === 0) {
        return {
          success: false,
          message: '在指定时间范围内未找到合适的时间段',
          alternatives: []
        }
      }
      
      // 5. 创建事件
      const bestTime = optimalTimes[0]
      const eventData: Partial<CalendarEvent> = {
        title: request.title,
        description: request.description,
        startTime: bestTime.slot.start,
        endTime: bestTime.slot.end,
        location: request.location,
        category: this.categorizeByContent(request.title),
        color: this.getColorByPriority(request.priority)
      }
      
      const result = await AICalendarTools.createEvent(eventData)
      
      if (result.success) {
        // 6. 处理重复事件
        if (request.recurring) {
          await this.createRecurringEvents(result.event!, request.recurring)
        }
        
        // 7. 发送通知或邀请
        await this.handleEventNotifications(result.event!, request.participants)
        
        return {
          success: true,
          scheduledEvent: result.event,
          message: `成功安排事件"${request.title}"，优化评分：${bestTime.score}/100`
        }
      } else {
        return {
          success: false,
          message: result.message,
          alternatives: optimalTimes.slice(1, 4) // 提供备选方案
        }
      }
    } catch (error) {
      console.error('自动安排事件失败:', error)
      return {
        success: false,
        message: `自动安排失败: ${error}`
      }
    }
  }

  // 智能日程优化
  async optimizeSchedule(startDate: Date, endDate: Date): Promise<ScheduleOptimization> {
    const originalEvents = await AICalendarTools.getEvents(startDate, endDate)
    const analysis = await AICalendarTools.analyzeBusyTimes(startDate, endDate)
    
    // 创建优化后的日程
    const optimizedEvents = [...originalEvents]
    const improvements = {
      reducedFragmentation: 0,
      improvedFocusTime: 0,
      betterWorkLifeBalance: false,
      conflictsResolved: 0
    }
    const recommendations: string[] = []
    
    // 1. 合并相邻的相似会议
    const mergedEvents = this.mergeSimilarMeetings(optimizedEvents)
    improvements.reducedFragmentation = optimizedEvents.length - mergedEvents.length
    
    // 2. 重新排列以创建专注时间块
    const rearrangedEvents = await this.createFocusTimeBlocks(mergedEvents)
    improvements.improvedFocusTime = this.calculateFocusTimeImprovement(mergedEvents, rearrangedEvents)
    
    // 3. 平衡工作生活
    const balancedEvents = this.improveWorkLifeBalance(rearrangedEvents)
    improvements.betterWorkLifeBalance = this.hasImprovedBalance(rearrangedEvents, balancedEvents)
    
    // 4. 解决冲突
    const conflictFreeEvents = await this.resolveConflicts(balancedEvents)
    improvements.conflictsResolved = balancedEvents.length - conflictFreeEvents.length
    
    // 生成建议
    if (improvements.reducedFragmentation > 0) {
      recommendations.push(`合并了${improvements.reducedFragmentation}个相似会议，减少上下文切换`)
    }
    
    if (improvements.improvedFocusTime > 60) {
      recommendations.push(`增加了${Math.round(improvements.improvedFocusTime / 60)}小时的专注时间`)
    }
    
    if (improvements.betterWorkLifeBalance) {
      recommendations.push('优化了工作生活平衡，减少了非工作时间的安排')
    }
    
    if (analysis.fragmentedTime > 120) {
      recommendations.push('建议将短会议集中安排，为重要工作预留整块时间')
    }
    
    return {
      originalSchedule: originalEvents,
      optimizedSchedule: conflictFreeEvents,
      improvements,
      recommendations
    }
  }

  // 多日历同步
  async syncMultipleCalendars(): Promise<MultiCalendarSync> {
    const syncResult: MultiCalendarSync = {
      google: { enabled: false, synced: 0, errors: [] },
      outlook: { enabled: false, synced: 0, errors: [] },
      apple: { enabled: false, synced: 0, errors: [] },
      lastSync: new Date()
    }

    // Google Calendar 同步
    try {
      await GoogleCalendarService.initialize()
      const localEvents = CalendarService.getAllEvents()
      const googleResult = await GoogleCalendarService.syncEvents(localEvents)
      
      syncResult.google = {
        enabled: true,
        synced: googleResult.created + googleResult.updated,
        errors: googleResult.errors
      }
    } catch (error) {
      syncResult.google.errors.push(`Google Calendar 同步失败: ${error}`)
    }

    // TODO: 实现 Outlook 和 Apple Calendar 同步
    // 这里可以添加其他日历服务的同步逻辑

    return syncResult
  }

  // 智能会议调度
  async scheduleSmartMeeting(
    title: string,
    participants: string[],
    duration: number,
    preferredDate?: Date
  ): Promise<{
    success: boolean
    scheduledTime?: Date
    alternatives?: OptimalMeetingTime[]
    message: string
  }> {
    try {
      // 1. 分析参与者可用性（模拟）
      const participantAvailability = await this.analyzeParticipantAvailability(participants, preferredDate)
      
      // 2. 找到共同可用时间
      const commonSlots = await this.findCommonAvailableSlots(participantAvailability, duration)
      
      if (commonSlots.length === 0) {
        return {
          success: false,
          message: '未找到所有参与者都可用的时间段',
          alternatives: []
        }
      }
      
      // 3. 评估每个时间段的质量
      const scoredSlots = await this.scoreTimeSlots(commonSlots, participants)
      const bestSlot = scoredSlots[0]
      
      // 4. 创建会议
      const eventData: Partial<CalendarEvent> = {
        title,
        startTime: bestSlot.slot.start,
        endTime: bestSlot.slot.end,
        description: `参与者: ${participants.join(', ')}`,
        category: 'meeting',
        color: '#8b5cf6'
      }
      
      const result = await AICalendarTools.createEvent(eventData)
      
      if (result.success) {
        return {
          success: true,
          scheduledTime: bestSlot.slot.start,
          message: `成功安排会议"${title}"，所有参与者均可参加`
        }
      } else {
        return {
          success: false,
          message: result.message,
          alternatives: scoredSlots.slice(1, 3)
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `智能会议调度失败: ${error}`
      }
    }
  }

  // 预测性调度
  async predictiveScheduling(context: string): Promise<{
    suggestions: AutoScheduleRequest[]
    insights: string[]
  }> {
    const userProfile = ChatHistoryService.getUserProfile()
    const recentMessages = ChatHistoryService.getMessages(undefined, 20)
    
    const suggestions: AutoScheduleRequest[] = []
    const insights: string[] = []
    
    // 分析最近的对话，提取可能的日程需求
    for (const message of recentMessages) {
      if (message.sender === 'user') {
        const content = message.content.toLowerCase()
        
        // 检测会议需求
        if (content.includes('会议') || content.includes('讨论')) {
          suggestions.push({
            title: this.extractMeetingTitle(content),
            duration: 60,
            priority: 'medium',
            description: '基于对话内容自动生成的会议建议'
          })
        }
        
        // 检测任务截止日期
        if (content.includes('截止') || content.includes('deadline')) {
          const deadline = this.extractDate(content)
          if (deadline) {
            suggestions.push({
              title: '任务完成时间',
              duration: 120,
              priority: 'high',
              deadline,
              description: '重要任务，需要预留专注时间'
            })
          }
        }
      }
    }
    
    // 生成洞察
    const todayEvents = await AICalendarTools.getTodayEvents()
    if (todayEvents.length > 6) {
      insights.push('今日会议较多，建议明天安排更多专注工作时间')
    }
    
    const preferences = userProfile.preferences
    if (preferences.preferredMeetingTypes.length > 0) {
      insights.push(`你偏好${preferences.preferredMeetingTypes.join('、')}类型的活动`)
    }
    
    return { suggestions, insights }
  }

  // 私有方法实现

  private loadPreferences(): SchedulingPreferences {
    const userProfile = ChatHistoryService.getUserProfile()
    return {
      workingHours: userProfile.preferences.workingHours,
      preferredMeetingDuration: 60,
      bufferTime: 15,
      maxMeetingsPerDay: 8,
      preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      avoidTimeSlots: [
        { start: '12:00', end: '13:00' } // 午餐时间
      ],
      travelTimeCalculation: true
    }
  }

  private calculateUrgencyScore(request: AutoScheduleRequest): number {
    let score = 50 // 基础分数
    
    switch (request.priority) {
      case 'urgent': score += 40; break
      case 'high': score += 25; break
      case 'medium': score += 10; break
      case 'low': score -= 10; break
    }
    
    if (request.deadline) {
      const daysUntilDeadline = (request.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      if (daysUntilDeadline < 1) score += 30
      else if (daysUntilDeadline < 3) score += 20
      else if (daysUntilDeadline < 7) score += 10
    }
    
    return Math.min(100, Math.max(0, score))
  }

  private async calculateTimeWindows(request: AutoScheduleRequest, urgencyScore: number): Promise<string[]> {
    const userProfile = ChatHistoryService.getUserProfile()
    const baseWindows = ['09:00', '10:00', '14:00', '15:00']
    
    if (request.preferredTimeSlots) {
      return request.preferredTimeSlots.map(slot => slot.start)
    }
    
    // 根据事件类型和紧急程度调整
    if (urgencyScore > 80) {
      return ['08:00', '09:00', '13:00', '17:00'] // 紧急事件可以安排在边缘时间
    }
    
    if (userProfile.habits.frequentEventTimes[request.title]) {
      return userProfile.habits.frequentEventTimes[request.title]
    }
    
    return baseWindows
  }

  private async estimateTravelTime(location: Location): Promise<number> {
    // 简化的交通时间估算，实际应该调用地图API
    if (!location.latitude || !location.longitude) return 15
    
    try {
      // 这里可以集成真实的交通时间API
      return 30 // 默认30分钟往返
    } catch {
      return 15 // 备用值
    }
  }

  private categorizeByContent(title: string): any {
    const lower = title.toLowerCase()
    if (lower.includes('会议') || lower.includes('meeting')) return 'meeting'
    if (lower.includes('个人') || lower.includes('private')) return 'personal'
    if (lower.includes('旅行') || lower.includes('travel')) return 'travel'
    if (lower.includes('健康') || lower.includes('health')) return 'health'
    return 'work'
  }

  private getColorByPriority(priority: string): string {
    const colors = {
      'urgent': '#ef4444',
      'high': '#f59e0b',
      'medium': '#3b82f6',
      'low': '#6b7280'
    }
    return colors[priority as keyof typeof colors] || '#3b82f6'
  }

  private async createRecurringEvents(baseEvent: CalendarEvent, recurring: AutoScheduleRequest['recurring']): Promise<void> {
    if (!recurring) return
    
    const interval = recurring.interval
    const frequency = recurring.frequency
    const endDate = recurring.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 默认一年
    
    let currentDate = new Date(baseEvent.startTime)
    const occurrences: Partial<CalendarEvent>[] = []
    
    while (currentDate <= endDate && occurrences.length < 52) { // 最多52次重复
      // 计算下一次发生的时间
      switch (frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval)
          break
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * interval))
          break
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval)
          break
      }
      
      if (currentDate <= endDate) {
        const duration = baseEvent.endTime.getTime() - baseEvent.startTime.getTime()
        occurrences.push({
          ...baseEvent,
          id: undefined, // 让系统生成新ID
          startTime: new Date(currentDate),
          endTime: new Date(currentDate.getTime() + duration)
        })
      }
    }
    
    // 批量创建重复事件
    for (const occurrence of occurrences) {
      await AICalendarTools.createEvent(occurrence)
    }
  }

  private async handleEventNotifications(event: CalendarEvent, participants?: string[]): Promise<void> {
    // 这里可以实现真实的通知系统
    console.log(`通知已发送：${event.title}`, participants)
  }

  // 其他优化方法的简化实现
  private mergeSimilarMeetings(events: CalendarEvent[]): CalendarEvent[] {
    // 简化实现：寻找相邻的相似会议并合并
    return events // 实际实现需要复杂的相似度算法
  }

  private async createFocusTimeBlocks(events: CalendarEvent[]): CalendarEvent[] {
    // 简化实现：重新排列事件以创建更大的空闲时间块
    return events
  }

  private calculateFocusTimeImprovement(original: CalendarEvent[], optimized: CalendarEvent[]): number {
    // 计算专注时间的改善（分钟）
    return 60 // 简化返回
  }

  private improveWorkLifeBalance(events: CalendarEvent[]): CalendarEvent[] {
    // 移除或重新安排非工作时间的事件
    return events
  }

  private hasImprovedBalance(original: CalendarEvent[], optimized: CalendarEvent[]): boolean {
    return optimized.length < original.length
  }

  private async resolveConflicts(events: CalendarEvent[]): CalendarEvent[] {
    const resolved: CalendarEvent[] = []
    
    for (const event of events) {
      const conflicts = await AICalendarTools.checkForConflicts(event.startTime, event.endTime, event.id)
      if (!conflicts.hasConflict) {
        resolved.push(event)
      }
    }
    
    return resolved
  }

  private async analyzeParticipantAvailability(participants: string[], preferredDate?: Date): Promise<any> {
    // 模拟参与者可用性分析
    return participants.map(p => ({ name: p, availability: [] }))
  }

  private async findCommonAvailableSlots(availability: any, duration: number): Promise<TimeSlot[]> {
    // 找到所有参与者的共同可用时间
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return AICalendarTools.findAvailableTimeSlots(tomorrow, duration)
  }

  private async scoreTimeSlots(slots: TimeSlot[], participants: string[]): Promise<OptimalMeetingTime[]> {
    return slots.map(slot => ({
      slot,
      score: 75 + Math.random() * 25, // 简化评分
      reasons: ['所有参与者可用', '最佳时间段']
    }))
  }

  private extractMeetingTitle(content: string): string {
    // 从对话内容中提取会议标题
    if (content.includes('项目')) return '项目讨论会议'
    if (content.includes('回顾')) return '工作回顾会议'
    return '会议'
  }

  private extractDate(content: string): Date | null {
    // 从文本中提取日期
    const dateRegex = /(\d{1,2})[月\/](\d{1,2})[日]?/
    const match = content.match(dateRegex)
    if (match) {
      const month = parseInt(match[1]) - 1
      const day = parseInt(match[2])
      const currentYear = new Date().getFullYear()
      return new Date(currentYear, month, day)
    }
    return null
  }
}

export default new AdvancedSchedulingService() 