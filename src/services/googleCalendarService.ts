
import { gapi } from 'gapi-script'

export interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{ email: string }>
  recurrence?: string[]
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
}

export interface GoogleCalendar {
  id: string
  summary: string
  description?: string
  timeZone: string
  primary?: boolean
  accessRole: string
  backgroundColor?: string
  foregroundColor?: string
}

class GoogleCalendarService {
  private isInitialized = false
  private accessToken: string | null = null

  // 初始化 Google API
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await new Promise<void>((resolve, reject) => {
        gapi.load('client:auth2', {
          callback: resolve,
          onerror: reject
        })
      })

      await gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar'
      })

      this.isInitialized = true
      this.accessToken = localStorage.getItem('google_access_token')
      
      if (this.accessToken) {
        gapi.client.setToken({ access_token: this.accessToken })
      }
    } catch (error) {
      console.error('Google API 初始化失败:', error)
      throw new Error('Google 日历服务初始化失败')
    }
  }

  // 检查是否已授权
  isAuthenticated(): boolean {
    return !!this.accessToken && gapi.auth2?.getAuthInstance()?.isSignedIn?.get()
  }

  // 获取用户日历列表
  async getCalendars(): Promise<GoogleCalendar[]> {
    await this.ensureAuthenticated()
    
    try {
      const response = await gapi.client.calendar.calendarList.list({
        minAccessRole: 'owner'
      })
      
      return response.result.items || []
    } catch (error) {
      console.error('获取日历列表失败:', error)
      throw new Error('获取 Google 日历列表失败')
    }
  }

  // 获取主日历事件
  async getEvents(
    calendarId: string = 'primary',
    timeMin?: Date,
    timeMax?: Date,
    maxResults: number = 250
  ): Promise<GoogleCalendarEvent[]> {
    await this.ensureAuthenticated()
    
    try {
      const params: any = {
        calendarId,
        maxResults,
        orderBy: 'startTime',
        singleEvents: true
      }
      
      if (timeMin) {
        params.timeMin = timeMin.toISOString()
      }
      
      if (timeMax) {
        params.timeMax = timeMax.toISOString()
      }
      
      const response = await gapi.client.calendar.events.list(params)
      return response.result.items || []
    } catch (error) {
      console.error('获取日历事件失败:', error)
      throw new Error('获取 Google 日历事件失败')
    }
  }

  // 创建事件
  async createEvent(
    event: GoogleCalendarEvent,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> {
    await this.ensureAuthenticated()
    
    try {
      const response = await gapi.client.calendar.events.insert({
        calendarId,
        resource: event
      })
      
      return response.result
    } catch (error) {
      console.error('创建事件失败:', error)
      throw new Error('创建 Google 日历事件失败')
    }
  }

  // 更新事件
  async updateEvent(
    eventId: string,
    event: GoogleCalendarEvent,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> {
    await this.ensureAuthenticated()
    
    try {
      const response = await gapi.client.calendar.events.update({
        calendarId,
        eventId,
        resource: event
      })
      
      return response.result
    } catch (error) {
      console.error('更新事件失败:', error)
      throw new Error('更新 Google 日历事件失败')
    }
  }

  // 删除事件
  async deleteEvent(
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<void> {
    await this.ensureAuthenticated()
    
    try {
      await gapi.client.calendar.events.delete({
        calendarId,
        eventId
      })
    } catch (error) {
      console.error('删除事件失败:', error)
      throw new Error('删除 Google 日历事件失败')
    }
  }

  // 批量同步事件
  async syncEvents(localEvents: any[], calendarId: string = 'primary'): Promise<{
    created: number
    updated: number
    deleted: number
    errors: string[]
  }> {
    await this.ensureAuthenticated()
    
    const result = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [] as string[]
    }

    try {
      // 获取 Google 日历中的所有事件
      const googleEvents = await this.getEvents(calendarId)
      const googleEventMap = new Map(googleEvents.map(e => [e.id!, e]))
      
      // 同步本地事件到 Google
      for (const localEvent of localEvents) {
        try {
          const googleEvent = this.convertToGoogleEvent(localEvent)
          
          if (localEvent.googleId && googleEventMap.has(localEvent.googleId)) {
            // 更新现有事件
            await this.updateEvent(localEvent.googleId, googleEvent, calendarId)
            result.updated++
          } else {
            // 创建新事件
            const created = await this.createEvent(googleEvent, calendarId)
            localEvent.googleId = created.id
            result.created++
          }
        } catch (error) {
          result.errors.push(`同步事件 "${localEvent.title}" 失败: ${error}`)
        }
      }
      
      return result
    } catch (error) {
      console.error('批量同步失败:', error)
      throw new Error('批量同步 Google 日历失败')
    }
  }

  // 将本地事件转换为 Google 事件格式
  private convertToGoogleEvent(localEvent: any): GoogleCalendarEvent {
    const event: GoogleCalendarEvent = {
      summary: localEvent.title,
      description: localEvent.description,
      location: localEvent.location
    }

    if (localEvent.allDay) {
      event.start = {
        date: localEvent.startTime.toISOString().split('T')[0],
        timeZone: localEvent.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      }
      event.end = {
        date: localEvent.endTime.toISOString().split('T')[0],
        timeZone: localEvent.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    } else {
      event.start = {
        dateTime: localEvent.startTime.toISOString(),
        timeZone: localEvent.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      }
      event.end = {
        dateTime: localEvent.endTime.toISOString(),
        timeZone: localEvent.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }

    // 处理重复事件
    if (localEvent.recurring) {
      event.recurrence = this.convertToGoogleRecurrence(localEvent.recurring)
    }

    // 处理提醒
    if (localEvent.reminders && localEvent.reminders.length > 0) {
      event.reminders = {
        useDefault: false,
        overrides: localEvent.reminders.map((r: any) => ({
          method: r.type === 'email' ? 'email' : 'popup',
          minutes: r.minutes
        }))
      }
    }

    // 处理参与者
    if (localEvent.attendees && localEvent.attendees.length > 0) {
      event.attendees = localEvent.attendees.map((email: string) => ({ email }))
    }

    return event
  }

  // 转换重复规则为 Google 格式
  private convertToGoogleRecurrence(recurring: any): string[] {
    const rules = []
    
    switch (recurring.type) {
      case 'daily':
        rules.push(`RRULE:FREQ=DAILY;INTERVAL=${recurring.interval || 1}`)
        break
      case 'weekly':
        rules.push(`RRULE:FREQ=WEEKLY;INTERVAL=${recurring.interval || 1}`)
        break
      case 'monthly':
        rules.push(`RRULE:FREQ=MONTHLY;INTERVAL=${recurring.interval || 1}`)
        break
      case 'yearly':
        rules.push(`RRULE:FREQ=YEARLY;INTERVAL=${recurring.interval || 1}`)
        break
    }
    
    if (recurring.endDate) {
      const endDate = new Date(recurring.endDate).toISOString().split('T')[0].replace(/-/g, '')
      rules[0] += `;UNTIL=${endDate}`
    }
    
    return rules
  }

  // 确保已认证
  private async ensureAuthenticated(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
    
    if (!this.isAuthenticated()) {
      throw new Error('Google 日历未授权，请先登录')
    }
  }
}

export default new GoogleCalendarService()
