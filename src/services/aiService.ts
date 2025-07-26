
// AI服务 - 智能助手集成
import AICalendarTools from './aiCalendarTools'
import AdvancedSchedulingService from './advancedSchedulingService'
import chatHistoryService from './chatHistoryService'
import MapService, { Location } from './mapService'
import CalendarService, { CalendarEvent } from './calendarService'
import TodoService from './todoService'

// AI请求选项接口
export interface AIRequestOptions {
  includeLocation?: boolean
  includeTime?: boolean
  includeWeather?: boolean
  includeWebSearch?: boolean
  userLocation?: { latitude: number; longitude: number }
  conversationContext?: {
    userId: string
    sessionId: string
    userPreferences?: any
  }
}

// AI响应接口 - 简化版，专注函数调用
export interface AIResponse {
  content: string
  suggestions?: string[]
  functionCalls?: FunctionCall[]
}

// 函数调用接口
export interface FunctionCall {
  name: string
  arguments: any
  success?: boolean
  result?: any
}

// 日历事件创建参数
export interface CalendarEventParams {
  title: string
  startTime: string
  endTime: string
  location?: string
  description?: string
  category?: 'work' | 'personal' | 'meeting' | 'holiday' | 'travel' | 'health'
  priority?: 'low' | 'medium' | 'high'
}

// 日历事件删除参数
export interface CalendarEventDeleteParams {
  query: string
  dateFilter?: 'today' | 'tomorrow' | 'thisweek' | 'specificDate'
  specificDate?: Date
}

class AIService {
  private isConfigured: boolean = false
  private apiKey: string | null = null

  constructor() {
    this.initialize()
  }

