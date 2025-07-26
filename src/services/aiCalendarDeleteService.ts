// AI日历删除服务 - 处理删除日程的对话流程
import { CalendarEvent } from './calendarService'
import CalendarService from './calendarService'
import AIIntentService, { ParsedIntent, ConfirmationContext } from './aiIntentService'

export interface DeleteResponse {
  success: boolean
  message: string
  needsConfirmation?: boolean
  candidateEvents?: CalendarEvent[]
  suggestions?: string[]
  functionCalls?: Array<{
    name: string
    arguments: any
    success: boolean
    result?: any
  }>
}

class AICalendarDeleteService {
  
  // 🎯 主要删除处理入口
  public async processDeleteRequest(intent: ParsedIntent): Promise<DeleteResponse> {
    console.log('🗑️ 处理删除请求:', intent)
    
    try {
      // 搜索匹配的事件
      const candidateEvents = await this.findMatchingEvents(intent)
      
      if (candidateEvents.length === 0) {
        return this.createNoMatchResponse(intent)
      }
      
      if (candidateEvents.length === 1) {
        return this.createSingleEventConfirmation(candidateEvents[0], intent)
      }
      
      return this.createMultipleEventSelection(candidateEvents, intent)
      
    } catch (error) {
      console.error('删除请求处理失败:', error)
      return {
        success: false,
        message: '❌ 删除请求处理时发生错误，请稍后重试。',
        suggestions: ['重新尝试', '查看所有事件']
      }
    }
  }
  
  // 🔍 查找匹配的事件
  private async findMatchingEvents(intent: ParsedIntent): Promise<CalendarEvent[]> {
    const allEvents = CalendarService.getEvents()
    let matchingEvents = allEvents
    
    console.log('🔍 开始事件匹配，总事件数:', allEvents.length)
    console.log('🔍 匹配条件:', intent.entities)
    
    // 按事件标题过滤
    if (intent.entities.eventTitle) {
      const title = intent.entities.eventTitle.toLowerCase()
      matchingEvents = matchingEvents.filter(event => {
        const eventTitle = event.title.toLowerCase()
        return eventTitle.includes(title) || 
               title.includes(eventTitle) ||
               this.fuzzyMatch(eventTitle, title)
      })
      console.log('📝 按标题过滤后事件数:', matchingEvents.length)
    }
    
    // 按日期过滤
    if (intent.entities.date) {
      matchingEvents = this.filterByDate(matchingEvents, intent.entities.date)
      console.log('📅 按日期过滤后事件数:', matchingEvents.length)
    }
    
    // 按时间过滤
    if (intent.entities.time) {
      matchingEvents = this.filterByTime(matchingEvents, intent.entities.time)
      console.log('🕐 按时间过滤后事件数:', matchingEvents.length)
    }
    
    // 如果没有具体条件，但有日期信息，优先删除今天的事件
    if (!intent.entities.eventTitle && !intent.entities.date && matchingEvents.length > 5) {
      const todayEvents = this.filterByDate(matchingEvents, '今天')
      if (todayEvents.length > 0) {
        console.log('🎯 优先匹配今天的事件')
        return todayEvents
      }
    }
    
    console.log('✅ 最终匹配事件数:', matchingEvents.length)
    return matchingEvents
  }
  
  // 📅 按日期过滤事件
  private filterByDate(events: CalendarEvent[], dateStr: string): CalendarEvent[] {
    const now = new Date()
    let targetDate: Date
    
    switch (dateStr) {
      case '今天':
        targetDate = now
        break
      case '明天':
        targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        break
      case '后天':
        targetDate = new Date(now.getTime() + 48 * 60 * 60 * 1000)
        break
      case '昨天':
        targetDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      default:
        // 解析具体日期 (7.30, 7月30日等)
        targetDate = this.parseSpecificDate(dateStr)
        if (!targetDate) return events
    }
    
    return events.filter(event => 
      event.startTime.toDateString() === targetDate.toDateString()
    )
  }
  
  // 🕐 按时间过滤事件
  private filterByTime(events: CalendarEvent[], timeStr: string): CalendarEvent[] {
    // 简单的时间匹配逻辑
    if (timeStr.includes('上午')) {
      return events.filter(event => event.startTime.getHours() < 12)
    }
    if (timeStr.includes('下午')) {
      return events.filter(event => event.startTime.getHours() >= 12 && event.startTime.getHours() < 18)
    }
    if (timeStr.includes('晚上')) {
      return events.filter(event => event.startTime.getHours() >= 18)
    }
    
    // 解析具体时间点
    const hourMatch = timeStr.match(/(\d{1,2})[点时]/)
    if (hourMatch) {
      const hour = parseInt(hourMatch[1])
      return events.filter(event => event.startTime.getHours() === hour)
    }
    
    return events
  }
  
