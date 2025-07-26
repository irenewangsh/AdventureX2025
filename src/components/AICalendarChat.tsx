import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, MapPin, Search, Globe, Loader2, Sparkles, ExternalLink, History, Settings, Terminal } from 'lucide-react'
import aiService, { AIResponse, AIRequestOptions } from '../services/aiService'
import MapService from '../services/mapService'
import chatHistoryService, { ChatMessage } from '../services/chatHistoryService'
import CalendarService from '../services/calendarService'
import TodoService from '../services/todoService'
import ChatHistoryPanel from './ChatHistoryPanel'

interface AICalendarChatProps {
  onLocationSelect?: (location: any) => void
  onEventCreate?: (eventData: any) => void
  onEventDelete?: (eventId: string) => void
  userLocation?: { latitude: number; longitude: number }
  context?: 'dashboard' | 'calendar'
  height?: number
  styles?: any // 添加样式参数
}

const AICalendarChat: React.FC<AICalendarChatProps> = ({
  onLocationSelect,
  onEventCreate,
  onEventDelete,
  userLocation,
  context = 'calendar',
  height = 500,
  styles
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 加载聊天历史
    loadChatHistory()
    
    // 如果没有历史消息，显示欢迎消息
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: '你好！我是你的智能日历助手。我具备长期记忆能力，能够：\n\n🧠 记住你的使用习惯\n📱 学习你的偏好设置\n🔄 与其他AI助手同步数据\n🗓️ 管理日程安排\n📍 推荐合适地点\n🌐 搜索最新信息\n⚡ 提供个性化建议\n\n我会记住我们所有的对话，让每次交流都更加智能！',
        sender: 'assistant',
        timestamp: new Date(),
        context
      }
      setMessages([welcomeMessage])
      // 不保存欢迎消息到历史记录
    }

    // 监听聊天历史变化，实现实时同步
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatHistory' && e.newValue) {
        loadChatHistory()
      }
    }

    // 监听AI删除事件请求
    const handleAIDeleteEvent = (event: any) => {
      const { eventId, eventTitle } = event.detail
      if (onEventDelete) {
        console.log('AI请求删除事件:', eventTitle, eventId)
        onEventDelete(eventId)
      } else {
        console.warn('⚠️ 警告: onEventDelete 回调不存在')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('aiDeleteEvent', handleAIDeleteEvent)
    
    // 每隔3秒检查聊天历史更新（用于同一标签页内的同步）
    const syncInterval = setInterval(loadChatHistory, 3000)

    // 初始化地图服务
    MapService.initialize().catch(console.warn)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('aiDeleteEvent', handleAIDeleteEvent)
      clearInterval(syncInterval)
    }
  }, [context])

  // 移除自动滚动，改为手动控制

  const loadChatHistory = () => {
    // 使用 'global' 作为共享聊天历史ID，实现跨页面同步
    const history = chatHistoryService.getMessages('global', 20)
    if (history.length > 0) {
      setMessages(history)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (message?: string, options: Partial<AIRequestOptions> = {}) => {
    const messageText = message || inputMessage.trim()
    if (!messageText) return

    setInputMessage('')
    setIsLoading(true)
    setShowOptions(false)

    // 添加用户消息到全局聊天历史
    const userMessage = chatHistoryService.addMessage({
      content: messageText,
      sender: 'user',
      context: 'global', // 使用全局上下文实现同步
      metadata: {
        location: userLocation,
        tags: extractTagsFromMessage(messageText)
      }
    })

    // 更新本地状态
    setMessages(prev => [...prev, userMessage])
    
    // 仅在用户发送消息时滚动
    setTimeout(() => scrollToBottom(), 100)

    try {
      // 获取用户档案用于个性化
      const userProfile = chatHistoryService.getUserProfile()
      const recentMessages = chatHistoryService.getMessages('global', 5) // 使用全局上下文
      
      // 构建增强的AI请求选项
      const aiOptions: AIRequestOptions = {
        includeLocation: true,
        includeSearch: options.includeSearch || messageText.includes('搜索') || messageText.includes('查找'),
        includeWeather: messageText.includes('天气'),
        userLocation: userLocation
      }

      // 创建包含历史记忆的提示词
      const enhancedPrompt = buildMemoryEnhancedPrompt(messageText, userProfile, recentMessages)

      // 调用AI服务
      const response = await aiService.chat(enhancedPrompt, aiOptions)

      // 处理AI函数调用结果（新机制）
      if (response.functionCalls && response.functionCalls.length > 0) {
        console.log("✅ AICalendarChat收到AI函数调用结果:", response.functionCalls)
        
        // AI服务已经处理了事件创建和删除，这里只需要响应结果
        for (const functionCall of response.functionCalls) {
          if (functionCall.name === "createCalendarEvent" && functionCall.success) {
            console.log("📅 AICalendarChat确认事件创建成功:", functionCall.result)
            
            // 通知父组件有新事件创建（传递AI服务创建的事件）
            if (onEventCreate) {
              console.log("调用父组件回调 onEventCreate")
              onEventCreate(functionCall.result)
            } else {
              console.log("⚠️ 警告: onEventCreate 回调不存在")
            }
          } else if (functionCall.name === "deleteCalendarEvent" && functionCall.success) {
            console.log("🗑️ AICalendarChat确认事件删除成功:", functionCall.result)
            
            // 处理单个事件删除
            if (functionCall.result && functionCall.result.id && onEventDelete) {
              console.log("调用父组件回调 onEventDelete (单个事件)")
              onEventDelete(functionCall.result.id)
            } 
            // 处理批量删除
            else if (functionCall.result && functionCall.result.events && Array.isArray(functionCall.result.events)) {
              console.log("处理批量删除事件")
              // 触发页面刷新或全局事件更新
              window.dispatchEvent(new CustomEvent('calendarEventsUpdated', {
                detail: { action: 'batchDelete', deletedCount: functionCall.result.deletedCount, source: 'AICalendarChat' }
              }))
            } else {
              console.log("⚠️ 警告: 事件删除回调处理异常，结果:", functionCall.result)
            }
          }
        }
      }

            const assistantMessage = chatHistoryService.addMessage({
        content: response.content,
        sender: 'assistant',
        context: 'global', // 使用全局上下文实现同步
        metadata: {
          tags: response.suggestions || []
        }
      })

      // 更新本地状态，包含响应数据
      const messageWithResponse = {
        ...assistantMessage,
        response
      }

      setMessages(prev => [...prev, messageWithResponse])
    } catch (error) {
      console.error('AI聊天失败:', error)
      
      // 添加错误回复到全局聊天历史
      const errorMessage = chatHistoryService.addMessage({
        content: '抱歉，我现在无法处理您的请求。但我会记住这次对话，请稍后再试。',
        sender: 'assistant',
        context: 'global' // 使用全局上下文实现同步
      })

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const buildMemoryEnhancedPrompt = (message: string, userProfile: any, recentMessages: ChatMessage[]) => {
    let enhancedPrompt = message

    // 添加用户偏好信息
    if (userProfile.preferences) {
      const prefs = userProfile.preferences
      enhancedPrompt += `\n\n[用户偏好记忆] 工作时间: ${prefs.workingHours?.start}-${prefs.workingHours?.end}, 偏好会议类型: ${prefs.preferredMeetingTypes?.join(', ')}`
    }

    // 添加用户习惯
    if (userProfile.habits) {
      const habits = userProfile.habits
      if (Object.keys(habits.commonEventDurations).length > 0) {
        enhancedPrompt += `\n[习惯记忆] 常用事件时长: ${JSON.stringify(habits.commonEventDurations)}`
      }
    }

    // 添加近期对话上下文
    if (recentMessages.length > 0) {
      const recentContext = recentMessages
        .slice(-3)
        .map(msg => `${msg.sender}: ${msg.content.slice(0, 100)}`)
        .join('\n')
      enhancedPrompt += `\n\n[对话记忆]\n${recentContext}`
    }

    return enhancedPrompt
  }

  const extractTagsFromMessage = (message: string): string[] => {
    const tags: string[] = []
    const commonTags = ['工作', '会议', '个人', '旅行', '健康', '学习', '娱乐', '约会', '聚餐']
    
    commonTags.forEach(tag => {
      if (message.includes(tag)) {
        tags.push(tag)
      }
    })

    return tags
  }

  const handleSelectConversation = (conversationId: string) => {
    chatHistoryService.switchConversation(conversationId)
    setCurrentConversationId(conversationId)
    loadChatHistory()
  }

  const handleNewConversation = () => {
    const newId = chatHistoryService.createNewConversation()
    setCurrentConversationId(newId)
    setMessages([])
    setShowOptions(true)
    setShowHistoryPanel(false)
  }

  const quickActions = [
    {
      label: '推荐会议地点',
      icon: <MapPin className="w-4 h-4" />,
      message: '根据我的历史偏好，推荐一些适合开会的地点',
      options: { includeLocation: true }
    },
    {
      label: '查询天气',
      icon: <Globe className="w-4 h-4" />,
      message: '今天的天气怎么样？适合安排什么活动？',
      options: { includeWeather: true }
    },
    {
      label: '搜索附近餐厅',
      icon: <Search className="w-4 h-4" />,
      message: '根据我的用餐习惯，搜索附近的餐厅推荐',
      options: { includeSearch: true, includeLocation: true }
    },
    {
      label: '智能日程规划',
      icon: <Sparkles className="w-4 h-4" />,
      message: '根据我的工作习惯，帮我安排明天的智能日程',
      options: {}
    }
  ]

  const renderMessage = (message: ChatMessage & { response?: AIResponse }) => {
    const isAssistant = message.sender === 'assistant'
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div className={`flex items-start space-x-3 max-w-[85%] ${
          isAssistant ? '' : 'flex-row-reverse space-x-reverse'
        }`}>
          {/* 头像 - 使用主题样式 */}
          <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${themeStyles.fontMono}`}
               style={{ 
                 backgroundColor: isAssistant ? themeStyles.accent + '20' : themeStyles.accent + '40',
                 color: themeStyles.accent,
                 borderRadius: themeStyles.borderRadius
               }}>
            {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>

          {/* 消息内容 - 使用主题样式 */}
          <div className={`px-4 py-3 ${themeStyles.fontMono}`}
               style={{
                 backgroundColor: isAssistant ? themeStyles.card.split(' ')[0].replace('bg-', '') : themeStyles.accent,
                 border: isAssistant ? `1px solid ${themeStyles.accent}40` : 'none',
                 color: isAssistant ? themeStyles.text.split(' ')[0].replace('text-', '') : '#ffffff',
                 borderRadius: themeStyles.borderRadius
               }}>
            {/* 消息文本 */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>

            {/* AI响应的额外信息 */}
            {isAssistant && message.response && (
              <div className="mt-3 space-y-3">
                {/* 建议操作 */}
                {message.response.suggestions && message.response.suggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">建议操作：</p>
                    <div className="flex flex-wrap gap-1">
                      {message.response.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(suggestion)}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 推荐地点 */}
                {message.response.locations && message.response.locations.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">推荐地点：</p>
                    <div className="space-y-2">
                      {message.response.locations.map((location, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 border rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => onLocationSelect?.(location)}
                        >
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {location.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {location.address}
                              </p>
                              <div className="flex items-center mt-1">
                                <div 
                                  className="w-2 h-2 bg-green-500 rounded-full mr-1"
                                  style={{ opacity: location.relevance }}
                                />
                                <span className="text-xs text-gray-400">
                                  相关度 {Math.round(location.relevance * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 搜索结果 */}
                {message.response.searchResults && message.response.searchResults.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">相关搜索：</p>
                    <div className="space-y-2">
                      {message.response.searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 border rounded-lg p-3"
                        >
                          <div className="flex items-start space-x-2">
                            <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-blue-700 truncate">
                                {result.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {result.snippet}
                              </p>
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:text-blue-700 mt-1 inline-block"
                              >
                                查看详情 →
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 时间戳 - 使用主题样式 */}
            <div className={`text-xs mt-2 ${themeStyles.fontMono}`}
                 style={{ 
                   color: isAssistant ? themeStyles.textLight.split(' ')[0].replace('text-', '') : '#ffffff80'
                 }}>
              {message.timestamp.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // 使用主题样式，如果没有提供则使用默认样式
  const themeStyles = styles || {
    bg: 'bg-gray-50',
    card: 'bg-white border border-gray-200',
    text: 'text-gray-900',
    textLight: 'text-gray-500',
    accent: '#666666',
    button: 'bg-gray-100 hover:bg-gray-200 text-gray-600',
    fontMono: 'font-mono',
    borderRadius: '8px'
  }

  return (
    <div className={`flex flex-col h-full ${themeStyles.bg}`} style={{ height: `${height}px`, fontFamily: themeStyles.fontSecondary }}>
      {/* 头部 - 使用主题样式 */}
      <div className={`${themeStyles.card} px-4 py-3 border-b`} style={{ borderRadius: `${themeStyles.borderRadius} ${themeStyles.borderRadius} 0 0` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 flex items-center justify-center ${themeStyles.fontMono}`} 
                 style={{ 
                   backgroundColor: themeStyles.accent + '20', 
                   borderRadius: themeStyles.borderRadius,
                   color: themeStyles.accent 
                 }}>
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-medium ${themeStyles.text} ${themeStyles.fontMono}`}>// AI日历助手</h3>
              <p className={`text-xs ${themeStyles.textLight} ${themeStyles.fontMono}`}>
                {aiService.isServiceConfigured() ? '在线模式' : '演示模式'} • 具备长期记忆
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistoryPanel(true)}
              className={`p-2 transition-colors ${themeStyles.fontMono}`}
              style={{ 
                backgroundColor: 'transparent',
                color: themeStyles.accent,
                borderRadius: themeStyles.borderRadius
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.accent + '20'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="查看聊天历史"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={handleNewConversation}
              className={`p-2 transition-colors ${themeStyles.fontMono}`}
              style={{ 
                backgroundColor: 'transparent',
                color: themeStyles.accent,
                borderRadius: themeStyles.borderRadius
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.accent + '20'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="新建对话"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(renderMessage)}
        
        {/* 加载指示器 */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-4"
          >
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">正在思考并回忆相关信息...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 快速操作（初次使用时显示） */}
      <AnimatePresence>
        {showOptions && messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-3 bg-white border-t border-gray-200"
          >
            <p className="text-xs text-gray-500 mb-3">智能建议（基于记忆）：</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(action.message, action.options)}
                  className="flex items-center space-x-2 p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  {action.icon}
                  <span className="truncate">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 输入框 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="输入消息... (我会记住所有对话)"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
          
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 聊天历史面板 */}
      <ChatHistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        context={context}
      />
    </div>
  )
}

export default AICalendarChat 