  private initialize() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.isConfigured = !!this.apiKey && this.apiKey.length > 20
    console.log('🤖 AI服务初始化:', this.isConfigured ? '✅ 已配置' : '❌ 未配置')
  }

  // 检查服务是否已配置
  isServiceConfigured(): boolean {
    return this.isConfigured
  }

  // 🚀 优化的系统提示词 - 基于ChatGPT意图识别建议
  private getSystemPrompt(): string {
    return `你是一个智能日历助手。用户输入自然语言后，你需要**首先判断用户的意图**：

**🎯 意图类型识别：**
1. **创建事件** (create) - 用户想要添加新的日程安排
   - 关键词：安排、预约、会议、约会、提醒、计划、事件、活动
   - 示例："明天下午3点开会"、"安排一个项目会议"

2. **删除事件** (delete) - 用户想要移除已有的日程
   - 关键词：删除、取消、清除、移除、去掉
   - 示例："删除明天的会议"、"取消团队会议"、"清除日程"

3. **修改事件** (update) - 用户想要更改已有日程的信息
   - 关键词：修改、更改、调整、改到、改为
   - 示例："把会议改到下午5点"、"修改明天的安排"

**⚠️ 重要：不要默认所有输入都是创建事件！先分析意图，再执行对应操作！**

**可用函数：**

🔹 **创建事件：**
createCalendarEvent({
  title: string,           // 事件标题
  startTime: string,       // 开始时间 (ISO格式)
  endTime: string,         // 结束时间 (ISO格式)
  location?: string,       // 地点（可选）
  description?: string,    // 描述（可选）
  category?: string,       // 分类：work/personal/meeting/holiday/travel/health
  priority?: string        // 优先级：low/medium/high
})

🔹 **删除事件：**
deleteCalendarEvent({
  query: string,           // 搜索查询（事件标题或关键词）
  dateFilter?: string      // 日期过滤：today/tomorrow/thisweek（可选）
})

**执行步骤：**
1. 分析用户输入，确定意图类型 (create/delete/update)
2. 提取相关信息（事件名称、时间、地点等）
3. 调用对应的函数执行操作
4. 返回清晰的确认信息

**示例对话：**

用户："明天下午3点开个项目会议"
→ 意图：create
→ 调用：createCalendarEvent({ title: "项目会议", startTime: "2025-01-XX T15:00:00", endTime: "2025-01-XX T16:00:00", category: "work" })

用户："删除明天的项目会议"  
→ 意图：delete
→ 调用：deleteCalendarEvent({ query: "项目会议", dateFilter: "tomorrow" })

用户："取消所有会议"
→ 意图：delete  
→ 调用：deleteCalendarEvent({ query: "会议" })

**记住：明确识别意图，不要误把删除当成创建！**`
  }

  // 🎯 主要聊天接口 - 重构版
  async chat(message: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    try {
      console.log('🤖 AI开始处理消息:', message)

      // 构建增强的提示词
      const enhancedPrompt = await this.buildEnhancedPrompt(message, options)
      
      if (this.isConfigured) {
        // 调用真实的OpenAI API
        return await this.callOpenAI(enhancedPrompt, options)
      } else {
        // 使用智能模拟响应
        return await this.generateIntelligentMockResponse(message, options)
      }
    } catch (error) {
      console.error('❌ AI聊天失败:', error)
      return {
        content: '抱歉，我现在无法处理您的请求。请稍后再试。',
        suggestions: ['查看今日日程', '优化本周安排', '寻找专注时间']
      }
    }
  }

  // 📞 调用OpenAI API - 支持函数调用
  private async callOpenAI(prompt: string, options: AIRequestOptions): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: this.getSystemPrompt() },
            { role: 'user', content: prompt }
          ],
          functions: [
            {
              name: 'createCalendarEvent',
              description: '在日历中创建一个新的事件',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: '事件标题' },
                  startTime: { type: 'string', format: 'date-time', description: '开始时间 (ISO格式)' },
                  endTime: { type: 'string', format: 'date-time', description: '结束时间 (ISO格式)' },
                  location: { type: 'string', description: '地点' },
                  description: { type: 'string', description: '事件描述' },
                  category: { 
                    type: 'string', 
                    enum: ['work', 'personal', 'meeting', 'holiday', 'travel', 'health'],
                    description: '事件分类'
                  },
                  priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    description: '优先级'
                  }
                },
                required: ['title', 'startTime', 'endTime']
              }
            }
          ],
          function_call: 'auto',
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      const data = await response.json()
      console.log('🤖 OpenAI API响应:', data)

      if (data.choices?.[0]?.message) {
        const message = data.choices[0].message
        
        // 处理函数调用
        if (message.function_call) {
          return await this.handleFunctionCall(message.function_call)
        }
        
        // 处理普通回复
        return {
          content: message.content || '我已经理解了您的需求。',
          suggestions: ['查看今日日程', '创建新事件', '优化时间安排']
        }
      }

      throw new Error('无效的API响应')
    } catch (error) {
      console.error('❌ OpenAI API调用失败:', error)
      return await this.generateIntelligentMockResponse(prompt, options)
    }
  }

  // 🔧 处理函数调用
  private async handleFunctionCall(functionCall: any): Promise<AIResponse> {
    console.log('🎯 处理函数调用:', functionCall)
    
    if (functionCall.name === 'createCalendarEvent') {
      try {
        const params: CalendarEventParams = JSON.parse(functionCall.arguments)
        console.log('📅 创建事件参数:', params)
        
        // 执行实际的事件创建
        const result = await this.executeCreateCalendarEvent(params)
        
        if (result.success) {
          return {
            content: `✅ **事件创建成功！**\n\n📅 **${result.event!.title}**\n🕐 ${new Date(result.event!.startTime).toLocaleString('zh-CN')}\n📍 ${result.event!.location || '无地点'}\n\n事件已添加到您的日历中，并同步到待办事项。`,
            suggestions: ['查看今日日程', '添加更多事件', '优化时间安排'],
            functionCalls: [{
              name: 'createCalendarEvent',
              arguments: params,
              success: true,
              result: result.event
            }]
          }
        } else {
          return {
            content: `❌ 事件创建失败：${result.error}\n\n请检查时间安排或稍后重试。`,
            suggestions: ['重新安排时间', '查看日程冲突', '联系支持']
          }
        }
      } catch (error) {
        console.error('❌ 函数调用执行失败:', error)
        return {
          content: `❌ 处理您的请求时出现错误：${error}\n\n请重新描述您的需求。`,
          suggestions: ['重新描述事件', '查看帮助', '联系支持']
        }
      }
    }

    return {
      content: '抱歉，我不能处理这个函数调用。',
      suggestions: ['重新描述需求', '查看帮助']
    }
  }

  // ⚡ 执行日历事件创建
  private async executeCreateCalendarEvent(params: CalendarEventParams): Promise<{
    success: boolean
    event?: CalendarEvent
    error?: string
  }> {
    try {
      console.log('🔥 开始执行事件创建')
      
      // 转换时间格式
      const startTime = new Date(params.startTime)
      const endTime = new Date(params.endTime)
      
      // 创建事件数据
      const eventData: Partial<CalendarEvent> = {
        title: params.title,
        description: params.description,
        startTime,
        endTime,
        location: params.location ? { name: params.location } : undefined,
        category: params.category || 'personal',
        color: this.getCategoryColor(params.category || 'personal')
      }

      // 使用CalendarService创建事件
      const event = CalendarService.createEvent(eventData)
      console.log('✅ 事件创建成功:', event)

      // 同步到待办事项
      try {
        const todoItem = TodoService.createTodoFromCalendarEvent(event)
        console.log('✅ 待办事项同步成功:', todoItem)
      } catch (error) {
        console.warn('⚠️ 待办事项同步失败:', error)
      }

      // 触发全局更新事件
      window.dispatchEvent(new CustomEvent('calendarEventsUpdated', {
        detail: { newEvent: event, source: 'AIService' }
      }))

      return { success: true, event }
    } catch (error) {
      console.error('❌ 事件创建执行失败:', error)
      return { success: false, error: String(error) }
    }
  }



  // 🎨 获取分类颜色
  private getCategoryColor(category: string): string {
    const colors = {
      work: '#3b82f6',
      personal: '#10b981',
      meeting: '#f59e0b',
      holiday: '#ef4444',
      travel: '#8b5cf6',
      health: '#06b6d4'
    }
    return colors[category as keyof typeof colors] || '#6b7280'
  }

  // 🧠 智能模拟响应 - 基于新的意图识别系统
  private async generateIntelligentMockResponse(message: string, options: AIRequestOptions): Promise<AIResponse> {
    console.log('🤖 生成智能模拟响应，分析用户意图:', message)
    
    try {
      // 🎯 使用新的意图识别服务
      const intent: ParsedIntent = await AIIntentService.identifyIntent(message)
      console.log('🎯 意图识别结果:', intent)
      
      // 根据意图类型处理
      switch (intent.type) {
        case 'delete':
          return await this.handleDeleteIntent(intent)
        
        case 'confirm':
          return await this.handleConfirmIntent(intent)
        
        case 'cancel':
          return await this.handleCancelIntent(intent)
        
        case 'create':
          return await this.handleCreateIntent(intent, options)
        
        case 'query':
          return await this.handleQueryIntent(intent)
        
        default:
          return await this.handleUnknownIntent(intent, options)
      }
      
    } catch (error) {
      console.error('意图识别失败:', error)
      return {
        content: '❌ 处理请求时发生错误，请稍后重试。',
        suggestions: ['重新尝试', '查看帮助']
      }
    }
  }
  
  // 🗑️ 处理删除意图
  private async handleDeleteIntent(intent: ParsedIntent): Promise<AIResponse> {
    console.log('🗑️ 处理删除意图:', intent)
    
    const deleteResponse = await AICalendarDeleteService.processDeleteRequest(intent)
    
    return {
      content: deleteResponse.message,
      suggestions: deleteResponse.suggestions || ['重新尝试', '查看事件'],
      functionCalls: deleteResponse.functionCalls
    }
  }
  
  // ✅ 处理确认意图
  private async handleConfirmIntent(intent: ParsedIntent): Promise<AIResponse> {
    console.log('✅ 处理确认意图')
    
    const deleteResponse = await AICalendarDeleteService.executeConfirmedDeletion()
    
    return {
      content: deleteResponse.message,
      suggestions: deleteResponse.suggestions || ['查看事件', '创建新事件'],
      functionCalls: deleteResponse.functionCalls
    }
  }
  
  // 🚫 处理取消意图
  private async handleCancelIntent(intent: ParsedIntent): Promise<AIResponse> {
    console.log('🚫 处理取消意图')
    
    const deleteResponse = AICalendarDeleteService.cancelDeletion()
    
    return {
      content: deleteResponse.message,
      suggestions: deleteResponse.suggestions || ['查看事件', '创建新事件']
    }
  }
  
  // 📝 处理创建意图
  private async handleCreateIntent(intent: ParsedIntent, options: AIRequestOptions): Promise<AIResponse> {
    console.log('📝 处理创建意图:', intent)
    
    // 尝试从消息中解析事件信息
    const eventInfo = this.parseEventFromMessage(intent.originalMessage)
    
    if (eventInfo) {
      try {
        const result = await this.executeCreateCalendarEvent(eventInfo)
        
        if (result.success) {
          return {
            content: `✅ **模拟AI已创建事件！**\n\n📅 **${result.event!.title}**\n🕐 ${result.event!.startTime.toLocaleString('zh-CN')}\n\n事件已添加到您的日历中。`,
            suggestions: ['查看今日日程', '添加更多事件', '优化时间安排'],
            functionCalls: [{
              name: 'createCalendarEvent',
              arguments: eventInfo,
              success: true,
              result: result.event
            }]
          }
        } else {
          return {
            content: `❌ **创建事件失败**\n\n${result.message}`,
            suggestions: ['重新尝试', '检查信息', '查看冲突']
          }
        }
      } catch (error) {
        console.error('创建事件失败:', error)
        return {
          content: '❌ 创建事件时发生错误，请稍后重试。',
          suggestions: ['重新尝试', '查看日程']
        }
      }
    } else {
      return {
        content: '📝 **需要更多信息来创建事件**\n\n请告诉我：\n• 事件名称\n• 日期和时间\n• 地点（可选）',
        suggestions: ['明天上午会议', '今晚8点聚餐', '下周一培训']
      }
    }
  }
  
  // 🔍 处理查询意图
  private async handleQueryIntent(intent: ParsedIntent): Promise<AIResponse> {
    console.log('🔍 处理查询意图:', intent)
    
    const events = CalendarService.getEvents()
    let filteredEvents = events
    
    // 根据实体过滤事件
    if (intent.entities.date) {
      // 这里可以添加日期过滤逻辑
    }
    
    if (filteredEvents.length === 0) {
      return {
        content: '📅 **暂无匹配的事件**\n\n您的日历目前没有安排的事件。',
        suggestions: ['创建新事件', '查看本周', '添加提醒']
      }
    }
    
    const eventList = filteredEvents.slice(0, 5).map(event => 
      `• **${event.title}** - ${event.startTime.toLocaleString('zh-CN')}`
    ).join('\n')
    
    return {
      content: `📅 **找到 ${filteredEvents.length} 个事件**\n\n${eventList}${filteredEvents.length > 5 ? '\n\n...' : ''}`,
      suggestions: ['查看详情', '编辑事件', '删除事件']
    }
  }
  
  // ❓ 处理未知意图
  private async handleUnknownIntent(intent: ParsedIntent, options: AIRequestOptions): Promise<AIResponse> {
    console.log('❓ 处理未知意图，使用原有逻辑')
    
    // 回退到原有的逻辑 - 尝试检测创建意图作为回退
    const message = intent.originalMessage
    const createKeywords = ['安排', '预约', '会议', '约会', '提醒', '计划', '事件', '活动']
    const hasCreateIntent = createKeywords.some(keyword => message.includes(keyword))
    
    console.log('🔍 回退创建意图检测:', hasCreateIntent, '关键词匹配:', createKeywords.filter(k => message.includes(k)))
    
    if (hasCreateIntent) {
      // 解析简单的事件信息
      const eventInfo = this.parseEventFromMessage(message)
      
      if (eventInfo) {
        try {
          // 直接创建事件
          const result = await this.executeCreateCalendarEvent(eventInfo)
          
          if (result.success) {
            return {
              content: `✅ **模拟AI已创建事件！**\n\n📅 **${result.event!.title}**\n🕐 ${result.event!.startTime.toLocaleString('zh-CN')}\n\n事件已添加到您的日历中。`,
              suggestions: ['查看今日日程', '添加更多事件', '优化时间安排'],
              functionCalls: [{
                name: 'createCalendarEvent',
                arguments: eventInfo,
                success: true,
                result: result.event
              }]
            }
          }
        } catch (error) {
          console.error('模拟事件创建失败:', error)
          return {
            content: '❌ 创建事件时发生错误，请稍后重试。',
            suggestions: ['重新尝试', '检查输入格式']
          }
        }
      }
    }

    // 默认智能回复（无明确意图时）
    console.log('❓ 未识别到明确意图，返回默认回复')
    return {
      content: `我理解您说的："${message}"\n\n💡 **我可以帮您：**\n• 删除日程："删除7月30号的会议"\n• 创建事件："明天下午2点开会"\n• 查看安排："今天有什么事情"\n\n请尝试具体的指令！`,
      suggestions: ['删除今天的事件', '添加新事件', '查看今日安排']
    }
  }



  // 📝 从消息中解析事件信息
  private parseEventFromMessage(message: string): CalendarEventParams | null {
    try {
      // 简单的模式匹配来提取事件信息
      const title = message.match(/([^，。,\.]*(?:会议|约会|安排|事件|活动))/)?.[1] || '新事件'
      
      // 时间解析 - 简化版
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      let startTime = tomorrow
      startTime.setHours(14, 0, 0, 0) // 默认下午2点
      
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 默认1小时

      return {
        title: title.trim(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: `通过AI助手创建：${message}`,
        category: 'personal'
      }
    } catch (error) {
      console.error('解析事件信息失败:', error)
      return null
    }
  }

  // 🔍 构建增强提示词
  private async buildEnhancedPrompt(message: string, options: AIRequestOptions): Promise<string> {
    let prompt = message
    
    try {
      // 添加时间上下文
      if (options.includeTime) {
        const now = new Date()
        prompt += `\n\n当前时间：${now.toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit', 
          minute: '2-digit',
          weekday: 'long'
        })}`
      }

      // 添加位置上下文
      if (options.includeLocation && options.userLocation) {
        prompt += `\n\n用户当前位置：纬度 ${options.userLocation.latitude}, 经度 ${options.userLocation.longitude}`
      }

      // 添加日历上下文
      try {
        const todayEvents = await AICalendarTools.getTodayEvents()
        if (todayEvents.length > 0) {
          prompt += `\n\n今日已有${todayEvents.length}个事件：\n${todayEvents.map(e => 
            `- ${e.title} (${e.startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}-${e.endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })})`
          ).join('\n')}`
        } else {
          prompt += '\n\n今日暂无其他事件安排。'
        }
      } catch (error) {
        console.warn('获取日历上下文失败:', error)
      }

      // 添加聊天历史上下文
      try {
        const recentMessages = chatHistoryService.getMessages('global', 5)
        if (recentMessages.length > 0) {
          prompt += '\n\n最近对话摘要：\n' + recentMessages.slice(-3).map(m => 
            `${m.sender === 'user' ? '用户' : 'AI'}: ${m.content.substring(0, 100)}...`
          ).join('\n')
        }
      } catch (error) {
        console.warn('获取聊天历史失败:', error)
      }

    } catch (error) {
      console.warn('构建增强提示词失败:', error)
    }

    return prompt
  }
}

// 导出单例
const aiService = new AIService()
export default aiService
