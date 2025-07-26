
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Send, Bot, User, Terminal, Coffee, Moon, Gamepad2, Briefcase, Heart, Zap, Star, Sparkles, Brain } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import Calendar from '../components/Calendar'
import TodoList from '../components/TodoList'
import TypewriterText from '../components/TypewriterText'
import AICalendarChat from '../components/AICalendarChat'
import SmartSchedulePanel from '../components/SmartSchedulePanel'
import { useAppContext, CareerType, ViewMode } from '../App'
import { getCareerStyles, getCareerConfig, getCareerDecorations } from '../utils/careerConfig'
import CalendarService, { CalendarEvent } from '../services/calendarService'
import TodoService, { Todo } from '../services/todoService'
import aiService from '../services/aiService'
import chatHistoryService from '../services/chatHistoryService'
import MapService from '../services/mapService'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

type UserStatus = 'working' | 'break' | 'focused' | 'meeting' | 'offline'

function Dashboard() {
  const navigate = useNavigate()
  const { career } = useAppContext()
  // 状态管理
  const [menuOpen, setMenuOpen] = useState(false)
  const [isChatMode, setIsChatMode] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showSyncNotification, setShowSyncNotification] = useState(false)
  const [showSmartAnalysis, setShowSmartAnalysis] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [statusCommands, setStatusCommands] = useState<string[]>([])
  const [commandPrefix, setCommandPrefix] = useState('')
  const [showWelcomeText, setShowWelcomeText] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [userStatus, setUserStatus] = useState<UserStatus>('working')
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const careerConfig = getCareerConfig(career)
  const styles = getCareerStyles(career)
  const decorations = getCareerDecorations(career)

  const userName = "张小明"
  const userLocationName = "工作台"

  // 获取用户地理位置
  useEffect(() => {
    MapService.getCurrentLocation()
      .then(location => {
        if (location && location.latitude && location.longitude) {
          setUserLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          })
          console.log('用户位置获取成功:', location.address)
        }
      })
      .catch(error => {
        console.warn('无法获取用户地理位置:', error)
        toast.error('无法获取地理位置，AI功能可能受限')
      })
  }, [])

  // 加载聊天历史 - 使用全局聊天历史实现同步
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        // 使用 'global' 作为共享聊天历史ID，实现跨页面同步
        const history = chatHistoryService.getMessages('global')
        if (history.length > 0) {
          const formattedMessages = history.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp)
          }))
          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error('加载聊天历史失败:', error)
      }
    }

    loadChatHistory()

    // 监听聊天历史变化，实现实时同步
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatHistory' && e.newValue) {
        loadChatHistory()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // 每隔5秒检查聊天历史更新（用于同一标签页内的同步）
    const syncInterval = setInterval(loadChatHistory, 5000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(syncInterval)
    }
  }, [])

  // 加载日历事件
  useEffect(() => {
    const calendarEvents = CalendarService.getEvents()
    console.log('Dashboard 初始加载事件数量:', calendarEvents.length)
    setEvents(calendarEvents)

    // 监听全局事件更新
    const handleGlobalEventUpdate = (event: CustomEvent) => {
      console.log('Dashboard 接收到全局事件更新:', event.detail)
      const updatedEvents = CalendarService.getEvents()
      console.log('Dashboard 刷新后事件数量:', updatedEvents.length)
      setEvents(updatedEvents)
    }

    window.addEventListener('calendarEventsUpdated', handleGlobalEventUpdate as EventListener)

    return () => {
      window.removeEventListener('calendarEventsUpdated', handleGlobalEventUpdate as EventListener)
    }
  }, [])

  // 处理待办事项变化时的同步
  const handleTodoChange = () => {
    const calendarEvents = CalendarService.getEvents()
    setEvents(calendarEvents)
    setShowSyncNotification(true)
    setTimeout(() => setShowSyncNotification(false), 3000)
    toast.success('待办事项已同步到日历！')
  }

  // 状态配置
  const statusConfig = {
    working: { 
      icon: careerConfig.icon, 
      color: styles.primary, 
      emoji: careerConfig.emoji, 
      label: careerConfig.statusLabels.working,
      signature: `专注${careerConfig.statusLabels.working}，追求专业卓越`,
      welcomeText: careerConfig.welcomeTexts[0] || '准备开始今天的工作？'
    },
    break: { 
      icon: Coffee, 
      color: '#f59e0b', 
      emoji: '☕', 
      label: careerConfig.statusLabels.break,
      signature: `${careerConfig.statusLabels.break}，放松身心`,
      welcomeText: '适当休息，保持最佳状态'
    },
    focused: { 
      icon: Zap, 
      color: styles.accent, 
      emoji: '⚡', 
      label: careerConfig.statusLabels.focused,
      signature: `${careerConfig.statusLabels.focused}，全神贯注`,
      welcomeText: '专注模式，高效完成任务'
    },
    meeting: { 
      icon: User, 
      color: '#10b981', 
      emoji: '👥', 
      label: careerConfig.statusLabels.meeting,
      signature: `${careerConfig.statusLabels.meeting}，团队协作`,
      welcomeText: '团队合作，共创佳绩'
    },
    offline: { 
      icon: Moon, 
      color: '#6b7280', 
      emoji: '🌙', 
      label: careerConfig.statusLabels.offline,
      signature: `${careerConfig.statusLabels.offline}，享受生活`,
      welcomeText: '工作之外，享受美好时光'
    }
  }

  const currentStatus = statusConfig[userStatus]

  // 初始化动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      setTimeout(() => setShowWelcomeText(true), 300)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // 滚动到最新消息 - 仅在用户发送消息时滚动
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // AI聊天功能 - 使用真正的AI服务
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: chatMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setChatMessage('')
    setIsLoading(true)
    setIsChatMode(true)
    
    // 只在用户发送消息时滚动
    setTimeout(() => scrollToBottom(), 100)

    try {
      // 保存用户消息到全局聊天历史
      chatHistoryService.addMessage({
        content: userMessage.content,
        sender: 'user',
        context: 'global'
      })

      // 检查AI服务配置
      if (!aiService.isServiceConfigured()) {
        const assistantReply: Message = {
          id: (Date.now() + 1).toString(),
          content: `🤖 AI助手当前运行在演示模式下。\n\n作为专业${careerConfig.name}，我建议你：\n1. 专注当前任务，保持高效状态\n2. 合理安排时间，劳逸结合\n3. 定期回顾和总结工作进展\n\n如需完整AI功能，请配置OpenAI API密钥。`,
          sender: 'assistant',
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantReply])
        
        // 保存助手回复到全局聊天历史
        chatHistoryService.addMessage({
          content: assistantReply.content,
          sender: 'assistant',
          context: 'global'
        })
        
        setIsLoading(false)
        return
      }

            // 使用AI服务获取回复
      const aiResponse = await aiService.chat(userMessage.content, {
        includeLocation: true,
        userLocation: userLocation,
        includeTime: true,
        includeWeather: false,
        includeWebSearch: false,
        conversationContext: {
          userId: 'dashboard-user',
          sessionId: 'dashboard',
          userPreferences: {
            career: careerConfig.name,
            location: userLocationName,
            timezone: 'Asia/Shanghai'
          }
        }
      })

              // 处理AI函数调用（新机制）
        if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
          console.log('✅ Dashboard收到AI函数调用结果:', aiResponse.functionCalls)
          
          // AI服务已经处理了事件创建，这里只需要响应结果
          for (const functionCall of aiResponse.functionCalls) {
            if (functionCall.name === 'createCalendarEvent' && functionCall.success) {
              console.log('📅 Dashboard确认事件创建成功:', functionCall.result)
              
              // 刷新本地事件列表（AI服务已触发全局更新）
              const updatedEvents = CalendarService.getEvents()
              console.log('Dashboard 刷新事件列表, 总事件数:', updatedEvents.length)
              setEvents(updatedEvents)
            }
          }
        }

      const assistantReply: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantReply])
      
       // 保存助手回复到全局聊天历史
       chatHistoryService.addMessage({
         content: assistantReply.content,
         sender: 'assistant',
         context: 'global'
       })

       // 学习功能已在addMessage中自动处理
      
    } catch (error) {
      console.error('AI聊天错误:', error)
      
      const errorReply: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ 抱歉，AI服务暂时不可用。\n\n作为${careerConfig.name}助手，我建议你：\n- 检查网络连接\n- 稍后重试\n- 或使用其他功能继续工作`,
        sender: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorReply])
      
             // 保存错误消息到全局聊天历史
       chatHistoryService.addMessage({
         content: errorReply.content,
         sender: 'assistant',
         context: 'global'
       })
      
      toast.error('AI服务连接失败')
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
    setIsChatMode(false)
    // 清除全局聊天历史（两边同时清除）
    chatHistoryService.clearAllData()
    toast.success('全局聊天记录已清除')
  }

  const getCareerBackgroundDecoration = () => {
    const decorationMap = {
      programmer: (
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-gray-600 text-xs font-mono select-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -30, -60],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {['01', '10', '11', '00', 'FF', 'NULL'][Math.floor(Math.random() * 6)]}
            </motion.div>
          ))}
        </div>
      ),
      teacher: (
        <div className="absolute inset-0 opacity-8">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-amber-400 text-lg select-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.6, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              {['📖', '✏️', '🎓', '📚', '🌟'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )
    }

    return decorationMap[career as keyof typeof decorationMap] || null
  }

  const getStatusCommands = () => {
    const baseCommands = careerConfig.quickCommands || ['工作计划', '项目管理', '技能提升', '效率优化']
    const statusCommands = {
      working: baseCommands,
      break: ['休息提醒', '放松音乐', '健康建议', '时间管理'],
      focused: ['专注模式', '勿扰设置', '效率工具', '目标跟踪'],
      meeting: ['会议安排', '团队协作', '文档共享', '沟通工具'],
      offline: ['工作总结', '明日计划', '个人时间', '生活平衡']
    }
    return statusCommands[userStatus] || baseCommands
  }

  const getCommandPrefix = () => {
    const prefixes = {
      programmer: '$',
      teacher: '✎',
      doctor: '⚕',
      finance: '₿',
      sales: '→',
      student: '✏',
      freelancer: '✨',
      office_worker: '>'
    }
    return prefixes[career as keyof typeof prefixes] || '>'
  }

  return (
    <div 
      className={`min-h-screen ${styles.bg} flex`} 
      style={{ 
        fontFamily: styles.fontPrimary
      }}
    >
      {/* 左侧边栏 */}
      <div className={`w-80 ${styles.sidebar} flex flex-col`}>
        {/* 顶部控制区域 */}
        <div className="p-4 border-b" style={{ borderColor: styles.border }}>
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 ${styles.card} transition-colors`}
            >
              <Terminal className="w-4 h-4" style={{ color: styles.textLight }} />
            </button>
            
            <div className="flex items-center space-x-2">
              {/* 智能分析快速按钮 */}
              <button
                onClick={() => setIsChatMode(!isChatMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isChatMode 
                    ? 'bg-blue-500 text-white' 
                    : `${styles.textSecondary} hover:bg-blue-100`
                }`}
              >
                <Bot className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* 用户信息 */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <button
                onClick={() => navigate('/profile')}
                className={`w-16 h-16 ${styles.card} transition-colors flex items-center justify-center`}
                style={{ borderRadius: styles.borderRadius }}
              >
                <img 
                  src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                  alt="用户头像"
                  className="w-12 h-12 object-cover border border-gray-300"
                  style={{ borderRadius: styles.borderRadius }}
                />
              </button>
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 border-2 border-white flex items-center justify-center text-xs"
                style={{ 
                  backgroundColor: currentStatus.color,
                  borderRadius: styles.borderRadius
                }}
              >
                {currentStatus.emoji}
              </div>
            </div>
            
            <div className="text-sm mb-2" style={{ color: styles.text, fontFamily: styles.fontSecondary }}>
              <span style={{ color: styles.textLight }}>
                姓名:
              </span> {userName}
            </div>
            
            <div className="text-xs mb-3" style={{ color: styles.accent, fontFamily: styles.fontDisplay }}>
              {careerConfig.emoji} {careerConfig.name}
            </div>
            
            {/* 状态选择器 */}
            <div className="mb-3">
              <select
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value as UserStatus)}
                className={`text-xs border px-2 py-1 focus:outline-none ${styles.input}`}
                style={{ fontFamily: styles.fontSecondary, borderRadius: styles.borderRadius }}
              >
                <option value="working">{careerConfig.statusLabels.working}</option>
                <option value="break">{careerConfig.statusLabels.break}</option>
                <option value="focused">{careerConfig.statusLabels.focused}</option>
                <option value="meeting">{careerConfig.statusLabels.meeting}</option>
                <option value="offline">{careerConfig.statusLabels.offline}</option>
              </select>
            </div>
            
            {/* 状态相关签名 */}
            <div className="text-center">
              {showWelcomeText && (
                <TypewriterText 
                  text={currentStatus.signature}
                  className="text-xs"
                  style={{ color: styles.accent, fontFamily: styles.fontSecondary }}
                  speed={50}
                />
              )}
            </div>
          </div>
        </div>

                 {/* 迷你日历 */}
         <div className="p-4 border-b" style={{ borderColor: styles.border }}>
           <Calendar events={events} />
         </div>

        {/* To Do List */}
        <div className="flex-1 p-4">
          <TodoList onTodoChange={handleTodoChange} />
        </div>
      </div>

      {/* 右侧主内容区域 */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* 状态背景图案 */}
        {!isChatMode && getCareerBackgroundDecoration()}
        
        {/* 聊天模式时的清空按钮 */}
        {isChatMode && (
          <div className="p-4 border-b flex justify-end" style={{ borderColor: styles.border }}>
            <button
              onClick={clearMessages}
              className={`px-3 py-2 text-sm ${styles.card} transition-colors`}
              style={{ fontFamily: styles.fontSecondary, borderRadius: styles.borderRadius }}
            >
              新对话
            </button>
          </div>
        )}

        {/* 同步提示 */}
        {showSyncNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow-lg z-50"
          >
            ✅ 日历与待办事项已同步
          </motion.div>
        )}

        {/* 欢迎页面 - 带职业特色 */}
        {!isChatMode && (
          <div className="flex-1 flex items-center justify-center p-8 relative z-10">
            <div className="text-center max-w-3xl w-full">
              {/* 职业特色欢迎标题 */}
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    animate={{ 
                      rotate: userStatus === 'meeting' ? [0, 5, -5, 0] : 0,
                      scale: userStatus === 'focused' ? [1, 1.05, 1] : 1
                    }}
                    transition={{ 
                      duration: userStatus === 'meeting' ? 2 : 3,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  >
                    <careerConfig.icon 
                      className="w-12 h-12 mr-4" 
                      style={{ color: styles.accent }} 
                    />
                  </motion.div>
                </div>
                
                <div 
                  className="text-4xl mb-4" 
                  style={{ 
                    fontFamily: styles.fontDisplay,
                    color: styles.text
                  }}
                >
                  {showWelcomeText && (
                    <TypewriterText 
                      text={`你好，${userName}！`}
                      speed={80}
                    />
                  )}
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="text-xl"
                  style={{ 
                    fontFamily: styles.fontSecondary,
                    color: styles.primary
                  }}
                >
                  {currentStatus.welcomeText}
                </motion.p>
              </motion.div>
              
              {/* 职业特色搜索框 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                className="relative max-w-2xl mx-auto"
              >
                <div 
                  className={`${styles.card} overflow-hidden relative`} 
                  style={{ fontFamily: styles.fontSecondary }}
                >
                  <div className="flex items-center p-1">
                    <div className="flex-1 flex items-center">
                      <span 
                        className="px-3 text-sm" 
                        style={{ color: styles.textLight, fontFamily: styles.fontMono }}
                      >
                        {getCommandPrefix()}
                      </span>
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder={`输入 ${careerConfig.name} 相关内容...`}
                        className="flex-1 px-2 py-3 bg-transparent border-none outline-none placeholder-gray-400"
                        style={{ 
                          fontFamily: styles.fontSecondary,
                          color: styles.text
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                      />
                    </div>
                    <button 
                      onClick={handleSendMessage}
                      disabled={isLoading || !chatMessage.trim()}
                      className={`m-1 p-2 ${styles.button} disabled:opacity-50 transition-all text-sm`}
                      style={{ borderRadius: styles.borderRadius }}
                    >
                      <careerConfig.icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 职业特色快速命令 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.4 }}
                className="mt-6"
              >
                <p 
                  className="text-sm mb-4" 
                  style={{ 
                    fontFamily: styles.fontSecondary,
                    color: styles.accent
                  }}
                >
                  {careerConfig.name}常用功能：
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {getStatusCommands().map((cmd, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.6 + index * 0.1 }}
                      onClick={() => setChatMessage(cmd)}
                      className={`px-4 py-2 text-sm ${styles.card} border relative overflow-hidden transition-all`}
                      style={{ 
                        fontFamily: styles.fontSecondary,
                        color: styles.text,
                        borderRadius: styles.borderRadius
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10">
                        <span style={{ color: styles.textLight, fontFamily: styles.fontMono }}>
                          {getCommandPrefix()}
                        </span> {cmd}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* 聊天页面 */}
        {isChatMode && (
          <div className="flex-1 flex flex-col">
            {/* 聊天头部 */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: styles.border }}>
              <div className="flex items-center space-x-3">
                <careerConfig.icon className="w-6 h-6" style={{ color: styles.accent }} />
                <div>
                  <h3 className="font-medium" style={{ color: styles.text }}>
                    {careerConfig.name} AI助手
                  </h3>
                  <p className="text-sm" style={{ color: styles.textLight }}>
                    {aiService.isServiceConfigured() ? '在线模式 • 具备长期记忆' : '演示模式'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearMessages}
                  className={`px-3 py-1 text-xs ${styles.card} border transition-all`}
                  style={{ borderRadius: styles.borderRadius }}
                >
                  清除记录
                </button>
                <button
                  onClick={() => setIsChatMode(false)}
                  className={`px-3 py-1 text-xs ${styles.card} border transition-all`}
                  style={{ borderRadius: styles.borderRadius }}
                >
                  返回主页
                </button>
              </div>
            </div>

            {/* 聊天消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div 
                      className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${styles.card} border`}
                      style={{ borderRadius: styles.borderRadius }}
                    >
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4" style={{ color: styles.textLight }} />
                      ) : (
                        <careerConfig.icon className="w-4 h-4" style={{ color: styles.textLight }} />
                      )}
                    </div>
                    <div
                      className={`px-4 py-3 ${styles.card} border text-sm ${
                        message.sender === 'user'
                          ? 'opacity-90'
                          : 'opacity-95'
                      }`}
                      style={{ fontFamily: styles.fontSecondary, borderRadius: styles.borderRadius }}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs" style={{ color: styles.textLight }}>
                          {message.sender === 'user' ? `${careerConfig.name}@工作台` : `${careerConfig.name}助手@系统`}
                        </span>
                        <span className="text-xs" style={{ color: styles.textLight }}>
                          {message.timestamp.toLocaleTimeString('zh-CN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <pre 
                        className="whitespace-pre-wrap leading-relaxed"
                        style={{ color: styles.text }}
                      >
                        {message.content}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* 打字指示器 */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    <div className={`w-8 h-8 flex items-center justify-center ${styles.card} border`} style={{ borderRadius: styles.borderRadius }}>
                      <careerConfig.icon className="w-4 h-4" style={{ color: styles.textLight }} />
                    </div>
                    <div 
                      className={`px-4 py-3 ${styles.card} border text-sm`} 
                      style={{ fontFamily: styles.fontSecondary, borderRadius: styles.borderRadius }}
                    >
                      <div className="text-xs mb-2" style={{ color: styles.textLight }}>
                        {careerConfig.name}助手@系统
                      </div>
                      <div className="flex space-x-1">
                        <span style={{ color: styles.textLight }}>
                          正在思考
                        </span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-400 animate-bounce"></div>
                          <div className="w-1 h-1 bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 聊天输入框 */}
            <div className="p-4 border-t" style={{ borderColor: styles.border }}>
              <div 
                className={`${styles.card} overflow-hidden`} 
                style={{ fontFamily: styles.fontSecondary }}
              >
                <div className="flex items-center p-1">
                  <div className="flex-1 flex items-center">
                    <span 
                      className="px-3 text-sm" 
                      style={{ color: styles.textLight, fontFamily: styles.fontMono }}
                    >
                      {getCommandPrefix()}
                    </span>
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="输入消息..."
                      className="flex-1 px-2 py-3 bg-transparent border-none outline-none placeholder-gray-400"
                      style={{ 
                        fontFamily: styles.fontSecondary,
                        color: styles.text
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isLoading}
                    />
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !chatMessage.trim()}
                    className={`m-1 p-2 ${styles.button} disabled:opacity-50 transition-all text-sm`}
                    style={{ borderRadius: styles.borderRadius }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 智能分析面板 */}
      <SmartSchedulePanel
        isOpen={showSmartAnalysis}
        onClose={() => setShowSmartAnalysis(false)}
        selectedDate={new Date()}
      />
    </div>
  )
}

export default Dashboard
