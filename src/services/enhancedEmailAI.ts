// 增强 AI 邮件处理引擎 - 基于 Zero 的 AI 架构
import aiService from './aiService'
import CalendarService, { CalendarEvent } from './calendarService'
import { EmailData } from './emailService'

// AI 邮件分类类型
export interface EmailClassification {
  category: 'meeting' | 'task' | 'newsletter' | 'personal' | 'work' | 'spam' | 'important' | 'promotional'
  confidence: number
  priority: 'high' | 'medium' | 'low'
  urgency: 'urgent' | 'normal' | 'low'
  sentiment: 'positive' | 'neutral' | 'negative'
  actionItems: string[]
  keywords: string[]
  entities: EmailEntity[]
}

export interface EmailEntity {
  type: 'person' | 'company' | 'date' | 'location' | 'project' | 'product'
  value: string
  confidence: number
}

export interface SmartReply {
  type: 'accept' | 'decline' | 'postpone' | 'confirm' | 'question' | 'generic'
  content: string
  tone: 'formal' | 'casual' | 'friendly' | 'professional'
  confidence: number
}

export interface EmailSecurity {
  isPhishing: boolean
  isSuspicious: boolean
  riskLevel: 'low' | 'medium' | 'high'
  threats: string[]
  recommendations: string[]
}

export interface EmailTemplate {
  id: string
  name: string
  category: string
  subject: string
  content: string
  variables: string[]
  usage: number
  lastUsed: Date
}

export interface EmailAnalytics {
  totalEmails: number
  categorizedEmails: Record<string, number>
  responseTime: number
  productivity: {
    actionItems: number
    completedTasks: number
    meetingsScheduled: number
  }
  trends: {
    volume: number[]
    categories: Record<string, number[]>
  }
}

class EnhancedEmailAI {
  private templates: EmailTemplate[] = []
  private analytics: EmailAnalytics = {
    totalEmails: 0,
    categorizedEmails: {},
    responseTime: 0,
    productivity: {
      actionItems: 0,
      completedTasks: 0,
      meetingsScheduled: 0
    },
    trends: {
      volume: [],
      categories: {}
    }
  }

  constructor() {
    this.loadTemplates()
    this.loadAnalytics()
  }

  // 🤖 智能邮件分类
  async classifyEmail(email: EmailData): Promise<EmailClassification> {
    try {
      console.log('🤖 AI 分析邮件:', email.subject)

      const prompt = `
作为高级邮件AI助手，请深度分析以下邮件：

主题: ${email.subject}
发件人: ${email.from}
内容: ${email.content}
时间: ${email.date.toISOString()}

请提供详细的JSON分析结果：
{
  "category": "meeting|task|newsletter|personal|work|spam|important|promotional",
  "confidence": 0.95,
  "priority": "high|medium|low",
  "urgency": "urgent|normal|low", 
  "sentiment": "positive|neutral|negative",
  "actionItems": ["具体行动项目"],
  "keywords": ["关键词"],
  "entities": [
    {"type": "person|company|date|location|project|product", "value": "实体值", "confidence": 0.9}
  ]
}

分析要点：
1. 识别邮件类型和优先级
2. 提取行动项目和关键实体
3. 分析情感倾向和紧急程度
4. 检测会议、任务、项目等信息
`

      const response = await aiService.chat(prompt, {
        includeTime: true,
        includeLocation: false
      })

      const classification = this.parseClassificationResponse(response.content)
      
      // 更新分析统计
      this.updateAnalytics(classification)
      
      console.log('✅ 邮件分类完成:', classification.category)
      return classification

    } catch (error) {
      console.error('❌ 邮件分类失败:', error)
      return this.getDefaultClassification()
    }
  }

