// 聊天历史和长期记忆服务
export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  context?: 'dashboard' | 'calendar'
  metadata?: {
    location?: { latitude: number; longitude: number }
    eventType?: string
    relatedEventId?: string
    tags?: string[]
  }
}

export interface UserProfile {
  preferences: {
    preferredMeetingTypes: string[]
    frequentLocations: Array<{ name: string; address: string; frequency: number }>
    workingHours: { start: string; end: string }
    timeZone: string
    language: string
  }
  habits: {
    commonEventDurations: Record<string, number> // eventType -> duration in minutes
    frequentEventTimes: Record<string, string[]> // eventType -> preferred times
    locationPreferences: Record<string, string[]> // eventType -> preferred locations
    collaborators: Array<{ name: string; email?: string; frequency: number }>
  }
  memory: {
    importantEvents: Array<{ eventId: string; reason: string; timestamp: Date }>
    personalInfo: Record<string, any>
    projectContexts: Array<{ name: string; description: string; relatedEvents: string[] }>
  }
}

export interface ConversationContext {
  id: string
  title: string
  lastActivity: Date
  messageCount: number
  tags: string[]
  summary?: string
}

class ChatHistoryService {
  private messages: ChatMessage[] = []
  private userProfile: UserProfile
  private conversations: ConversationContext[] = []
  private currentConversationId: string | null = null

  constructor() {
    this.loadFromStorage()
    this.initializeUserProfile()
  }

  // 初始化用户档案
  private initializeUserProfile() {
    const defaultProfile: UserProfile = {
      preferences: {
        preferredMeetingTypes: ['会议', '电话会议', '面谈'],
        frequentLocations: [],
        workingHours: { start: '09:00', end: '18:00' },
        timeZone: 'Asia/Shanghai',
        language: 'zh-CN'
      },
      habits: {
        commonEventDurations: {
          '会议': 60,
          '电话': 30,
          '培训': 120,
          '面试': 45
        },
        frequentEventTimes: {
          '会议': ['09:00', '14:00', '16:00'],
          '电话': ['10:00', '15:00'],
          '培训': ['09:00', '14:00']
        },
        locationPreferences: {},
        collaborators: []
      },
      memory: {
        importantEvents: [],
        personalInfo: {},
        projectContexts: []
      }
    }

    if (!this.userProfile) {
      this.userProfile = defaultProfile
      this.saveToStorage()
    }
  }

  // 从本地存储加载数据
  private loadFromStorage() {
    try {
      const messagesData = localStorage.getItem('chat_messages')
      const profileData = localStorage.getItem('user_profile')
      const conversationsData = localStorage.getItem('conversations')

      if (messagesData) {
        this.messages = JSON.parse(messagesData).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }

      if (profileData) {
        this.userProfile = JSON.parse(profileData)
      }

      if (conversationsData) {
        this.conversations = JSON.parse(conversationsData).map((conv: any) => ({
          ...conv,
          lastActivity: new Date(conv.lastActivity)
        }))
      }
    } catch (error) {
      console.warn('加载聊天历史失败:', error)
    }
  }

  // 保存到本地存储
  private saveToStorage() {
    try {
      localStorage.setItem('chat_messages', JSON.stringify(this.messages))
      localStorage.setItem('user_profile', JSON.stringify(this.userProfile))
      localStorage.setItem('conversations', JSON.stringify(this.conversations))
    } catch (error) {
      console.warn('保存聊天历史失败:', error)
    }
  }

