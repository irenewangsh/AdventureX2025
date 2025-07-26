
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Calendar, Clock, MapPin, Users, Tag, Bell, Repeat, 
  Globe, Mic, Wand2, Plus, Trash2, Save
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { AdvancedCalendarEvent, RecurrenceRule } from '../services/advancedCalendarService'
import AdvancedCalendarService from '../services/advancedCalendarService'

interface AdvancedEventFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (eventData: Partial<AdvancedCalendarEvent>) => void
  editEvent?: AdvancedCalendarEvent | null
  selectedDate?: Date
}

const AdvancedEventForm: React.FC<AdvancedEventFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editEvent,
  selectedDate
}) => {
  const [formData, setFormData] = useState<Partial<AdvancedCalendarEvent>>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    allDay: false,
    location: '',
    category: 'personal',
    color: '#3b82f6',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    attendees: [],
    reminders: []
  })

  const [recurrence, setRecurrence] = useState<RecurrenceRule | null>(null)
  const [naturalInput, setNaturalInput] = useState('')
  const [isProcessingNL, setIsProcessingNL] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const timezones = AdvancedCalendarService.getTimezones()
  
  const categories = [
    { id: 'work', name: '工作', color: '#374151' },
    { id: 'personal', name: '个人', color: '#3b82f6' },
    { id: 'meeting', name: '会议', color: '#059669' },
    { id: 'holiday', name: '假期', color: '#dc2626' },
    { id: 'travel', name: '旅行', color: '#7c3aed' },
    { id: 'health', name: '健康', color: '#ea580c' }
  ]

  const reminderOptions = [
    { minutes: 0, label: '事件开始时' },
    { minutes: 5, label: '5分钟前' },
    { minutes: 10, label: '10分钟前' },
    { minutes: 15, label: '15分钟前' },
    { minutes: 30, label: '30分钟前' },
    { minutes: 60, label: '1小时前' },
    { minutes: 1440, label: '1天前' },
    { minutes: 10080, label: '1周前' }
  ]

  useEffect(() => {
    if (editEvent) {
      setFormData({
        title: editEvent.title,
        description: editEvent.description,
        startTime: editEvent.startTime,
        endTime: editEvent.endTime,
        allDay: editEvent.allDay,
        location: editEvent.location,
        category: editEvent.category,
        color: editEvent.color,
        timezone: editEvent.timezone,
        attendees: editEvent.attendees || [],
        reminders: editEvent.reminders || []
      })
      setRecurrence(editEvent.recurrence || null)
      setShowAdvanced(!!editEvent.recurrence || !!editEvent.attendees?.length)
    } else if (selectedDate) {
      const startTime = new Date(selectedDate)
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
      
      setFormData(prev => ({
        ...prev,
        startTime,
        endTime
      }))
    }
  }, [editEvent, selectedDate, isOpen])

  // 自然语言处理
  const handleNaturalLanguageInput = async () => {
    if (!naturalInput.trim()) return

    setIsProcessingNL(true)
    try {
      const parsed = await AdvancedCalendarService.parseNaturalLanguage(naturalInput)
      if (parsed) {
        setFormData(prev => ({
          ...prev,
          ...parsed,
          startTime: parsed.startTime || prev.startTime,
          endTime: parsed.endTime || prev.endTime
        }))
        
        if (parsed.recurrence) {
          setRecurrence(parsed.recurrence)
          setShowAdvanced(true)
        }
        
        toast.success('自然语言解析成功！')
      } else {
        toast.error('无法解析该输入，请尝试更具体的描述')
      }
    } catch (error) {
      toast.error('自然语言解析失败')
    } finally {
      setIsProcessingNL(false)
    }
  }

  // 添加提醒
  const addReminder = () => {
    const newReminder = {
      type: 'popup' as const,
      minutes: 15
    }
    setFormData(prev => ({
      ...prev,
      reminders: [...(prev.reminders || []), newReminder]
    }))
  }

  // 删除提醒
  const removeReminder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders?.filter((_, i) => i !== index) || []
    }))
  }

  // 添加参与者
  const addAttendee = () => {
    const email = prompt('请输入参与者邮箱:')
    if (email && email.includes('@')) {
      setFormData(prev => ({
        ...prev,
        attendees: [...(prev.attendees || []), email]
      }))
    }
  }

  // 删除参与者
  const removeAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title?.trim()) {
      toast.error('请输入事件标题')
      return
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('请设置开始和结束时间')
      return
    }

    if (formData.endTime <= formData.startTime) {
      toast.error('结束时间必须晚于开始时间')
      return
    }

    const eventData: Partial<AdvancedCalendarEvent> = {
      ...formData,
      recurrence: recurrence || undefined
    }

    onSave(eventData)
    onClose()
    toast.success(editEvent ? '事件更新成功！' : '事件创建成功！')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {editEvent ? '编辑事件' : '创建事件'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* 自然语言输入 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Wand2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">智能创建</h3>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  placeholder="例如: 明天下午2点和张三开会讨论项目进展"
                  className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageInput()}
                />
                <button
                  onClick={handleNaturalLanguageInput}
                  disabled={isProcessingNL || !naturalInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessingNL ? '解析中...' : '解析'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左列 */}
                <div className="space-y-6">
                  {/* 基础信息 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      事件标题 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入事件标题..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      描述
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="输入事件描述..."
                    />
                  </div>

                  {/* 时间设置 */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        id="allDay"
                        checked={formData.allDay || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, allDay: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                        全天事件
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          开始时间
                        </label>
                        <input
                          type={formData.allDay ? 'date' : 'datetime-local'}
                          required
                          value={formData.startTime ? 
                            formData.allDay 
                              ? formData.startTime.toISOString().split('T')[0]
                              : formData.startTime.toISOString().slice(0, 16)
                            : ''
                          }
                          onChange={(e) => {
                            const date = new Date(e.target.value)
                            setFormData(prev => ({ ...prev, startTime: date }))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          结束时间
                        </label>
                        <input
                          type={formData.allDay ? 'date' : 'datetime-local'}
                          required
                          value={formData.endTime ? 
                            formData.allDay 
                              ? formData.endTime.toISOString().split('T')[0]
                              : formData.endTime.toISOString().slice(0, 16)
                            : ''
                          }
                          onChange={(e) => {
                            const date = new Date(e.target.value)
                            setFormData(prev => ({ ...prev, endTime: date }))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 时区选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      时区
                    </label>
                    <select
                      value={formData.timezone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  {/* 位置 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      位置
                    </label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入地点..."
                    />
                  </div>
                </div>

                {/* 右列 */}
                <div className="space-y-6">
                  {/* 分类和颜色 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-4 h-4 inline mr-1" />
                      分类
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            category: category.id as any,
                            color: category.color
                          }))}
                          className={`p-3 text-sm border rounded-lg transition-colors ${
                            formData.category === category.id
                              ? 'text-white border-gray-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                          style={{
                            backgroundColor: formData.category === category.id ? category.color : undefined
                          }}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 提醒设置 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        <Bell className="w-4 h-4 inline mr-1" />
                        提醒
                      </label>
                      <button
                        type="button"
                        onClick={addReminder}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        添加提醒
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.reminders?.map((reminder, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <select
                            value={reminder.minutes}
                            onChange={(e) => {
                              const newReminders = [...(formData.reminders || [])]
                              newReminders[index] = { ...reminder, minutes: parseInt(e.target.value) }
                              setFormData(prev => ({ ...prev, reminders: newReminders }))
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {reminderOptions.map(option => (
                              <option key={option.minutes} value={option.minutes}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          
                          <select
                            value={reminder.type}
                            onChange={(e) => {
                              const newReminders = [...(formData.reminders || [])]
                              newReminders[index] = { ...reminder, type: e.target.value as any }
                              setFormData(prev => ({ ...prev, reminders: newReminders }))
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="popup">弹窗</option>
                            <option value="email">邮件</option>
                          </select>
                          
                          <button
                            type="button"
                            onClick={() => removeReminder(index)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 参与者 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        <Users className="w-4 h-4 inline mr-1" />
                        参与者
                      </label>
                      <button
                        type="button"
                        onClick={addAttendee}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        添加参与者
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.attendees?.map((email, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              const newAttendees = [...(formData.attendees || [])]
                              newAttendees[index] = e.target.value
                              setFormData(prev => ({ ...prev, attendees: newAttendees }))
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="参与者邮箱"
                          />
                          <button
                            type="button"
                            onClick={() => removeAttendee(index)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 高级选项切换 */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>{showAdvanced ? '隐藏' : '显示'}高级选项</span>
                    </button>
                  </div>

                  {/* 重复设置 */}
                  {showAdvanced && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">重复设置</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            重复频率
                          </label>
                          <select
                            value={recurrence?.freq || ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                setRecurrence({
                                  freq: e.target.value as any,
                                  interval: 1
                                })
                              } else {
                                setRecurrence(null)
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">不重复</option>
                            <option value="daily">每天</option>
                            <option value="weekly">每周</option>
                            <option value="monthly">每月</option>
                            <option value="yearly">每年</option>
                          </select>
                        </div>

                        {recurrence && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                间隔
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={recurrence.interval}
                                onChange={(e) => setRecurrence(prev => prev ? {
                                  ...prev,
                                  interval: parseInt(e.target.value) || 1
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                结束条件
                              </label>
                              <div className="space-y-2">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="endCondition"
                                    checked={!recurrence.count && !recurrence.until}
                                    onChange={() => setRecurrence(prev => prev ? {
                                      ...prev,
                                      count: undefined,
                                      until: undefined
                                    } : null)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm">永不结束</span>
                                </label>
                                
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="endCondition"
                                    checked={!!recurrence.count}
                                    onChange={() => setRecurrence(prev => prev ? {
                                      ...prev,
                                      count: 10,
                                      until: undefined
                                    } : null)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm mr-2">重复</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={recurrence.count || 10}
                                    onChange={(e) => setRecurrence(prev => prev ? {
                                      ...prev,
                                      count: parseInt(e.target.value) || 1
                                    } : null)}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                  <span className="text-sm ml-2">次</span>
                                </label>
                                
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="endCondition"
                                    checked={!!recurrence.until}
                                    onChange={() => setRecurrence(prev => prev ? {
                                      ...prev,
                                      until: new Date(),
                                      count: undefined
                                    } : null)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm mr-2">结束于</span>
                                  <input
                                    type="date"
                                    value={recurrence.until ? recurrence.until.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setRecurrence(prev => prev ? {
                                      ...prev,
                                      until: new Date(e.target.value)
                                    } : null)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </label>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editEvent ? '更新事件' : '创建事件'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdvancedEventForm
