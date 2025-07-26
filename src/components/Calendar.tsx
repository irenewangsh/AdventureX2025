
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Terminal } from 'lucide-react'
import { useAppContext } from '../App'
import { CalendarEvent } from '../services/calendarService'

interface CalendarProps {
  events: CalendarEvent[]
  className?: string
}

const Calendar: React.FC<CalendarProps> = ({ events, className = '' }) => {
  const navigate = useNavigate()
  const { viewMode } = useAppContext()
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const generateCalendar = () => {
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

  const getEventsForDate = (date: Date) => {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    return events.filter(event => {
      const eventStart = new Date(event.startTime)
      eventStart.setHours(0, 0, 0, 0)
      return eventStart.getTime() === targetDate.getTime()
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleCalendarClick = () => {
    // 直接跳转到日历主页面
    navigate('/calendar')
  }

  const calendarDays = generateCalendar()
  const today = new Date()
  const currentMonth = currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })

  const getStyles = () => {
    const styles = {
      minimal: 'bg-white border border-gray-300 shadow-sm',
      caring: 'bg-white border border-orange-200 shadow-sm',
      normal: 'bg-white border border-blue-200 shadow-sm'
    }
    return styles[viewMode] || styles.normal
  }

  return (
    <div 
      className={`${getStyles()} p-4 cursor-pointer hover:bg-gray-50 transition-colors font-mono ${className}`}
      onClick={handleCalendarClick}
    >
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={(e) => {
            e.stopPropagation()
            goToPreviousMonth()
          }}
          className="p-1 hover:bg-gray-100 border border-gray-300 transition-colors"
        >
          <ChevronLeft className="w-3 h-3 text-gray-600" />
        </button>
        <div className="flex items-center space-x-2">
          <Terminal className="w-3 h-3 text-gray-500" />
          <h3 className="font-mono text-sm text-gray-800">{currentMonth}</h3>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            goToNextMonth()
          }}
          className="p-1 hover:bg-gray-100 border border-gray-300 transition-colors"
        >
          <ChevronRight className="w-3 h-3 text-gray-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-xs font-mono">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-gray-500 font-mono py-1 border-b border-gray-200">
            {day}
          </div>
        ))}
        {calendarDays.map((date, index) => {
          const isToday = date.toDateString() === today.toDateString()
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const dayEvents = getEventsForDate(date)
          
          return (
            <div
              key={index}
              className={`relative text-center py-2 text-xs font-mono transition-colors border ${
                isToday 
                  ? 'bg-gray-800 text-white border-gray-600' 
                  : isCurrentMonth 
                    ? 'text-gray-700 hover:bg-gray-100 border-gray-200' 
                    : 'text-gray-300 border-gray-100'
              }`}
            >
              <div>{date.getDate()}</div>
              {dayEvents.length > 0 && (
                <div className="flex justify-center space-x-1 mt-1">
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <div
                      key={i}
                      className="w-1 h-1"
                      style={{ backgroundColor: event.color }}
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-400">+{dayEvents.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500 font-mono text-center">
        // calendar.view() | 点击查看详情
      </div>
    </div>
  )
}

export default Calendar