  // 📅 解析具体日期
  private parseSpecificDate(dateStr: string): Date | null {
    const now = new Date()
    
    // 匹配 7.30, 7/30, 7-30 格式
    const dateMatch = dateStr.match(/(\d{1,2})[\.\/\-](\d{1,2})/)
    if (dateMatch) {
      const month = parseInt(dateMatch[1]) - 1 // 月份从0开始
      const day = parseInt(dateMatch[2])
      const date = new Date(now.getFullYear(), month, day)
      
      // 如果日期已过，设为明年
      if (date < now) {
        date.setFullYear(now.getFullYear() + 1)
      }
      
      return date
    }
    
    // 匹配 7月30日 格式
    const monthDayMatch = dateStr.match(/(\d{1,2})月(\d{1,2})[日号]?/)
    if (monthDayMatch) {
      const month = parseInt(monthDayMatch[1]) - 1
      const day = parseInt(monthDayMatch[2])
      const date = new Date(now.getFullYear(), month, day)
      
      if (date < now) {
        date.setFullYear(now.getFullYear() + 1)
      }
      
      return date
    }
    
    return null
  }
  
  // 🔤 模糊匹配
  private fuzzyMatch(str1: string, str2: string): boolean {
    const minLength = Math.min(str1.length, str2.length)
    if (minLength < 2) return false
    
    // 计算相似度
    let matches = 0
    for (let i = 0; i < minLength; i++) {
      if (str1[i] === str2[i]) matches++
    }
    
    return matches / minLength > 0.6
  }
  
  // ❌ 创建无匹配响应
  private createNoMatchResponse(intent: ParsedIntent): DeleteResponse {
    let message = '❌ **未找到匹配的事件**\n\n'
    
    if (intent.entities.eventTitle) {
      message += `没有找到标题包含"${intent.entities.eventTitle}"的事件。\n\n`
    }
    
    if (intent.entities.date) {
      message += `${intent.entities.date}没有安排的事件。\n\n`
    }
    
    message += '💡 **建议**：\n'
    message += '• 检查事件名称是否正确\n'
    message += '• 尝试使用部分关键词\n'
    message += '• 查看所有事件列表'
    
    return {
      success: false,
      message,
      suggestions: ['查看所有事件', '重新输入', '今天的事件']
    }
  }
  
  // ✅ 创建单个事件确认
  private createSingleEventConfirmation(event: CalendarEvent, intent: ParsedIntent): DeleteResponse {
    // 设置确认上下文
    AIIntentService.setConfirmationContext({
      pendingAction: 'delete',
      targetEvents: [event],
      originalMessage: intent.originalMessage,
      timestamp: new Date()
    })
    
    const message = `🎯 **找到匹配的事件**\n\n` +
      `📅 **${event.title}**\n` +
      `🕐 ${event.startTime.toLocaleString('zh-CN')}\n` +
      `📍 ${event.location?.name || '未指定地点'}\n\n` +
      `❓ **确认删除这个事件吗？**\n\n` +
      `请回复"确认"或"取消"`
    
    return {
      success: true,
      message,
      needsConfirmation: true,
      candidateEvents: [event],
      suggestions: ['确认删除', '取消操作', '查看详情']
    }
  }
  
