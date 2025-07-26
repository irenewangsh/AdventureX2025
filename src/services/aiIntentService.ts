// AI意图识别服务 - 专门处理日历相关的意图识别
import { CalendarEvent } from './calendarService'

export type IntentType = 'create' | 'delete' | 'update' | 'query' | 'confirm' | 'cancel' | 'unknown'

export interface ParsedIntent {
  type: IntentType
  confidence: number
  entities: {
    eventTitle?: string
    date?: string
    time?: string
    location?: string
    targetEvents?: string[]
  }
  originalMessage: string
  suggestions?: string[]
}

export interface ConfirmationContext {
  pendingAction: 'delete' | 'create' | 'update'
  targetEvents: CalendarEvent[]
  originalMessage: string
  timestamp: Date
}

class AIIntentService {
  private confirmationContext: ConfirmationContext | null = null

  // 🎯 主要意图识别入口
  public async identifyIntent(message: string): Promise<ParsedIntent> {
    console.log('🎯 AI意图识别开始:', message)
    
    const normalizedMessage = this.normalizeMessage(message)
    
    // 检查是否是确认/取消响应
    if (this.confirmationContext) {
      const confirmationResult = this.parseConfirmationResponse(normalizedMessage)
      if (confirmationResult.type !== 'unknown') {
        return confirmationResult
      }
    }
    
    // 主要意图识别
    const intent = await this.classifyIntent(normalizedMessage)
    console.log('🎯 意图识别结果:', intent)
    
    return intent
  }

  // 🔍 意图分类 - 基于规则和模式匹配
  private async classifyIntent(message: string): Promise<ParsedIntent> {
    const entities = this.extractEntities(message)
    
    // 删除意图检测 (最高优先级)
    if (this.isDeleteIntent(message)) {
      return {
        type: 'delete',
        confidence: this.calculateDeleteConfidence(message, entities),
        entities,
        originalMessage: message,
        suggestions: ['确认删除', '取消操作', '查看要删除的事件']
      }
    }
    
    // 创建意图检测
    if (this.isCreateIntent(message)) {
      return {
        type: 'create',
        confidence: this.calculateCreateConfidence(message, entities),
        entities,
        originalMessage: message,
        suggestions: ['添加到日历', '设置提醒', '查看冲突']
      }
    }
    
    // 查询意图检测
    if (this.isQueryIntent(message)) {
      return {
        type: 'query',
        confidence: 0.8,
        entities,
        originalMessage: message,
        suggestions: ['查看详情', '编辑事件', '删除事件']
      }
    }
    
    // 未知意图
    return {
      type: 'unknown',
      confidence: 0.1,
      entities,
      originalMessage: message,
      suggestions: ['创建新事件', '查看日程', '删除事件']
    }
  }

  // 🗑️ 删除意图检测 - 多重验证
  private isDeleteIntent(message: string): boolean {
    const deleteKeywords = [
      '删除', '删掉', '删了', '去掉', '去除',
      '取消', '清除', '清掉', '移除', '移掉',
      '不要', '不用', '撤销', '撤掉'
    ]
    
    const contextKeywords = [
      '日程', '日历', '事件', '安排', '会议',
      '活动', '计划', '约会', '提醒'
    ]
    
    const hasDeleteKeyword = deleteKeywords.some(keyword => message.includes(keyword))
    const hasContextKeyword = contextKeywords.some(keyword => message.includes(keyword))
    
    // 必须同时包含删除关键词和上下文关键词
    return hasDeleteKeyword && (hasContextKeyword || this.hasDateReference(message))
  }

  // 📅 创建意图检测
  private isCreateIntent(message: string): boolean {
    const createKeywords = [
      '创建', '新建', '添加', '安排', '预约',
      '约', '设置', '设定', '建立', '制定'
    ]
    
    const eventKeywords = [
      '会议', '事件', '日程', '活动', '约会',
      '计划', '安排', '提醒', '任务'
    ]
    
    const hasCreateKeyword = createKeywords.some(keyword => message.includes(keyword))
    const hasEventKeyword = eventKeywords.some(keyword => message.includes(keyword))
    const hasTimeReference = this.hasTimeReference(message)
    
    return (hasCreateKeyword && hasEventKeyword) || 
           (hasEventKeyword && hasTimeReference) ||
           (hasCreateKeyword && hasTimeReference)
  }

  // 🔍 查询意图检测
  private isQueryIntent(message: string): boolean {
    const queryKeywords = [
      '查看', '看看', '显示', '告诉我', '什么',
      '哪些', '多少', '几个', '有没有', '是否'
    ]
    
    return queryKeywords.some(keyword => message.includes(keyword))
  }

  // 📝 实体提取 - 提取事件名称、时间、地点等
  private extractEntities(message: string): ParsedIntent['entities'] {
    const entities: ParsedIntent['entities'] = {}
    
    // 提取事件标题
    entities.eventTitle = this.extractEventTitle(message)
    
    // 提取日期信息
    entities.date = this.extractDate(message)
    
    // 提取时间信息
    entities.time = this.extractTime(message)
    
    // 提取地点信息
    entities.location = this.extractLocation(message)
    
    return entities
  }

