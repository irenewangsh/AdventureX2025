import { CalendarEvent } from './calendarService'

// AI 意图类型
export interface CalendarIntent {
  type: 'create' | 'query' | 'update' | 'delete' | 'find_time' | 'analyze' | 'chat'
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  location?: string
  category?: string
  allDay?: boolean
  query?: string
  confidence: number
}

// AI 工具类型
export interface AITool {
  name: string
  description: string
  parameters: Record<string, any>
}

// AI 聊天消息
export interface AIChatMessage {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  intent?: CalendarIntent
  events?: CalendarEvent[]
}

class AICalendarService {
  private messages: AIChatMessage[] = []
  private tools: AITool[] = [
    {
      name: 'getTodayEvents',
      description: '获取今日事件',
      parameters: {}
    },
    {
      name: 'createEvent',
      description: '创建新事件',
      parameters: {
        title: 'string',
        description: 'string',
        startTime: 'Date',
        endTime: 'Date',
        location: 'string',
        category: 'string',
        allDay: 'boolean'
      }
    },
    {
      name: 'findAvailableTimeSlots',
      description: '查找空闲时间段',
      parameters: {
        date: 'Date',
        duration: 'number',
        category: 'string'
      }
    },
    {
      name: 'checkForConflicts',
      description: '检查时间冲突',
      parameters: {
        startTime: 'Date',
        endTime: 'Date'
      }
    },
    {
      name: 'analyzeBusyTimes',
      description: '分析忙碌时间',
      parameters: {
        startDate: 'Date',
        endDate: 'Date'
      }
    },
    {
      name: 'deleteEvent',
      description: '删除事件',
      parameters: {
        title: 'string',
        eventId: 'string',
        query: 'string'
      }
    },
    {
      name: 'searchEvents',
      description: '搜索事件',
      parameters: {
        query: 'string',
        date: 'Date'
      }
    }
  ]

  // 解析用户意图
  async parseIntent(message: string): Promise<CalendarIntent> {
    const lowerMessage = message.toLowerCase()
    
    // 创建事件意图
    if (lowerMessage.includes('创建') || lowerMessage.includes('添加') || lowerMessage.includes('安排')) {
      return {
        type: 'create',
        title: this.extractTitle(message),
        startTime: this.extractTime(message),
        endTime: this.extractEndTime(message),
        location: this.extractLocation(message),
        category: this.extractCategory(message),
        allDay: this.isAllDay(message),
        confidence: 0.9
      }
    }
    
    // 查询事件意图
    if (lowerMessage.includes('查看') || lowerMessage.includes('今天') || lowerMessage.includes('明天')) {
      return {
        type: 'query',
        query: message,
        confidence: 0.8
      }
    }
    
    // 查找时间意图
    if (lowerMessage.includes('空闲') || lowerMessage.includes('可用') || lowerMessage.includes('时间')) {
      return {
        type: 'find_time',
        query: message,
        confidence: 0.7
      }
    }
    
    // 删除事件意图
    if (lowerMessage.includes('删除') || lowerMessage.includes('清除') || lowerMessage.includes('取消') || lowerMessage.includes('移除')) {
      return {
        type: 'delete',
        query: message,
        title: this.extractTitle(message),
        confidence: 0.8
      }
    }
    
    // 分析意图
    if (lowerMessage.includes('分析') || lowerMessage.includes('统计') || lowerMessage.includes('报告')) {
      return {
        type: 'analyze',
        query: message,
        confidence: 0.6
      }
    }
    
    // 默认聊天
    return {
      type: 'chat',
      query: message,
      confidence: 0.5
    }
  }

  // 处理AI消息
  async processMessage(message: string, events: CalendarEvent[]): Promise<AIChatMessage> {
    const intent = await this.parseIntent(message)
    let response = ''
    
    switch (intent.type) {
      case 'create':
        response = this.handleCreateEvent(intent, events)
        break
      case 'query':
        response = this.handleQueryEvents(intent, events)
        break
      case 'delete':
        response = this.handleDeleteEvent(intent, events)
        break
      case 'find_time':
        response = this.handleFindTime(intent, events)
        break
      case 'analyze':
        response = this.handleAnalyze(intent, events)
        break
      default:
        response = this.handleChat(message, intent)
    }
    
    return {
      id: Date.now().toString(),
      content: response,
      sender: 'assistant',
      timestamp: new Date(),
      intent,
      events: intent.type === 'query' ? this.getRelevantEvents(intent, events) : []
    }
  }

  // 处理创建事件
  private handleCreateEvent(intent: CalendarIntent, events: CalendarEvent[]): string {
    if (!intent.title || !intent.startTime) {
      return '请提供事件的标题和时间。例如："明天下午2点创建团队会议"'
    }
    
    const conflict = this.checkConflict(intent.startTime, intent.endTime, events)
    if (conflict) {
      return `发现时间冲突：${conflict.title}。建议调整时间或选择其他时间段。`
    }
    
    return `✅ 已为您创建事件：${intent.title}
📅 时间：${intent.startTime?.toLocaleString()}
📍 地点：${intent.location || '未指定'}
🏷️ 类别：${intent.category || '工作'}
⏰ 全天：${intent.allDay ? '是' : '否'}`
  }

