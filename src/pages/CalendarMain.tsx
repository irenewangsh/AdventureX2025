
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Terminal, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Globe,
  Zap,
  Bot,
  User,
  LogOut,
  Star,
  Brain,
  Mail
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAppContext } from '../App'
import { getCareerStyles } from '../utils/careerConfig'
import CalendarService, { CalendarEvent, CalendarView } from '../services/calendarService'
import GoogleCalendarService from '../services/googleCalendarService'
import AuthService, { User as AuthUser } from '../services/authService'
import TodoService from '../services/todoService'
import AICalendarService from '../services/aiCalendarService'
import EventForm from '../components/EventForm'
import AICalendarChat from '../components/AICalendarChat'
import CalendarGridView from '../components/CalendarGridView'
import AuthModal from '../components/AuthModal'
import ConfigurationBanner from '../components/ConfigurationBanner'
import MapService from '../services/mapService'
import SmartSchedulePanel from '../components/SmartSchedulePanel'
import EmailManager from '../components/EmailManager'

type ViewType = 'day' | 'week' | 'month' | 'year'

const CalendarMain: React.FC = () => {
  const navigate = useNavigate()
  const { career } = useAppContext()
  const styles = getCareerStyles(career)
  // 状态管理
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>('month')
  const [showEventForm, setShowEventForm] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [showSmartPanel, setShowSmartPanel] = useState(false)
  const [showEmailManager, setShowEmailManager] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['work', 'personal', 'meeting', 'holiday', 'travel', 'health'])
  const [showSettings, setShowSettings] = useState(false)
  const [timezone, setTimezone] = useState(CalendarService.getTimezone())
  const [user, setUser] = useState<AuthUser | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [showConfigBanner, setShowConfigBanner] = useState(!AuthService.isConfigured())

  useEffect(() => {
    // 监听认证状态
    const unsubscribe = AuthService.onAuthStateChange((authUser) => {
      setUser(authUser)
      if (authUser) {
        // 用户登录后初始化Google Calendar服务
        initializeGoogleCalendar()
      }
    })

    loadEvents()
    CalendarService.loadFromStorage()

    // 监听全局事件更新（跨页面同步）
    const handleGlobalEventUpdate = (event: CustomEvent) => {
      console.log('接收到全局事件更新:', event.detail)
      refreshData()
    }

    window.addEventListener('calendarEventsUpdated', handleGlobalEventUpdate as EventListener)

    return () => {
      unsubscribe()
      window.removeEventListener('calendarEventsUpdated', handleGlobalEventUpdate as EventListener)
    }
  }, [currentDate, currentView])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, selectedCategories])

  const initializeGoogleCalendar = async () => {
    try {
      await GoogleCalendarService.initialize()
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error)
    }
  }

  const loadEvents = () => {
    const { startDate, endDate } = getViewDateRange()
    const loadedEvents = CalendarService.getEvents(startDate, endDate)
    setEvents(loadedEvents)
  }

  const refreshData = () => {
    console.log('CalendarMain refreshData 被调用')
    const allEvents = CalendarService.getEvents()
    console.log('CalendarMain 获取到的所有事件数量:', allEvents.length)
    loadEvents()
    console.log('CalendarMain loadEvents 完成')
  }

  const filterEvents = () => {
    let filtered = events

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      )
    }

    // 类别过滤
    filtered = filtered.filter(event => 
      selectedCategories.includes(event.category)
    )

    setFilteredEvents(filtered)
  }

  const getViewDateRange = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    switch (currentView) {
      case 'day':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'week':
        start.setDate(start.getDate() - start.getDay())
        start.setHours(0, 0, 0, 0)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      case 'month':
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        end.setHours(23, 59, 59, 999)
        break
      case 'year':
        start.setMonth(0, 1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(11, 31)
        end.setHours(23, 59, 59, 999)
        break
    }

    return { startDate: start, endDate: end }
  }

  // 创建事件
  const handleCreateEvent = (eventData: Partial<CalendarEvent>) => {
    const newEvent = CalendarService.createEvent(eventData)
    setEvents(prev => [...prev, newEvent])
    setShowEventForm(false)
    
    // 如果事件标题不包含待办事项标识，询问是否创建对应的待办事项
    if (!eventData.title?.includes('📋')) {
      createTodoFromEvent(newEvent)
    }
    
    toast.success('事件创建成功！')
  }

  // 更新事件
  const handleUpdateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    const updatedEvent = CalendarService.updateEvent(id, eventData)
    if (updatedEvent) {
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ))
      setEditingEvent(null)
      setShowEventForm(false)
      toast.success('事件更新成功！')
    }
  }

  // 删除事件
  const handleDeleteEvent = (id: string) => {
    if (window.confirm('确定要删除这个事件吗？')) {
      CalendarService.deleteEvent(id)
      setEvents(prev => prev.filter(event => event.id !== id))
      toast.success('事件删除成功！')
    }
  }

  // 处理AI推荐的地点选择
  const handleLocationSelect = (location: any) => {
    // 创建一个包含地点的新事件
    setEditingEvent({
      title: '新建事件',
      description: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      allDay: false,
      location: {
        address: location.address,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude
      },
      category: 'meeting',
      color: '#3b82f6'
    } as CalendarEvent)
    setShowEventForm(true)
    setShowAIChat(false)
  }

  // 处理AI创建事件
  const handleAIEventCreate = (eventData: any) => {
    // AI已经创建了事件，这里只需要刷新视图
    console.log('AI事件创建回调，刷新视图:', eventData)
    refreshData()
    setShowAIChat(false)
    toast.success(`✅ AI成功创建事件: ${eventData.title}`)
  }

  // 获取用户位置
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>()

  useEffect(() => {
    // 获取用户当前位置用于AI助手
    MapService.getCurrentLocation().then(location => {
      if (location && location.latitude && location.longitude) {
        setUserLocation({
          latitude: location.latitude,
          longitude: location.longitude
        })
      }
    }).catch(console.warn)
  }, [])

  const createTodoFromEvent = (event: CalendarEvent) => {
    try {
      TodoService.createTodoFromCalendarEvent(event)
      toast.success('已自动创建对应的待办事项！')
    } catch (error) {
      console.log('未创建待办事项')
    }
  }

  const handleSyncWithGoogle = async () => {
    if (!AuthService.isConfigured()) {
      toast.error('Google同步需要配置Firebase。请参考SETUP_GUIDE.md进行配置。')
      return
    }
    
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setIsSyncing(true)
    try {
      const result = await GoogleCalendarService.syncEvents(events)
      setLastSyncTime(new Date())
      toast.success(`同步完成！创建 ${result.created} 个，更新 ${result.updated} 个事件`)
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error))
      }
    } catch (error: any) {
      toast.error(`同步失败: ${error.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleImportFromGoogle = async () => {
    if (!AuthService.isConfigured()) {
      toast.error('Google导入需要配置Firebase。请参考SETUP_GUIDE.md进行配置。')
      return
    }
    
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setIsSyncing(true)
    try {
      const { startDate, endDate } = getViewDateRange()
      const googleEvents = await GoogleCalendarService.getEvents('primary', startDate, endDate)
      
      // 将Google事件转换为本地事件格式
      const importedEvents = googleEvents.map(gEvent => {
        const startTime = gEvent.start.dateTime 
          ? new Date(gEvent.start.dateTime)
          : new Date(gEvent.start.date + 'T00:00:00')
        
        const endTime = gEvent.end.dateTime
          ? new Date(gEvent.end.dateTime)
          : new Date(gEvent.end.date + 'T23:59:59')

        return CalendarService.createEvent({
          title: gEvent.summary,
          description: gEvent.description,
          startTime,
          endTime,
          allDay: !gEvent.start.dateTime,
          location: {
            address: gEvent.location,
            name: gEvent.summary,
            latitude: 0, // Placeholder, will be updated by AI
            longitude: 0 // Placeholder, will be updated by AI
          },
          category: 'personal' // 默认分类
        })
      })

      setEvents(prev => [...prev, ...importedEvents])
      toast.success(`成功导入 ${importedEvents.length} 个事件`)
    } catch (error: any) {
      toast.error(`导入失败: ${error.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await AuthService.signOut()
      setUser(null)
      toast.success('已退出登录')
    } catch (error: any) {
      toast.error('退出登录失败')
    }
  }

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate)
    
    switch (direction) {
      case 'prev':
        switch (currentView) {
          case 'day':
            newDate.setDate(newDate.getDate() - 1)
            break
          case 'week':
            newDate.setDate(newDate.getDate() - 7)
            break
          case 'month':
            newDate.setMonth(newDate.getMonth() - 1)
            break
          case 'year':
            newDate.setFullYear(newDate.getFullYear() - 1)
            break
        }
        break
      case 'next':
        switch (currentView) {
          case 'day':
            newDate.setDate(newDate.getDate() + 1)
            break
          case 'week':
            newDate.setDate(newDate.getDate() + 7)
            break
          case 'month':
            newDate.setMonth(newDate.getMonth() + 1)
            break
          case 'year':
            newDate.setFullYear(newDate.getFullYear() + 1)
            break
        }
        break
      case 'today':
        newDate.setTime(Date.now())
        break
    }
    
    setCurrentDate(newDate)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCareerConfig = (career: string) => {
    const configs = {
      programmer: { name: '程序员', emoji: '💻' },
      teacher: { name: '教师', emoji: '📚' },
      doctor: { name: '医生', emoji: '🏥' },
      sales: { name: '销售', emoji: '💼' },
      finance: { name: '金融', emoji: '📊' },
      student: { name: '学生', emoji: '🎓' },
      freelancer: { name: '自由职业', emoji: '🎨' },
      office_worker: { name: '上班族', emoji: '👔' }
    }
    return configs[career as keyof typeof configs] || configs.programmer
  }

  const categories = [
    { id: 'work', name: '工作', color: '#374151' },
    { id: 'personal', name: '个人', color: '#3b82f6' },
    { id: 'meeting', name: '会议', color: '#059669' },
    { id: 'holiday', name: '假期', color: '#dc2626' },
    { id: 'travel', name: '旅行', color: '#7c3aed' },
    { id: 'health', name: '健康', color: '#ea580c' }
  ]

  const stats = CalendarService.getStats()
  const todoStats = TodoService.getStats()

  return (
    <div 
      className={`min-h-screen ${styles.bg} font-mono`}
      style={{ fontFamily: styles.fontSecondary }}
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center space-x-2 px-4 py-2 ${styles.button} transition-colors duration-200 font-mono text-sm`}
              style={{ borderRadius: styles.borderRadius }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>cd ~/dashboard</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5" style={{ color: styles.textLight }} />
              <h1 className={`text-2xl font-mono ${styles.text}`}>
                <span style={{ color: styles.textLight }}>// </span>calendar.main()
              </h1>
            </div>
          </div>

          {/* 用户信息和控制按钮 */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <img 
                    src={user.photoURL || '/default-avatar.png'} 
                    alt={user.displayName || '用户'}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm" style={{ color: styles.text }}>
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className={`p-2 ${styles.card} transition-colors`}
                  style={{ borderRadius: styles.borderRadius }}
                >
                  <LogOut className="w-4 h-4" style={{ color: styles.textLight }} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 ${styles.button} transition-colors`}
                style={{ borderRadius: styles.borderRadius }}
              >
                <User className="w-4 h-4" />
                <span className="text-sm">登录</span>
              </button>
            )}

            <button
              onClick={handleSyncWithGoogle}
              disabled={isSyncing}
              className={`flex items-center space-x-2 px-4 py-2 ${styles.card} transition-colors disabled:opacity-50`}
              style={{ borderRadius: styles.borderRadius }}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.text }}>
                {isSyncing ? '同步中...' : '同步Google'}
              </span>
            </button>
            
            {/* AI助手切换按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAIChat(!showAIChat)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                showAIChat
                  ? 'bg-purple-600 text-white shadow-lg'
                  : `${styles.button} hover:shadow-md`
              }`}
              style={{ borderRadius: styles.borderRadius }}
            >
              <Bot className="w-4 h-4 mr-2" />
              {showAIChat ? '关闭助手' : 'AI助手'}
            </motion.button>
            
            <button
              onClick={() => setShowEventForm(true)}
              className={`flex items-center space-x-2 px-4 py-2 ${styles.button} transition-colors`}
              style={{ borderRadius: styles.borderRadius }}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">创建事件</span>
            </button>
          </div>
        </div>

        {/* 配置提示横幅 */}
        <ConfigurationBanner
          isVisible={showConfigBanner}
          onDismiss={() => setShowConfigBanner(false)}
        />

        {/* 同步状态指示 */}
        {lastSyncTime && (
          <div className="mb-4 text-center">
            <span className="text-xs" style={{ color: styles.textLight }}>
              上次同步: {lastSyncTime.toLocaleString('zh-CN')}
            </span>
          </div>
        )}

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className={`${styles.card} p-4`} style={{ borderRadius: styles.borderRadius }}>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.textLight }}>日历事件</span>
            </div>
            <div className="text-2xl font-bold mt-2" style={{ color: styles.text }}>
              {stats.total}
            </div>
          </div>
          
          <div className={`${styles.card} p-4`} style={{ borderRadius: styles.borderRadius }}>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.textLight }}>待办事项</span>
            </div>
            <div className="text-2xl font-bold mt-2" style={{ color: styles.text }}>
              {todoStats.total}
            </div>
          </div>
          
          <div className={`${styles.card} p-4`} style={{ borderRadius: styles.borderRadius }}>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.textLight }}>本周</span>
            </div>
            <div className="text-2xl font-bold mt-2" style={{ color: styles.text }}>
              {stats.thisWeek}
            </div>
          </div>
          
          <div className={`${styles.card} p-4`} style={{ borderRadius: styles.borderRadius }}>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.textLight }}>完成率</span>
            </div>
            <div className="text-2xl font-bold mt-2" style={{ color: styles.text }}>
              {todoStats.completionRate}%
            </div>
          </div>
          
          <div className={`${styles.card} p-4`} style={{ borderRadius: styles.borderRadius }}>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.textLight }}>今日任务</span>
            </div>
            <div className="text-2xl font-bold mt-2" style={{ color: styles.text }}>
              {todoStats.todayTotal}
            </div>
          </div>
        </div>

        {/* 顶部操作栏 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">智能日历</h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 智能分析按钮 */}
            <motion.button
              onClick={() => setShowSmartPanel(true)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${styles.button} hover:shadow-md`}
              style={{ borderRadius: styles.borderRadius }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Brain className="w-4 h-4 mr-2" />
              智能分析
            </motion.button>

            {/* AI助手按钮 */}
            <motion.button
              onClick={() => setShowAIChat(!showAIChat)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                showAIChat
                  ? 'bg-purple-600 text-white shadow-lg'
                  : `${styles.button} hover:shadow-md`
              }`}
              style={{ borderRadius: styles.borderRadius }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Bot className="w-4 h-4 mr-2" />
              {showAIChat ? '关闭助手' : 'AI助手'}
            </motion.button>

            {/* 邮件管理按钮 */}
            <motion.button
              onClick={() => setShowEmailManager(true)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${styles.button} hover:shadow-md`}
              style={{ borderRadius: styles.borderRadius }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail className="w-4 h-4 mr-2" />
              邮件管理
            </motion.button>

            {/* Google日历同步 */}
            <motion.button
              onClick={handleSyncWithGoogle}
              disabled={isSyncing}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${styles.button} hover:shadow-md disabled:opacity-50`}
              style={{ borderRadius: styles.borderRadius }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isSyncing ? '同步中...' : 'Google同步'}
            </motion.button>

            {/* 创建事件按钮 */}
            <motion.button
              onClick={() => setShowEventForm(true)}
              className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-md`}
              style={{ borderRadius: styles.borderRadius }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              创建事件
            </motion.button>
          </div>
        </div>

        {/* 视图控制 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* 导航按钮 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate('prev')}
                className={`p-2 ${styles.card} transition-colors`}
                style={{ borderRadius: styles.borderRadius }}
              >
                <ArrowLeft className="w-4 h-4" style={{ color: styles.textLight }} />
              </button>
              
              <button
                onClick={() => navigateDate('today')}
                className={`px-4 py-2 ${styles.button} transition-colors text-sm`}
                style={{ borderRadius: styles.borderRadius }}
              >
                今天
              </button>
              
              <button
                onClick={() => navigateDate('next')}
                className={`p-2 ${styles.card} transition-colors`}
                style={{ borderRadius: styles.borderRadius }}
              >
                <ArrowLeft className="w-4 h-4 rotate-180" style={{ color: styles.textLight }} />
              </button>
            </div>

            {/* 视图切换 */}
            <div className="flex items-center space-x-1">
              {(['day', 'week', 'month', 'year'] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-3 py-1 text-sm transition-colors ${
                    currentView === view ? styles.button : styles.card
                  }`}
                  style={{ borderRadius: styles.borderRadius }}
                >
                  {view === 'day' && '日'}
                  {view === 'week' && '周'}
                  {view === 'month' && '月'}
                  {view === 'year' && '年'}
                </button>
              ))}
            </div>
          </div>

          {/* 搜索和过滤 */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: styles.textLight }} />
              <input
                type="text"
                placeholder="搜索事件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2 ${styles.input} text-sm`}
                style={{ borderRadius: styles.borderRadius }}
              />
            </div>
            
            <button
              onClick={handleImportFromGoogle}
              disabled={isSyncing}
              className={`p-2 ${styles.card} transition-colors disabled:opacity-50`}
              style={{ borderRadius: styles.borderRadius }}
              title="从Google日历导入"
            >
              <Download className="w-4 h-4" style={{ color: styles.textLight }} />
            </button>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex space-x-6">
          {/* 日历视图 */}
          <div className="flex-1">
            <div className={`${styles.card} p-6`} style={{ borderRadius: styles.borderRadius }}>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold" style={{ color: styles.text }}>
                  {formatDate(currentDate)}
                </h2>
                <p className="text-sm" style={{ color: styles.textLight }}>
                  {getCareerConfig(career).emoji} {getCareerConfig(career).name}日历 & 待办同步
                </p>
              </div>
              
              {/* 日历网格视图 */}
              <CalendarGridView
                currentDate={currentDate}
                view={currentView}
                events={filteredEvents}
                styles={styles}
                onDateClick={(date) => {
                  setCurrentDate(date)
                  setCurrentView('day')
                }}
                onEventClick={(event) => {
                  setEditingEvent(event)
                  setShowEventForm(true)
                }}
              />
            </div>
          </div>

          {/* AI聊天面板 - 固定定位，不影响页面布局 */}
          <AnimatePresence>
            {showAIChat && (
              <motion.div
                initial={{ opacity: 0, x: 400 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 400 }}
                                  className="fixed top-20 right-6 w-96 max-w-[calc(100vw-3rem)] h-[calc(100vh-120px)] z-50 bg-white rounded-lg border border-gray-200 shadow-2xl overflow-hidden md:w-96 sm:w-80"
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <h3 className="font-semibold">🤖 AI 日历助手</h3>
                    <button
                      onClick={() => setShowAIChat(false)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <AICalendarChat
                      onLocationSelect={handleLocationSelect}
                      onEventCreate={handleAIEventCreate}
                      userLocation={userLocation}
                      context="calendar"
                      height={undefined}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* 智能分析面板 */}
        <SmartSchedulePanel
          isOpen={showSmartPanel}
          onClose={() => setShowSmartPanel(false)}
          selectedDate={currentDate}
        />

        {/* 事件表单 */}
        {showEventForm && (
          <EventForm
            event={editingEvent}
            onSubmit={(eventData) => {
              if (editingEvent) {
                handleUpdateEvent(editingEvent.id, eventData)
              } else {
                handleCreateEvent(eventData)
              }
            }}
            onCancel={() => {
              setShowEventForm(false)
              setEditingEvent(null)
            }}
          />
        )}

        {/* 邮件管理器 */}
        <EmailManager
          isOpen={showEmailManager}
          onClose={() => setShowEmailManager(false)}
        />

        {/* 认证模态框 */}
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false)
              handleSyncWithGoogle() // Changed from handleGoogleCalendarSync to handleSyncWithGoogle
            }}
          />
        )}
      </div>
    </div>
  )
}

export default CalendarMain