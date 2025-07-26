
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, MapPin, Repeat, Bell, Palette, Bot, Sparkles, Trash2, AlertTriangle } from 'lucide-react'
import { CalendarEvent } from '../services/calendarService'
import LocationPicker from './LocationPicker'
import { Location } from '../services/mapService'
import aiService from '../services/aiService'

interface EventFormProps {
  event?: CalendarEvent | null
  onSubmit: (eventData: Partial<CalendarEvent>) => void
  onCancel: () => void
  onDelete?: (eventId: string) => void
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    allDay: false,
    location: null as Location | null,
    category: 'work' as CalendarEvent['category'],
    color: '#3b82f6',
    recurring: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
    reminders: [15] as number[]
  })

  const [showAIRecommendations, setShowAIRecommendations] = useState(false)
  const [aiRecommendations, setAIRecommendations] = useState<Array<{ name: string; address: string; reason: string }>>([])
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 初始化表单数据
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startTime: event.startTime ? event.startTime.toISOString().slice(0, 16) : '',
        endTime: event.endTime ? event.endTime.toISOString().slice(0, 16) : '',
        allDay: event.allDay || false,
        location: event.location || null,
        category: event.category || 'work',
        color: event.color || '#3b82f6',
        recurring: event.recurring || 'none',
        reminders: event.reminders || [15]
      })
    } else {
      // 新事件的默认时间
      const now = new Date()
      const start = new Date(now.getTime() + 60 * 60 * 1000) // 1小时后
      const end = new Date(start.getTime() + 60 * 60 * 1000) // 2小时后
      
      setFormData(prev => ({
        ...prev,
        startTime: start.toISOString().slice(0, 16),
        endTime: end.toISOString().slice(0, 16)
      }))
    }
  }, [event])

  // 获取AI地点推荐
  const getAIRecommendations = async () => {
    if (!formData.title.trim()) return

    setIsLoadingAI(true)
    try {
      const eventType = getCategoryDisplayName(formData.category)
      const recommendations = await aiService.recommendLocations(eventType)
      setAIRecommendations(recommendations)
      setShowAIRecommendations(true)
    } catch (error) {
      console.warn('获取AI推荐失败:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) return

    const startTime = new Date(formData.startTime)
    const endTime = new Date(formData.endTime)

    // 验证时间
    if (endTime <= startTime) {
      alert('结束时间必须晚于开始时间')
      return
    }

    const eventData: Partial<CalendarEvent> = {
      title: formData.title,
      description: formData.description,
      startTime,
      endTime,
      allDay: formData.allDay,
      location: formData.location,
      category: formData.category,
      color: formData.color,
      recurring: formData.recurring,
      reminders: formData.reminders
    }

    onSubmit(eventData)
  }

  const categoryOptions = [
    { value: 'work', label: '工作', icon: '💼', color: '#3b82f6' },
    { value: 'personal', label: '个人', icon: '👤', color: '#10b981' },
    { value: 'meeting', label: '会议', icon: '👥', color: '#f59e0b' },
    { value: 'holiday', label: '假期', icon: '🏖️', color: '#ef4444' },
    { value: 'travel', label: '旅行', icon: '✈️', color: '#8b5cf6' },
    { value: 'health', label: '健康', icon: '🏥', color: '#06b6d4' }
  ]

  const reminderOptions = [
    { value: 0, label: '准时提醒' },
    { value: 5, label: '5分钟前' },
    { value: 15, label: '15分钟前' },
    { value: 30, label: '30分钟前' },
    { value: 60, label: '1小时前' },
    { value: 1440, label: '1天前' }
  ]

  const getCategoryDisplayName = (category: string): string => {
    const option = categoryOptions.find(opt => opt.value === category)
    return option ? option.label : category
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {event ? '编辑事件' : '创建新事件'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              事件标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入事件标题..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              事件描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="添加事件描述..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 时间 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                开始时间 *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束时间 *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={formData.allDay}
              />
            </div>
          </div>

          {/* 全天事件 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="allDay" className="text-sm text-gray-700">
              全天事件
            </label>
          </div>

          {/* 地点选择 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 inline mr-2" />
                事件地点
              </label>
              {formData.title && (
                <button
                  type="button"
                  onClick={getAIRecommendations}
                  disabled={isLoadingAI}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 disabled:opacity-50"
                >
                  <Bot className="w-3 h-3" />
                  <span>{isLoadingAI ? '获取推荐中...' : 'AI推荐地点'}</span>
                </button>
              )}
            </div>
            <LocationPicker
              value={formData.location}
              onChange={(location) => setFormData({ ...formData, location })}
              placeholder="搜索或选择地点..."
              showMap={true}
              mapHeight={150}
            />
          </div>

          {/* AI推荐地点 */}
          {showAIRecommendations && aiRecommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-medium text-blue-900">AI推荐地点</h4>
                <button
                  type="button"
                  onClick={() => setShowAIRecommendations(false)}
                  className="ml-auto text-blue-400 hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {aiRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        location: {
                          address: rec.address,
                          name: rec.name
                        }
                      })
                      setShowAIRecommendations(false)
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{rec.name}</p>
                        <p className="text-xs text-gray-500">{rec.address}</p>
                        <p className="text-xs text-blue-600 mt-1">{rec.reason}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 分类和颜色 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-2" />
                事件分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const category = e.target.value as CalendarEvent['category']
                  const categoryOption = categoryOptions.find(opt => opt.value === category)
                  setFormData({ 
                    ...formData, 
                    category,
                    color: categoryOption?.color || formData.color
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                事件颜色
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{formData.color}</span>
              </div>
            </div>
          </div>

          {/* 重复设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Repeat className="w-4 h-4 inline mr-2" />
              重复设置
            </label>
            <select
              value={formData.recurring}
              onChange={(e) => setFormData({ ...formData, recurring: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">不重复</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
              <option value="yearly">每年</option>
            </select>
          </div>

          {/* 提醒设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bell className="w-4 h-4 inline mr-2" />
              提醒设置
            </label>
            <div className="space-y-2">
              {reminderOptions.map(option => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.reminders.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          reminders: [...formData.reminders, option.value]
                        })
                      } else {
                        setFormData({
                          ...formData,
                          reminders: formData.reminders.filter(r => r !== option.value)
                        })
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {/* 删除按钮 - 仅在编辑现有事件时显示 */}
            <div>
              {event && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>删除事件</span>
                </button>
              )}
            </div>

            {/* 主要操作按钮 */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {event ? '更新事件' : '创建事件'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* 删除确认对话框 */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    确认删除事件
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    此操作不可撤销
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">事件标题:</span> {event?.title}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">时间:</span> {event?.startTime.toLocaleString('zh-CN')}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (event && onDelete) {
                      onDelete(event.id)
                      setShowDeleteConfirm(false)
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>确认删除</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EventForm