  // 处理删除事件
  private handleDeleteEvent(intent: CalendarIntent, events: CalendarEvent[]): string {
    const query = intent.query?.toLowerCase() || ''
    const title = intent.title?.toLowerCase() || ''
    
    // 搜索匹配的事件
    let matchingEvents = events.filter(event => {
      const eventTitle = event.title.toLowerCase()
      const eventDesc = event.description?.toLowerCase() || ''
      
      // 优先匹配标题
      if (title && eventTitle.includes(title)) {
        return true
      }
      
      // 然后匹配描述或查询内容
      return eventTitle.includes(query) || 
             eventDesc.includes(query) ||
             query.includes(eventTitle)
    })
    
    // 如果查询包含日期信息，进一步过滤
    if (query.includes('今天')) {
      const today = new Date()
      matchingEvents = matchingEvents.filter(event => 
        event.startTime.toDateString() === today.toDateString()
      )
    } else if (query.includes('明天')) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      matchingEvents = matchingEvents.filter(event => 
        event.startTime.toDateString() === tomorrow.toDateString()
      )
    } else if (query.includes('这周') || query.includes('本周')) {
      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)
      
      matchingEvents = matchingEvents.filter(event => 
        event.startTime >= weekStart && event.startTime < weekEnd
      )
    }
    
    if (matchingEvents.length === 0) {
      if (title) {
        return `❌ 未找到标题包含"${title}"的事件。请检查事件名称是否正确。`
      }
      return '❌ 未找到匹配的事件。请提供更具体的事件信息，例如："删除团队会议"或"删除今天的会议"。'
    }
    
    if (matchingEvents.length === 1) {
      const event = matchingEvents[0]
      
      // 触发删除事件
      window.dispatchEvent(new CustomEvent('aiDeleteEvent', {
        detail: { eventId: event.id, eventTitle: event.title }
      }))
      
      return `✅ 已删除事件："${event.title}"
📅 时间：${event.startTime.toLocaleString()}
📍 地点：${event.location || '未指定'}`
    }
    
    // 多个匹配事件时，列出供用户选择
    let response = `🔍 找到 ${matchingEvents.length} 个匹配的事件，请明确指定要删除哪个：\n\n`
    matchingEvents.slice(0, 5).forEach((event, index) => {
      response += `${index + 1}. ${event.title}\n`
      response += `   ⏰ ${event.startTime.toLocaleString()}\n`
      response += `   📍 ${event.location || '未指定地点'}\n\n`
    })
    
    if (matchingEvents.length > 5) {
      response += `... 还有 ${matchingEvents.length - 5} 个事件\n\n`
    }
    
    response += '💡 提示：请使用更具体的事件名称，例如："删除明天的团队会议"'
    
    return response
  }

  // 处理查询事件
  private handleQueryEvents(intent: CalendarIntent, events: CalendarEvent[]): string {
    const relevantEvents = this.getRelevantEvents(intent, events)
    
    if (relevantEvents.length === 0) {
      return '📅 当前时间段没有安排的事件。'
    }
    
    let response = `📅 找到 ${relevantEvents.length} 个事件：\n\n`
    relevantEvents.forEach((event, index) => {
      response += `${index + 1}. ${event.title}\n`
      response += `   ⏰ ${event.startTime.toLocaleString()}\n`
      response += `   📍 ${event.location || '未指定地点'}\n`
      response += `   🏷️ ${event.category}\n\n`
    })
    
    return response
  }

  // 处理查找时间
  private handleFindTime(intent: CalendarIntent, events: CalendarEvent[]): string {
    const today = new Date()
    const availableSlots = this.findAvailableSlots(today, events)
    
    return `🕐 今日可用时间段：\n\n${availableSlots.map(slot => 
      `• ${slot.start.toLocaleTimeString()} - ${slot.end.toLocaleTimeString()}`
    ).join('\n')}`
  }

  // 处理分析
  private handleAnalyze(intent: CalendarIntent, events: CalendarEvent[]): string {
    const stats = this.analyzeEvents(events)
    
    return `📊 日历分析报告：\n\n` +
           `📅 总事件数：${stats.total}\n` +
           `🏢 工作事件：${stats.work}\n` +
           `👥 会议事件：${stats.meeting}\n` +
           `🏖️ 个人事件：${stats.personal}\n` +
           `⏰ 平均时长：${stats.avgDuration}小时\n` +
           `📈 本周忙碌度：${stats.busyLevel}%`
  }

  // 处理聊天
  private handleChat(message: string, intent: CalendarIntent): string {
    const responses = [
      '我理解您的需求，让我帮您管理日历。',
      '有什么我可以帮助您的吗？',
      '请告诉我您想要安排什么事件。',
      '我可以帮您查看、创建或分析日历事件。'
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 提取标题
  private extractTitle(message: string): string {
    const patterns = [
      /创建(.+?)(?:在|到|时间|地点)/,
      /添加(.+?)(?:在|到|时间|地点)/,
      /安排(.+?)(?:在|到|时间|地点)/
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) return match[1].trim()
    }
    
    return '新事件'
  }

  // 提取时间
  private extractTime(message: string): Date | undefined {
    const timePatterns = [
      /(\d{1,2})[点时:：](\d{0,2})/,
      /(\d{1,2})点(\d{0,2})分/,
      /(\d{1,2}):(\d{2})/
    ]
    
    for (const pattern of timePatterns) {
      const match = message.match(pattern)
      if (match) {
        const hour = parseInt(match[1])
        const minute = parseInt(match[2] || '0')
        const date = new Date()
        date.setHours(hour, minute, 0, 0)
        return date
      }
    }
    
    return undefined
  }

  // 提取结束时间
  private extractEndTime(message: string): Date | undefined {
    const startTime = this.extractTime(message)
    if (startTime) {
      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + 1)
      return endTime
    }
    return undefined
  }

  // 提取地点
  private extractLocation(message: string): string | undefined {
    const locationPatterns = [
      /在(.+?)(?:时间|到|创建|添加)/,
      /地点(.+?)(?:时间|到|创建|添加)/
    ]
    
    for (const pattern of locationPatterns) {
      const match = message.match(pattern)
      if (match) return match[1].trim()
    }
    
    return undefined
  }

  // 提取类别
  private extractCategory(message: string): string {
    const categories = {
      '会议': 'meeting',
      '工作': 'work',
      '个人': 'personal',
      '假期': 'holiday',
      '旅行': 'travel',
      '健康': 'health'
    }
    
    for (const [key, value] of Object.entries(categories)) {
      if (message.includes(key)) return value
    }
    
    return 'work'
  }

  // 判断是否全天
  private isAllDay(message: string): boolean {
    return message.includes('全天') || message.includes('整天')
  }

  // 检查时间冲突
  private checkConflict(startTime: Date, endTime: Date, events: CalendarEvent[]): CalendarEvent | null {
    return events.find(event => 
      (startTime < event.endTime && endTime > event.startTime)
    ) || null
  }

  // 获取相关事件
  private getRelevantEvents(intent: CalendarIntent, events: CalendarEvent[]): CalendarEvent[] {
    if (!intent.query) return events
    
    const query = intent.query.toLowerCase()
    const today = new Date()
    
    if (query.includes('今天')) {
      return events.filter(event => 
        event.startTime.toDateString() === today.toDateString()
      )
    }
    
    if (query.includes('明天')) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return events.filter(event => 
        event.startTime.toDateString() === tomorrow.toDateString()
      )
    }
    
    return events.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    )
  }

  // 查找可用时间段
  private findAvailableSlots(date: Date, events: CalendarEvent[]): Array<{start: Date, end: Date}> {
    const dayEvents = events.filter(event => 
      event.startTime.toDateString() === date.toDateString()
    )
    
    const slots = []
    const workStart = 9
    const workEnd = 18
    
    for (let hour = workStart; hour < workEnd; hour++) {
      const slotStart = new Date(date)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(date)
      slotEnd.setHours(hour + 1, 0, 0, 0)
      
      const hasConflict = dayEvents.some(event => 
        (slotStart < event.endTime && slotEnd > event.startTime)
      )
      
      if (!hasConflict) {
        slots.push({ start: slotStart, end: slotEnd })
      }
    }
    
    return slots
  }

  // 分析事件统计
  private analyzeEvents(events: CalendarEvent[]) {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    
    const weekEvents = events.filter(event => 
      event.startTime >= weekStart && event.startTime < weekEnd
    )
    
    const stats = {
      total: events.length,
      work: events.filter(e => e.category === 'work').length,
      meeting: events.filter(e => e.category === 'meeting').length,
      personal: events.filter(e => e.category === 'personal').length,
      avgDuration: Math.round(weekEvents.reduce((sum, e) => 
        sum + (e.endTime.getTime() - e.startTime.getTime()) / (1000 * 60 * 60), 0
      ) / weekEvents.length || 0),
      busyLevel: Math.min(100, Math.round(weekEvents.length * 10))
    }
    
    return stats
  }

  // 获取消息历史
  getMessages(): AIChatMessage[] {
    return this.messages
  }

  // 添加消息
  addMessage(message: AIChatMessage): void {
    this.messages.push(message)
  }

  // 清空消息
  clearMessages(): void {
    this.messages = []
  }

  // 获取工具列表
  getTools(): AITool[] {
    return this.tools
  }
}

export default new AICalendarService() 