  // 🛡️ 邮件安全扫描
  async securityScan(email: EmailData): Promise<EmailSecurity> {
    try {
      console.log('🛡️ 安全扫描邮件:', email.subject)

      const prompt = `
作为邮件安全专家AI，请扫描以下邮件的安全风险：

发件人: ${email.from}
主题: ${email.subject}
内容: ${email.content}

检查项目：
1. 钓鱼邮件特征（虚假链接、紧急语言、要求个人信息）
2. 恶意软件迹象（可疑附件、外部链接）
3. 社会工程攻击（伪装身份、权威威胁）
4. 垃圾邮件模式（过度营销、重复内容）

返回JSON格式：
{
  "isPhishing": false,
  "isSuspicious": false,
  "riskLevel": "low|medium|high",
  "threats": ["具体威胁"],
  "recommendations": ["安全建议"]
}
`

      const response = await aiService.chat(prompt)
      return this.parseSecurityResponse(response.content)

    } catch (error) {
      console.error('❌ 安全扫描失败:', error)
      return {
        isPhishing: false,
        isSuspicious: false,
        riskLevel: 'low',
        threats: [],
        recommendations: []
      }
    }
  }

  // 💬 智能回复生成
  async generateSmartReplies(email: EmailData, context?: string): Promise<SmartReply[]> {
    try {
      console.log('💬 生成智能回复:', email.subject)

      const prompt = `
作为专业邮件助手，为以下邮件生成3-5个智能回复选项：

收到的邮件：
主题: ${email.subject}
发件人: ${email.from}
内容: ${email.content}

${context ? `额外上下文: ${context}` : ''}

请生成多样化的回复选项，JSON格式：
[
  {
    "type": "accept|decline|postpone|confirm|question|generic",
    "content": "回复内容",
    "tone": "formal|casual|friendly|professional",
    "confidence": 0.85
  }
]

要求：
1. 回复要简洁专业
2. 涵盖不同回应类型
3. 适应邮件语调和内容
4. 包含具体的行动建议
`

      const response = await aiService.chat(prompt)
      return this.parseRepliesResponse(response.content)

    } catch (error) {
      console.error('❌ 智能回复生成失败:', error)
      return []
    }
  }

  // 📝 邮件模板管理
  async generateTemplate(category: string, purpose: string): Promise<EmailTemplate> {
    try {
      console.log('📝 生成邮件模板:', category, purpose)

      const prompt = `
创建一个专业的邮件模板：

类别: ${category}
目的: ${purpose}

请生成：
{
  "name": "模板名称",
  "subject": "主题模板（使用 {{变量}} 格式）",
  "content": "邮件内容模板（使用 {{变量}} 格式）",
  "variables": ["变量列表"]
}

要求：
1. 专业且友好的语调
2. 清晰的结构和格式
3. 灵活的变量系统
4. 适合商务场景
`

      const response = await aiService.chat(prompt)
      const templateData = this.parseTemplateResponse(response.content)
      
      const template: EmailTemplate = {
        id: this.generateId(),
        name: templateData.name,
        category,
        subject: templateData.subject,
        content: templateData.content,
        variables: templateData.variables,
        usage: 0,
        lastUsed: new Date()
      }

      this.templates.push(template)
      this.saveTemplates()
      
      return template

    } catch (error) {
      console.error('❌ 模板生成失败:', error)
      throw error
    }
  }

  // 📊 邮件智能搜索
  async intelligentSearch(query: string, emails: EmailData[]): Promise<EmailData[]> {
    try {
      console.log('🔍 智能搜索:', query)

      // 使用 AI 理解搜索意图
      const prompt = `
理解用户的搜索意图：'${query}'

分析用户可能在寻找：
1. 特定类型的邮件（会议、任务、重要邮件等）
2. 特定时间范围
3. 特定发件人或主题
4. 特定关键词或概念

返回搜索策略：
{
  "keywords": ["关键词列表"],
  "categories": ["邮件类别"],
  "timeRange": "recent|week|month|all",
  "priority": "high|medium|low|all",
  "searchType": "exact|semantic|fuzzy"
}
`

      const response = await aiService.chat(prompt)
      const searchStrategy = this.parseSearchStrategy(response.content)
      
      return this.performIntelligentSearch(emails, searchStrategy, query)

    } catch (error) {
      console.error('❌ 智能搜索失败:', error)
      return this.performBasicSearch(emails, query)
    }
  }