  // 添加消息
  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      ...message
    }

    this.messages.push(newMessage)
    this.updateConversation(newMessage)
    this.learnFromMessage(newMessage)
    this.saveToStorage()
    
    return newMessage
  }

  // 获取所有消息
  getMessages(context?: 'dashboard' | 'calendar', limit?: number): ChatMessage[] {
    let filteredMessages = this.messages

    if (context) {
      filteredMessages = this.messages.filter(msg => msg.context === context)
    }

    if (limit) {
      return filteredMessages.slice(-limit)
    }

    return filteredMessages
  }

  // 获取会话列表
  getConversations(): ConversationContext[] {
    return this.conversations.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
  }

  // 创建新会话
  createNewConversation(title?: string): string {
    const conversationId = Date.now().toString()
    const newConversation: ConversationContext = {
      id: conversationId,
      title: title || `对话 ${new Date().toLocaleDateString()}`,
      lastActivity: new Date(),
      messageCount: 0,
      tags: []
    }

    this.conversations.push(newConversation)
    this.currentConversationId = conversationId
    this.saveToStorage()
    
    return conversationId
  }

  // 切换会话
  switchConversation(conversationId: string) {
    this.currentConversationId = conversationId
  }

  // 删除会话
  deleteConversation(conversationId: string) {
    this.conversations = this.conversations.filter(conv => conv.id !== conversationId)
    this.messages = this.messages.filter(msg => msg.metadata?.relatedEventId !== conversationId)
    
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null
    }
    
    this.saveToStorage()
  }

  // 更新会话信息
  private updateConversation(message: ChatMessage) {
    if (!this.currentConversationId) {
      this.currentConversationId = this.createNewConversation()
    }

    const conversation = this.conversations.find(conv => conv.id === this.currentConversationId)
    if (conversation) {
      conversation.lastActivity = new Date()
      conversation.messageCount++
      
      // 自动生成标题
      if (conversation.messageCount === 1 && message.sender === 'user') {
        conversation.title = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '')
      }
      
      // 提取标签
      this.extractTags(message, conversation)
    }
  }

  // 从消息中学习用户习惯
  private learnFromMessage(message: ChatMessage) {
    if (message.sender !== 'user') return

    const content = message.content.toLowerCase()

    // 学习常用的事件类型
    const eventTypes = ['会议', '电话', '培训', '面试', '约会', '聚餐']
    eventTypes.forEach(type => {
      if (content.includes(type)) {
        // 记录用户偏好的事件类型
        if (!this.userProfile.preferences.preferredMeetingTypes.includes(type)) {
          this.userProfile.preferences.preferredMeetingTypes.push(type)
        }
      }
    })

    // 学习时间偏好
    const timeRegex = /(\d{1,2}):(\d{2})/g
    const times = content.match(timeRegex)
    if (times && message.metadata?.eventType) {
      const eventType = message.metadata.eventType
      if (!this.userProfile.habits.frequentEventTimes[eventType]) {
        this.userProfile.habits.frequentEventTimes[eventType] = []
      }
      times.forEach(time => {
        if (!this.userProfile.habits.frequentEventTimes[eventType].includes(time)) {
          this.userProfile.habits.frequentEventTimes[eventType].push(time)
        }
      })
    }

    // 学习地点偏好
    if (message.metadata?.location || content.includes('在') || content.includes('位置')) {
      // 提取和学习常用地点
    }

    this.saveToStorage()
  }

  // 提取标签
  private extractTags(message: ChatMessage, conversation: ConversationContext) {
    // 检查 message.content 是否存在且不为空
    if (!message.content || typeof message.content !== 'string') {
      return
    }
    
    const content = message.content.toLowerCase()
    const commonTags = ['工作', '会议', '个人', '旅行', '健康', '学习', '娱乐']
    
    commonTags.forEach(tag => {
      if (content.includes(tag) && !conversation.tags.includes(tag)) {
        conversation.tags.push(tag)
      }
    })
  }

  // 获取用户档案
  getUserProfile(): UserProfile {
    return this.userProfile
  }

  // 更新用户档案
  updateUserProfile(updates: Partial<UserProfile>) {
    this.userProfile = { ...this.userProfile, ...updates }
    this.saveToStorage()
  }

  // 搜索消息
  searchMessages(query: string, context?: 'dashboard' | 'calendar'): ChatMessage[] {
    const searchTerm = query.toLowerCase()
    let messages = context ? this.getMessages(context) : this.messages
    
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(searchTerm) ||
      msg.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  // 获取智能建议
  getSmartSuggestions(context: string): string[] {
    const profile = this.getUserProfile()
    const recentMessages = this.getMessages(undefined, 10)
    
    const suggestions: string[] = []

    // 基于用户习惯的建议
    if (context.includes('会议')) {
      const preferredTimes = profile.habits.frequentEventTimes['会议'] || []
      if (preferredTimes.length > 0) {
        suggestions.push(`建议时间：${preferredTimes[0]}`)
      }
    }

    // 基于最近对话的建议
    const recentTopics = recentMessages
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.content)
      .slice(-3)

    if (recentTopics.length > 0) {
      suggestions.push('继续之前的话题')
    }

    return suggestions
  }

  // 获取统计信息
  getStatistics() {
    const totalMessages = this.messages.length
    const userMessages = this.messages.filter(msg => msg.sender === 'user').length
    const conversations = this.conversations.length
    const avgMessagesPerConv = conversations > 0 ? totalMessages / conversations : 0

    return {
      totalMessages,
      userMessages,
      conversations,
      avgMessagesPerConv: Math.round(avgMessagesPerConv * 100) / 100,
      mostActiveDay: this.getMostActiveDay(),
      commonTopics: this.getCommonTopics()
    }
  }

  // 获取最活跃的日期
  private getMostActiveDay(): string {
    const dayCount: Record<string, number> = {}
    
    this.messages.forEach(msg => {
      const day = msg.timestamp.toDateString()
      dayCount[day] = (dayCount[day] || 0) + 1
    })

    const mostActiveDay = Object.entries(dayCount)
      .sort(([,a], [,b]) => b - a)[0]

    return mostActiveDay ? mostActiveDay[0] : '暂无数据'
  }

  // 获取常见话题
  private getCommonTopics(): string[] {
    const topics: Record<string, number> = {}
    
    this.conversations.forEach(conv => {
      conv.tags.forEach(tag => {
        topics[tag] = (topics[tag] || 0) + 1
      })
    })

    return Object.entries(topics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic)
  }

  // 清空所有数据
  clearAllData() {
    this.messages = []
    this.conversations = []
    this.currentConversationId = null
    this.initializeUserProfile()
    this.saveToStorage()
  }

  // 导出数据
  exportData() {
    return {
      messages: this.messages,
      userProfile: this.userProfile,
      conversations: this.conversations,
      exportDate: new Date()
    }
  }

  // 导入数据
  importData(data: any) {
    try {
      if (data.messages) this.messages = data.messages
      if (data.userProfile) this.userProfile = data.userProfile
      if (data.conversations) this.conversations = data.conversations
      this.saveToStorage()
      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }
}

export default new ChatHistoryService() 