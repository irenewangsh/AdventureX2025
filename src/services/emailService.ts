// 邮件服务 - 集成 Zero 邮件功能
import CalendarService, { CalendarEvent } from './calendarService'
import aiService from './aiService'

export interface EmailData {
  id: string
  subject: string
  content: string
  from: string
  to: string[]
  date: Date
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  contentType: string
  size: number
  data?: Buffer
}

export interface MeetingInvite {
  event: CalendarEvent
  attendees: string[]
  subject: string
  body: string
}

class EmailService {
  private isConfigured: boolean = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    // 检查邮件服务配置
    this.isConfigured = !!(
      import.meta.env.VITE_EMAIL_SERVICE_API_KEY ||
      import.meta.env.VITE_SMTP_HOST
    )
    console.log('📧 邮件服务初始化:', this.isConfigured ? '✅ 已配置' : '❌ 未配置')
  }

  // 🔍 从邮件中智能提取日历事件
  async extractEventsFromEmail(email: EmailData): Promise<CalendarEvent[]> {
    try {
      console.log('🔍 正在从邮件中提取事件:', email.subject)

      // 使用 AI 分析邮件内容
      const prompt = `
请分析以下邮件内容，提取所有可能的日历事件信息：

邮件主题: ${email.subject}
发件人: ${email.from}
邮件内容: ${email.content}

请识别：
1. 会议时间（日期和时间）
2. 会议标题
3. 参与者
4. 地点
5. 会议描述

返回 JSON 格式的事件数组。如果没有找到事件信息，返回空数组。
`

      const aiResponse = await aiService.chat(prompt, {
        includeTime: true,
        includeLocation: false
      })

      // 解析 AI 返回的事件信息
      const events = this.parseEventsFromAIResponse(aiResponse.content, email)
      
      console.log(`✅ 从邮件中提取到 ${events.length} 个事件`)
      return events

    } catch (error) {
      console.error('❌ 邮件事件提取失败:', error)
      return []
    }
  }

  // 📅 智能创建会议邀请
  async createMeetingInvite(event: CalendarEvent, attendees: string[]): Promise<MeetingInvite> {
    const subject = `会议邀请：${event.title}`
    
    const body = `
尊敬的与会者，

您收到了一个会议邀请：

📅 会议主题：${event.title}
🕐 会议时间：${event.startTime.toLocaleString('zh-CN')} - ${event.endTime.toLocaleString('zh-CN')}
📍 会议地点：${event.location?.name || '待定'}
📝 会议描述：${event.description || '无'}

参与者：${attendees.join(', ')}

请确认您的参与情况。

此邮件由智能日历系统自动发送。
`

    return {
      event,
      attendees,
      subject,
      body
    }
  }

  // 📨 发送邮件提醒
  async sendEventReminder(event: CalendarEvent, reminderType: 'before' | 'starting' | 'followup'): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        console.warn('⚠️ 邮件服务未配置，无法发送提醒')
        return false
      }

      const reminderContent = this.generateReminderContent(event, reminderType)
      
      // 这里集成实际的邮件发送逻辑
      // 可以集成 Zero 的邮件发送功能
      console.log('📨 发送事件提醒:', reminderContent.subject)
      
      return true
    } catch (error) {
      console.error('❌ 邮件提醒发送失败:', error)
      return false
    }
  }

  // 🔄 与 Zero 邮件数据同步
  async syncWithZeroEmail(): Promise<void> {
    try {
      console.log('🔄 开始与 Zero 邮件同步')
      
      // 1. 从 Zero 获取最新邮件
      const recentEmails = await this.fetchRecentEmails()
      
      // 2. 分析邮件中的日历相关内容
      for (const email of recentEmails) {
        const events = await this.extractEventsFromEmail(email)
        
        // 3. 自动创建日历事件
        for (const event of events) {
          const existingEvent = CalendarService.findEventByTitle(event.title)
          if (!existingEvent) {
            CalendarService.createEvent(event)
            console.log('✅ 从邮件自动创建事件:', event.title)
          }
        }
      }
      
      console.log('✅ 邮件同步完成')
    } catch (error) {
      console.error('❌ 邮件同步失败:', error)
    }
  }

  // 🤖 AI 邮件助手
  async getEmailSuggestions(context: CalendarEvent): Promise<string[]> {
    try {
      const prompt = `
基于以下日历事件，为我生成相关的邮件建议：

事件：${context.title}
时间：${context.startTime.toLocaleString('zh-CN')}
描述：${context.description || '无'}

请提供：
1. 会议前准备邮件模板
2. 会议邀请邮件模板  
3. 会议后跟进邮件模板

每个模板应该简洁专业。
`

      const response = await aiService.chat(prompt)
      return this.parseEmailSuggestions(response.content)
    } catch (error) {
      console.error('❌ 邮件建议生成失败:', error)
      return []
    }
  }

  // 🔍 邮件搜索和过滤
  async searchEmails(query: string, filters?: {
    dateRange?: { start: Date; end: Date }
    hasCalendarContent?: boolean
    from?: string
  }): Promise<EmailData[]> {
    try {
      console.log('🔍 搜索邮件:', query)
      
      // 集成 Zero 的邮件搜索功能
      // 这里可以调用 Zero 的搜索 API
      
      return []
    } catch (error) {
      console.error('❌ 邮件搜索失败:', error)
      return []
    }
  }

  // 私有方法

  private parseEventsFromAIResponse(aiContent: string, email: EmailData): CalendarEvent[] {
    try {
      // 尝试从 AI 响应中解析 JSON
      const jsonMatch = aiContent.match(/\[.*\]/s)
      if (!jsonMatch) return []

      const eventsData = JSON.parse(jsonMatch[0])
      
      return eventsData.map((eventData: any) => ({
        id: CalendarService.generateId(),
        title: eventData.title || email.subject,
        description: `来自邮件: ${email.subject}\n发件人: ${email.from}\n\n${eventData.description || ''}`,
        startTime: new Date(eventData.startTime || Date.now()),
        endTime: new Date(eventData.endTime || Date.now() + 60*60*1000),
        allDay: eventData.allDay || false,
        category: 'meeting' as const,
        color: '#f59e0b',
        location: eventData.location ? { name: eventData.location } : undefined,
        attendees: eventData.attendees || [],
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    } catch (error) {
      console.error('解析事件数据失败:', error)
      return []
    }
  }

  private generateReminderContent(event: CalendarEvent, type: 'before' | 'starting' | 'followup') {
    const templates = {
      before: {
        subject: `提醒：${event.title} 即将开始`,
        body: `您好，\n\n您的会议"${event.title}"将在 ${event.startTime.toLocaleString('zh-CN')} 开始。\n\n请做好准备。`
      },
      starting: {
        subject: `会议开始：${event.title}`,
        body: `您好，\n\n您的会议"${event.title}"现在开始。\n\n会议地点：${event.location?.name || '线上'}`
      },
      followup: {
        subject: `会议跟进：${event.title}`,
        body: `您好，\n\n感谢您参加"${event.title}"会议。\n\n如有后续事项，请及时跟进。`
      }
    }

    return templates[type]
  }

  private async fetchRecentEmails(): Promise<EmailData[]> {
    // 集成 Zero 的邮件获取 API
    // 这里需要根据 Zero 的实际 API 进行调用
    return []
  }

  private parseEmailSuggestions(content: string): string[] {
    // 解析 AI 生成的邮件建议
    const suggestions = content.split('\n').filter(line => 
      line.trim() && !line.startsWith('#') && !line.startsWith('*')
    )
    return suggestions.slice(0, 5) // 返回前5个建议
  }

  // 检查服务状态
  isServiceConfigured(): boolean {
    return this.isConfigured
  }
}

// 导出单例
const emailService = new EmailService()
export default emailService 