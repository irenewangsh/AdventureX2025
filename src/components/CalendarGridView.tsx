import React from 'react'
import { motion } from 'framer-motion'
import { CalendarEvent } from '../services/calendarService'
import { Clock, MapPin } from 'lucide-react'

interface CalendarGridViewProps {
  currentDate: Date
  view: 'day' | 'week' | 'month' | 'year'
  events: CalendarEvent[]
  styles: any
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}

const CalendarGridView: React.FC<CalendarGridViewProps> = ({
  currentDate,
  view,
  events,
  styles,
  onDateClick,
  onEventClick
}) => {
  
  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }
    return days
  }

  const getEventsForDate = (date: Date) => {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    return events.filter(event => {
      const eventStart = new Date(event.startTime)
      const eventEnd = new Date(event.endTime)
      
      // 检查事件是否在这一天
      return (eventStart < nextDay && eventEnd >= targetDate)
    })
  }

  const renderMonthView = () => {
    const days = getMonthDays()
    const today = new Date()
    
    return (
      <div className="space-y-4">
        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-2">
          {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(day => (
            <div key={day} className="text-center text-sm font-medium py-2" style={{ color: styles.textLight }}>
              {day}
            </div>
          ))}
        </div>
        
        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            const isToday = date.toDateString() === today.toDateString()
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            const dayEvents = getEventsForDate(date)
            
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`relative min-h-[100px] p-2 cursor-pointer transition-all ${
                  isToday 
                    ? styles.button
                    : isCurrentMonth 
                      ? styles.card + ' hover:shadow-md' 
                      : styles.card + ' opacity-50'
                }`}
                style={{ borderRadius: styles.borderRadius }}
                onClick={() => onDateClick?.(date)}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'text-white' : isCurrentMonth ? styles.text : ''
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className="text-xs p-1 rounded truncate cursor-pointer"
                      style={{ 
                        backgroundColor: event.color + '20',
                        color: event.color,
                        borderLeft: `3px solid ${event.color}`
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event)
                      }}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs" style={{ color: styles.textLight }}>
                      +{dayEvents.length - 3} 更多
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const days = getWeekDays()
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    return (
      <div className="space-y-4">
        {/* 星期标题 */}
        <div className="grid grid-cols-8 gap-2">
          <div className="text-sm font-medium py-2" style={{ color: styles.textLight }}>
            时间
          </div>
          {days.map((date, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium" style={{ color: styles.text }}>
                {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
              </div>
              <div className="text-xs" style={{ color: styles.textLight }}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* 时间网格 */}
        <div className="grid grid-cols-8 gap-2 max-h-[600px] overflow-y-auto">
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="text-xs py-4 text-right pr-2" style={{ color: styles.textLight }}>
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map((date, dayIndex) => {
                const cellEvents = getEventsForDate(date).filter(event => {
                  const eventHour = new Date(event.startTime).getHours()
                  return eventHour === hour
                })
                
                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[60px] p-1 border-t border-gray-200 ${styles.card}`}
                    onClick={() => onDateClick?.(date)}
                  >
                    {cellEvents.map((event, i) => (
                      <div
                        key={i}
                        className="text-xs p-1 mb-1 rounded cursor-pointer"
                        style={{ 
                          backgroundColor: event.color + '20',
                          color: event.color
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick?.(event)
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayEvents = getEventsForDate(currentDate)
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-bold" style={{ color: styles.text }}>
            {currentDate.toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </h3>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(event => {
              const eventHour = new Date(event.startTime).getHours()
              return eventHour === hour
            })
            
            return (
              <div key={hour} className="flex">
                <div className="w-16 text-xs text-right pr-4 py-4" style={{ color: styles.textLight }}>
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className={`flex-1 min-h-[60px] p-2 border-t border-gray-200 ${styles.card}`}>
                  {hourEvents.map((event, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 mb-2 rounded-lg cursor-pointer"
                      style={{ 
                        backgroundColor: event.color + '20',
                        borderLeft: `4px solid ${event.color}`
                      }}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="font-medium" style={{ color: event.color }}>
                        {event.title}
                      </div>
                      {event.description && (
                        <div className="text-sm mt-1" style={{ color: styles.textLight }}>
                          {event.description}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs" style={{ color: styles.textLight }}>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(event.startTime).toLocaleTimeString('zh-CN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            {' - '}
                            {new Date(event.endTime).toLocaleTimeString('zh-CN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(currentDate.getFullYear(), i, 1)
      return monthDate
    })

    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {months.map((month, index) => {
          const monthEvents = events.filter(event => {
            const eventDate = new Date(event.startTime)
            return eventDate.getFullYear() === month.getFullYear() && 
                   eventDate.getMonth() === month.getMonth()
          })
          
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`${styles.card} p-4 cursor-pointer`}
              style={{ borderRadius: styles.borderRadius }}
              onClick={() => onDateClick?.(month)}
            >
              <div className="text-center mb-2">
                <div className="font-medium" style={{ color: styles.text }}>
                  {month.toLocaleDateString('zh-CN', { month: 'long' })}
                </div>
                <div className="text-sm" style={{ color: styles.textLight }}>
                  {monthEvents.length} 个事件
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-xs">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(month.getFullYear(), month.getMonth(), i - 6)
                  const isCurrentMonth = date.getMonth() === month.getMonth()
                  const hasEvents = getEventsForDate(date).length > 0
                  
                  return (
                    <div
                      key={i}
                      className={`text-center py-1 ${
                        isCurrentMonth 
                          ? hasEvents ? 'bg-blue-100 text-blue-800' : ''
                          : 'text-gray-300'
                      }`}
                    >
                      {isCurrentMonth ? date.getDate() : ''}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  switch (view) {
    case 'day':
      return renderDayView()
    case 'week':
      return renderWeekView()
    case 'month':
      return renderMonthView()
    case 'year':
      return renderYearView()
    default:
      return renderMonthView()
  }
}

export default CalendarGridView 