  // 📋 创建多事件选择
  private createMultipleEventSelection(events: CalendarEvent[], intent: ParsedIntent): DeleteResponse {
    if (events.length > 10) {
      // 太多事件，需要更具体的条件
      return {
        success: false,
        message: `🔍 **找到太多匹配事件 (${events.length}个)**\n\n` +
          `请提供更具体的信息：\n` +
          `• 事件的完整名称\n` +
          `• 具体的日期和时间\n` +
          `• 或者使用"删除今天的所有事件"`,
        suggestions: ['今天的事件', '明天的事件', '重新输入']
      }
    }
    
    // 显示候选事件列表
    let message = `🔍 **找到 ${events.length} 个匹配的事件**\n\n`
    
    events.slice(0, 5).forEach((event, index) => {
      message += `${index + 1}. **${event.title}**\n`
      message += `   🕐 ${event.startTime.toLocaleString('zh-CN')}\n`
      message += `   📍 ${event.location?.name || '未指定地点'}\n\n`
    })
    
    if (events.length > 5) {
      message += `... 还有 ${events.length - 5} 个事件\n\n`
    }
    
    // 如果匹配度高，提供批量删除选项
    if (intent.confidence > 0.8 && events.length <= 5) {
      AIIntentService.setConfirmationContext({
        pendingAction: 'delete',
        targetEvents: events,
        originalMessage: intent.originalMessage,
        timestamp: new Date()
      })
      
      message += `💡 **操作选项**：\n`
      message += `• 回复"确认"删除所有匹配的事件\n`
      message += `• 回复"取消"放弃操作\n`
      message += `• 提供更具体的事件名称`
      
      return {
        success: true,
        message,
        needsConfirmation: true,
        candidateEvents: events,
        suggestions: ['确认删除所有', '取消操作', '重新选择']
      }
    }
    
    message += `💡 **请提供更具体的信息**以选择要删除的事件`
    
    return {
      success: false,
      message,
      candidateEvents: events,
      suggestions: ['重新输入', '删除全部', '取消操作']
    }
  }
  
  // ✅ 执行确认的删除操作
  public async executeConfirmedDeletion(): Promise<DeleteResponse> {
    const context = AIIntentService.getConfirmationContext()
    
    if (!context || context.pendingAction !== 'delete') {
      return {
        success: false,
        message: '❌ 没有待确认的删除操作。',
        suggestions: ['重新开始', '查看事件']
      }
    }
    
    try {
      const deletedEvents: CalendarEvent[] = []
      let successCount = 0
      
      for (const event of context.targetEvents) {
        const success = CalendarService.deleteEvent(event.id)
        if (success) {
          deletedEvents.push(event)
          successCount++
          
          // 触发全局更新事件
          window.dispatchEvent(new CustomEvent('calendarEventsUpdated', {
            detail: { action: 'delete', eventId: event.id, source: 'AICalendarDeleteService' }
          }))
        }
      }
      
      // 清除确认上下文
      AIIntentService.clearConfirmationContext()
      
      if (successCount === 0) {
        return {
          success: false,
          message: '❌ 删除事件失败，请稍后重试。',
          suggestions: ['重新尝试', '查看事件']
        }
      }
      
      let message: string
      if (successCount === 1) {
        const event = deletedEvents[0]
        message = `✅ **事件删除成功！**\n\n` +
          `📅 **${event.title}**\n` +
          `🕐 ${event.startTime.toLocaleString('zh-CN')}\n\n` +
          `事件已从您的日历中移除。`
      } else {
        message = `✅ **批量删除成功！**\n\n` +
          `共删除了 **${successCount}** 个事件：\n` +
          deletedEvents.map(e => `• ${e.title}`).join('\n') + '\n\n' +
          `所有事件已从您的日历中移除。`
      }
      
      return {
        success: true,
        message,
        suggestions: ['查看今日日程', '添加新事件', '查看本周安排'],
        functionCalls: [{
          name: 'deleteCalendarEvent',
          arguments: { 
            eventIds: deletedEvents.map(e => e.id),
            count: successCount 
          },
          success: true,
          result: deletedEvents.length === 1 ? deletedEvents[0] : {
            deletedCount: successCount,
            events: deletedEvents
          }
        }]
      }
      
    } catch (error) {
      console.error('执行删除操作失败:', error)
      AIIntentService.clearConfirmationContext()
      
      return {
        success: false,
        message: '❌ 删除操作执行失败，请稍后重试。',
        suggestions: ['重新尝试', '查看事件']
      }
    }
  }
  
  // 🚫 取消删除操作
  public cancelDeletion(): DeleteResponse {
    const context = AIIntentService.getConfirmationContext()
    AIIntentService.clearConfirmationContext()
    
    if (!context) {
      return {
        success: true,
        message: '✅ 没有待取消的操作。',
        suggestions: ['查看事件', '创建新事件']
      }
    }
    
    return {
      success: true,
      message: `🚫 **删除操作已取消**\n\n` +
        `${context.targetEvents.length === 1 ? 
          `事件"${context.targetEvents[0].title}"已保留。` :
          `${context.targetEvents.length}个事件已保留。`
        }`,
      suggestions: ['查看事件', '重新删除', '创建新事件']
    }
  }
}

export default new AICalendarDeleteService() 