  // 📅 提取事件标题
  private extractEventTitle(message: string): string | undefined {
    // 移除操作词汇后提取核心内容
    let cleaned = message
      .replace(/(删除|取消|清除|移除|创建|添加|安排|查看)/g, '')
      .replace(/(今天|明天|后天|昨天|下周|本周|这周)/g, '')
      .replace(/(\d+[\.\/\-]\d+)/g, '')
      .replace(/(上午|下午|晚上|中午|凌晨)/g, '')
      .replace(/(\d+[点时])/g, '')
      .replace(/(的|了|吧|呢|啊|呀)/g, '')
      .trim()
    
    // 提取有意义的事件名称
    const eventPatterns = [
      /([^，。！？]*(?:会议|约会|活动|培训|课程|聚会|面试|考试|讲座))/,
      /([^，。！？]*(?:项目|工作|任务|计划|安排))/,
      /"([^"]+)"/,  // 引号内容
      /'([^']+)'/,  // 单引号内容
    ]
    
    for (const pattern of eventPatterns) {
      const match = cleaned.match(pattern)
      if (match && match[1] && match[1].trim().length > 1) {
        return match[1].trim()
      }
    }
    
    // 如果没有匹配到特定模式，返回清理后的内容（如果有意义）
    if (cleaned.length > 1 && cleaned.length < 20) {
      return cleaned
    }
    
    return undefined
  }

  // 📅 提取日期信息
  private extractDate(message: string): string | undefined {
    const datePatterns = [
      /(\d{1,2}[\.\/\-]\d{1,2})/,  // 7.30, 7/30, 7-30
      /(\d{1,2}月\d{1,2}[日号]?)/,  // 7月30日
      /(今天|明天|后天|昨天)/,
      /(下周|本周|这周|上周)/,
      /(周[一二三四五六日天])/
    ]
    
    for (const pattern of datePatterns) {
      const match = message.match(pattern)
      if (match) {
        return match[1]
      }
    }
    
    return undefined
  }

  // 🕐 提取时间信息
  private extractTime(message: string): string | undefined {
    const timePatterns = [
      /(\d{1,2}[点时]\d{0,2}[分]?)/,
      /(上午|下午|晚上|中午|凌晨)/,
      /(\d{1,2}:\d{2})/
    ]
    
    for (const pattern of timePatterns) {
      const match = message.match(pattern)
      if (match) {
        return match[1]
      }
    }
    
    return undefined
  }

  // 📍 提取地点信息
  private extractLocation(message: string): string | undefined {
    const locationKeywords = ['在', '去', '到', '会议室', '办公室', '家', '公司', '学校']
    
    for (const keyword of locationKeywords) {
      const index = message.indexOf(keyword)
      if (index !== -1) {
        const after = message.substring(index + keyword.length, index + keyword.length + 10).trim()
        if (after) {
          return after.split(/[，。！？\s]/)[0]
        }
      }
    }
    
    return undefined
  }

  // 📅 检查是否有日期引用
  private hasDateReference(message: string): boolean {
    const dateKeywords = [
      '今天', '明天', '后天', '昨天', '今日', '明日',
      '本周', '下周', '上周', '这周', '周', '月', '日',
      /\d+[\.\/\-]\d+/, /\d+月/, /\d+日/, /\d+号/
    ]
    
    return dateKeywords.some(keyword => 
      typeof keyword === 'string' ? message.includes(keyword) : keyword.test(message)
    )
  }

  // 🕐 检查是否有时间引用
  private hasTimeReference(message: string): boolean {
    const timeKeywords = [
      '点', '时', '分', '上午', '下午', '晚上', '中午', '凌晨',
      /\d+:\d+/, /\d+点/, /\d+时/
    ]
    
    return timeKeywords.some(keyword => 
      typeof keyword === 'string' ? message.includes(keyword) : keyword.test(message)
    )
  }

  // 🔢 计算删除意图置信度
  private calculateDeleteConfidence(message: string, entities: ParsedIntent['entities']): number {
    let confidence = 0.6 // 基础置信度
    
    // 有明确的事件标题 +0.2
    if (entities.eventTitle) confidence += 0.2
    
    // 有日期引用 +0.1
    if (entities.date) confidence += 0.1
    
    // 有时间引用 +0.05
    if (entities.time) confidence += 0.05
    
    // 强删除词汇 +0.1
    if (message.includes('删除') || message.includes('取消')) confidence += 0.1
    
    return Math.min(confidence, 0.95)
  }

  // 🔢 计算创建意图置信度
  private calculateCreateConfidence(message: string, entities: ParsedIntent['entities']): number {
    let confidence = 0.5
    
    if (entities.eventTitle) confidence += 0.2
    if (entities.date) confidence += 0.15
    if (entities.time) confidence += 0.1
    if (entities.location) confidence += 0.05
    
    return Math.min(confidence, 0.9)
  }

  // 📝 消息标准化
  private normalizeMessage(message: string): string {
    return message.trim().toLowerCase()
  }

  // ✅ 解析确认响应
  private parseConfirmationResponse(message: string): ParsedIntent {
    const confirmKeywords = ['是', '对', '确认', '好', '可以', 'yes', 'ok', '删除', '确定']
    const cancelKeywords = ['不', '否', '取消', '算了', 'no', '不要', '不用']
    
    if (confirmKeywords.some(keyword => message.includes(keyword))) {
      return {
        type: 'confirm',
        confidence: 0.9,
        entities: {},
        originalMessage: message
      }
    }
    
    if (cancelKeywords.some(keyword => message.includes(keyword))) {
      return {
        type: 'cancel',
        confidence: 0.9,
        entities: {},
        originalMessage: message
      }
    }
    
    return {
      type: 'unknown',
      confidence: 0.1,
      entities: {},
      originalMessage: message
    }
  }

  // 🔄 设置确认上下文
  public setConfirmationContext(context: ConfirmationContext): void {
    this.confirmationContext = context
    console.log('📝 设置确认上下文:', context)
  }

  // 🗑️ 清除确认上下文
  public clearConfirmationContext(): void {
    this.confirmationContext = null
    console.log('🗑️ 清除确认上下文')
  }

  // 📖 获取确认上下文
  public getConfirmationContext(): ConfirmationContext | null {
    return this.confirmationContext
  }
}

export default new AIIntentService() 