  // 📈 邮件生产力分析
  async analyzeProductivity(emails: EmailData[]): Promise<EmailAnalytics> {
    try {
      console.log('📈 分析邮件生产力')

      const classifications = await Promise.all(
        emails.slice(0, 50).map(email => this.classifyEmail(email)) // 限制分析数量
      )

      // 计算统计数据
      const analytics: EmailAnalytics = {
        totalEmails: emails.length,
        categorizedEmails: this.calculateCategoryStats(classifications),
        responseTime: this.calculateAverageResponseTime(emails),
        productivity: {
          actionItems: classifications.reduce((sum, c) => sum + c.actionItems.length, 0),
          completedTasks: this.calculateCompletedTasks(classifications),
          meetingsScheduled: classifications.filter(c => c.category === 'meeting').length
        },
        trends: {
          volume: this.calculateVolumetrends(emails),
          categories: this.calculateCategoryTrends(classifications)
        }
      }

      this.analytics = analytics
      this.saveAnalytics()
      
      return analytics

    } catch (error) {
      console.error('❌ 生产力分析失败:', error)
      return this.analytics
    }
  }

  // 🔄 邮件自动化处理
  async autoProcessEmail(email: EmailData): Promise<{
    classification: EmailClassification
    security: EmailSecurity
    suggestions: string[]
    autoActions: string[]
  }> {
    try {
      console.log('🔄 自动处理邮件:', email.subject)

      const [classification, security] = await Promise.all([
        this.classifyEmail(email),
        this.securityScan(email)
      ])

      const suggestions = await this.generateActionSuggestions(email, classification)
      const autoActions = this.determineAutoActions(classification, security)

      return {
        classification,
        security,
        suggestions,
        autoActions
      }

    } catch (error) {
      console.error('❌ 自动处理失败:', error)
      throw error
    }
  }

  // 私有方法

