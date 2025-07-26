import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  ChevronRight, 
  Terminal, 
  Plus, 
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
  Bot
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppContext } from '../App'
import { getCareerStyles } from '../utils/careerConfig'
import CalendarService, { CalendarEvent, CalendarView } from '../services/calendarService'
import AICalendarChat from './AICalendarChat'
import EventForm from './EventForm'

type ViewType = 'day' | 'week' | 'month' | 'year'

interface EnhancedCalendarProps {
  className?: string
}

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({ className = '' }) => {
  const navigate = useNavigate()
  const { career } = useAppContext()
  const styles = getCareerStyles(career)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>('month')
  const [showEventForm, setShowEventForm] = useState(false)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['work', 'personal', 'meeting', 'holiday', 'travel', 'health'])
  const [showSettings, setShowSettings] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [timezone, setTimezone] = useState(CalendarService.getTimezone())

  useEffect(() => {
    loadEvents()
    CalendarService.loadFromStorage()
  }, [currentDate, currentView])

  useEffect(() => {
    filterEvents()
  }, [events, searchQuery, selectedCategories])

  const loadEvents = () => {
    const { startDate, endDate } = getViewDateRange()
    const loadedEvents = CalendarService.getEvents(startDate, endDate)
    setEvents(loadedEvents)
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

  const handleCreateEvent = (eventData: Partial<CalendarEvent>) => {
    const newEvent = CalendarService.createEvent(eventData)
    setEvents(prev => [...prev, newEvent])
    setShowEventForm(false)
  }

  const handleUpdateEvent = (eventData: Partial<CalendarEvent>) => {
    if (editEvent) {
      const updatedEvent = CalendarService.updateEvent(editEvent.id, eventData)
      if (updatedEvent) {
        setEvents(prev => prev.map(e => e.id === editEvent.id ? updatedEvent : e))
      }
    }
    setShowEventForm(false)
    setEditEvent(null)
  }

  const handleDeleteEvent = (eventId: string) => {
    CalendarService.deleteEvent(eventId)
    setEvents(prev => prev.filter(e => e.id !== eventId))
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

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
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

  return (
    <div 
      className={`min-h-screen ${styles.bg} font-mono ${className}`}
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
              <ChevronLeft className="w-4 h-4" />
              <span>cd ~/dashboard</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5" style={{ color: styles.textLight }} />
              <h1 className={`text-2xl font-mono ${styles.text}`}>
                <span style={{ color: styles.textLight }}>// </span>calendar.main()
              </h1>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className={`flex items-center space-x-2 px-4 py-2 ${styles.card} transition-colors`}
              style={{ borderRadius: styles.borderRadius }}
            >
              <Bot className="w-4 h-4" style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.text }}>
                AI助手
              </span>
            </button>
            
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
                <ChevronLeft className="w-4 h-4" style={{ color: styles.textLight }} />
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
                <ChevronRight className="w-4 h-4" style={{ color: styles.textLight }} />
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
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 ${styles.card} transition-colors`}
              style={{ borderRadius: styles.borderRadius }}
            >
              <Settings className="w-4 h-4" style={{ color: styles.textLight }} />
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${styles.card} p-4`} style={{ borderRadius: styles.borderRadius }}>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.textLight }}>总事件</span>
            </div>
            <div className="text-2xl font-bold mt-2" style={{ color: styles.text }}>
              {stats.total}
            </div>
          </div>
          
          <div className={`${styles.card} p-4`} style={{ borderRadius: styles.borderRadius }}>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.textLight }}>本周</span>
            </div>
            <div className="text-2xl font-bold mt-2" style={{ color: styles.text }}>
              {stats.thisWeek}
            </div>
          </div>
          
          <div className={`${styles.card} p-4`} style={{ borderRadius: styles.borderRadius }}>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.textLight }}>会议</span>
            </div>
            <div className="text-2xl font-bold mt-2" style={{ color: styles.text }}>
              {stats.meetings}
            </div>
          </div>
          
          <div className={`${styles.card} p-4`} style={{ borderRadius: styles.borderRadius }}>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" style={{ color: styles.accent }} />
              <span className="text-sm" style={{ color: styles.textLight }}>效率</span>
            </div>
            <div className="text-2xl font-bold mt-2" style={{ color: styles.text }}>
              {stats.efficiency}%
            </div>
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
                  {getCareerConfig(career).emoji} {getCareerConfig(career).name}日历
                </p>
              </div>
              
              {/* 这里可以集成你的日历网格组件 */}
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4" style={{ color: styles.textLight }} />
                <p className="text-sm" style={{ color: styles.textLight }}>
                  日历视图开发中...
                </p>
              </div>
            </div>
          </div>

          {/* AI 聊天面板 */}
          {showAIChat && (
            <div className="w-96">
              <AICalendarChat 
                events={events}
                onEventCreate={handleCreateEvent}
              />
            </div>
          )}
        </div>

        {/* 事件表单 */}
        {showEventForm && (
          <EventForm
            event={editEvent}
            onSubmit={editEvent ? handleUpdateEvent : handleCreateEvent}
            onCancel={() => {
              setShowEventForm(false)
              setEditEvent(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default EnhancedCalendar 