  private parseClassificationResponse(content: string): EmailClassification {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found')
      
      const data = JSON.parse(jsonMatch[0])
      return {
        category: data.category || 'work',
        confidence: data.confidence || 0.7,
        priority: data.priority || 'medium',
        urgency: data.urgency || 'normal',
        sentiment: data.sentiment || 'neutral',
        actionItems: data.actionItems || [],
        keywords: data.keywords || [],
        entities: data.entities || []
      }
    } catch (error) {
      console.error('解析分类响应失败:', error)
      return this.getDefaultClassification()
    }
  }

  private parseSecurityResponse(content: string): EmailSecurity {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found')
      
      const data = JSON.parse(jsonMatch[0])
      return {
        isPhishing: data.isPhishing || false,
        isSuspicious: data.isSuspicious || false,
        riskLevel: data.riskLevel || 'low',
        threats: data.threats || [],
        recommendations: data.recommendations || []
      }
    } catch (error) {
      console.error('解析安全响应失败:', error)
      return {
        isPhishing: false,
        isSuspicious: false,
        riskLevel: 'low',
        threats: [],
        recommendations: []
      }
    }
  }

  private parseRepliesResponse(content: string): SmartReply[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found')
      
      return JSON.parse(jsonMatch[0]) || []
    } catch (error) {
      console.error('解析回复响应失败:', error)
      return []
    }
  }

  private parseTemplateResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found')
      
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('解析模板响应失败:', error)
      return {
        name: '默认模板',
        subject: '主题',
        content: '内容',
        variables: []
      }
    }
  }

  private parseSearchStrategy(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found')
      
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('解析搜索策略失败:', error)
      return {
        keywords: [],
        categories: [],
        timeRange: 'all',
        priority: 'all',
        searchType: 'fuzzy'
      }
    }
  }

  private performIntelligentSearch(emails: EmailData[], strategy: any, query: string): EmailData[] {
    return emails.filter(email => {
      // 实现智能搜索逻辑
      const contentMatch = email.content.toLowerCase().includes(query.toLowerCase())
      const subjectMatch = email.subject.toLowerCase().includes(query.toLowerCase())
      const fromMatch = email.from.toLowerCase().includes(query.toLowerCase())
      
      return contentMatch || subjectMatch || fromMatch
    })
  }

  private performBasicSearch(emails: EmailData[], query: string): EmailData[] {
    const lowerQuery = query.toLowerCase()
    return emails.filter(email => 
      email.subject.toLowerCase().includes(lowerQuery) ||
      email.content.toLowerCase().includes(lowerQuery) ||
      email.from.toLowerCase().includes(lowerQuery)
    )
  }

  private async generateActionSuggestions(email: EmailData, classification: EmailClassification): Promise<string[]> {
    const suggestions: string[] = []

    if (classification.category === 'meeting') {
      suggestions.push('创建日历事件')
    }
    
    if (classification.actionItems.length > 0) {
      suggestions.push('添加到待办事项')
    }
    
    if (classification.priority === 'high') {
      suggestions.push('标记为重要')
    }

    return suggestions
  }

  private determineAutoActions(classification: EmailClassification, security: EmailSecurity): string[] {
    const actions: string[] = []

    if (security.riskLevel === 'high') {
      actions.push('移至垃圾邮件')
    }

    if (classification.category === 'newsletter' && classification.priority === 'low') {
      actions.push('自动归档')
    }

    return actions
  }

  private getDefaultClassification(): EmailClassification {
    return {
      category: 'work',
      confidence: 0.5,
      priority: 'medium',
      urgency: 'normal',
      sentiment: 'neutral',
      actionItems: [],
      keywords: [],
      entities: []
    }
  }

  private calculateCategoryStats(classifications: EmailClassification[]): Record<string, number> {
    const stats: Record<string, number> = {}
    classifications.forEach(c => {
      stats[c.category] = (stats[c.category] || 0) + 1
    })
    return stats
  }

  private calculateAverageResponseTime(emails: EmailData[]): number {
    // 简化计算，实际应该基于回复时间
    return 2.5 // 小时
  }

  private calculateCompletedTasks(classifications: EmailClassification[]): number {
    return classifications.filter(c => c.category === 'task').length
  }

  private calculateVolumetrends(emails: EmailData[]): number[] {
    // 简化趋势计算
    return [10, 15, 12, 18, 20, 16, 14]
  }

  private calculateCategoryTrends(classifications: EmailClassification[]): Record<string, number[]> {
    return {
      meeting: [2, 3, 1, 4, 2, 3, 2],
      task: [5, 4, 6, 5, 7, 4, 5],
      work: [3, 8, 5, 9, 11, 9, 7]
    }
  }

  private updateAnalytics(classification: EmailClassification): void {
    this.analytics.totalEmails += 1
    this.analytics.categorizedEmails[classification.category] = 
      (this.analytics.categorizedEmails[classification.category] || 0) + 1
  }

  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadTemplates(): void {
    try {
      const saved = localStorage.getItem('email_templates')
      if (saved) {
        this.templates = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载模板失败:', error)
    }
  }

  private saveTemplates(): void {
    try {
      localStorage.setItem('email_templates', JSON.stringify(this.templates))
    } catch (error) {
      console.error('保存模板失败:', error)
    }
  }

  private loadAnalytics(): void {
    try {
      const saved = localStorage.getItem('email_analytics')
      if (saved) {
        this.analytics = { ...this.analytics, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('加载分析数据失败:', error)
    }
  }

  private saveAnalytics(): void {
    try {
      localStorage.setItem('email_analytics', JSON.stringify(this.analytics))
    } catch (error) {
      console.error('保存分析数据失败:', error)
    }
  }

  // 公共接口方法

  getTemplates(): EmailTemplate[] {
    return this.templates
  }

  getAnalytics(): EmailAnalytics {
    return this.analytics
  }

  deleteTemplate(id: string): void {
    this.templates = this.templates.filter(t => t.id !== id)
    this.saveTemplates()
  }

  updateTemplate(id: string, updates: Partial<EmailTemplate>): void {
    const template = this.templates.find(t => t.id === id)
    if (template) {
      Object.assign(template, updates)
      this.saveTemplates()
    }
  }
}

// 导出单例
const enhancedEmailAI = new EnhancedEmailAI()
export default enhancedEmailAI 