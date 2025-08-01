import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Zap, 
  Target, 
  Users, 
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Settings,
  BarChart3
} from 'lucide-react'
import AICalendarTools, { ScheduleAnalysis, TimeSlot, OptimalMeetingTime } from '../services/aiCalendarTools'
import AdvancedSchedulingService, { ScheduleOptimization, AutoScheduleRequest } from '../services/advancedSchedulingService'

interface SmartSchedulePanelProps {
  isOpen: boolean
  onClose: () => void
  selectedDate?: Date
  styles?: any // 添加样式参数
}

const SmartSchedulePanel: React.FC<SmartSchedulePanelProps> = ({
  isOpen,
  onClose,
  selectedDate = new Date(),
  styles
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'optimization' | 'suggestions' | 'insights'>('analysis')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ScheduleAnalysis | null>(null)
  const [optimization, setOptimization] = useState<ScheduleOptimization | null>(null)
  const [suggestions, setSuggestions] = useState<{
    focusTimeBlocks: TimeSlot[]
    breakSuggestions: TimeSlot[]
    optimizationTips: string[]
  } | null>(null)
  const [autoSuggestions, setAutoSuggestions] = useState<{
    suggestions: AutoScheduleRequest[]
    insights: string[]
  } | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadAnalysis()
    }
  }, [isOpen, selectedDate])

  const loadAnalysis = async () => {
    setIsLoading(true)
    try {
      const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      
      // 并行加载所有分析数据
      const [
        scheduleAnalysis,
        scheduleSuggestions,
        predictiveSuggestions
      ] = await Promise.all([
        AICalendarTools.analyzeBusyTimes(startOfDay, endOfDay),
        AICalendarTools.getScheduleSuggestions(selectedDate),
        AdvancedSchedulingService.predictiveScheduling('general')
      ])

      setAnalysis(scheduleAnalysis)
      setSuggestions(scheduleSuggestions)
      setAutoSuggestions(predictiveSuggestions)

      // 如果有足够的事件，进行优化分析
      if (scheduleAnalysis.totalEvents > 3) {
        const startOfWeek = new Date(startOfDay)
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        const optimizationResult = await AdvancedSchedulingService.optimizeSchedule(startOfWeek, endOfWeek)
        setOptimization(optimizationResult)
      }
    } catch (error) {
      console.error('加载分析失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptimizeSchedule = async () => {
    if (!analysis) return
    
    setIsLoading(true)
    try {
      const startOfWeek = new Date(selectedDate)
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const optimizationResult = await AdvancedSchedulingService.optimizeSchedule(startOfWeek, endOfWeek)
      setOptimization(optimizationResult)
      setActiveTab('optimization')
    } catch (error) {
      console.error('优化失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}小时${mins > 0 ? mins + '分钟' : ''}` : `${mins}分钟`
  }

  const renderAnalysisTab = () => (
    <div className="space-y-6">
      {/* 基础统计 - 使用主题样式 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${themeStyles.card} p-4 text-center ${themeStyles.fontMono}`}
             style={{ 
               backgroundColor: themeStyles.accent + '10',
               borderRadius: themeStyles.borderRadius,
               border: `1px solid ${themeStyles.accent}40`
             }}>
          <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: themeStyles.accent }} />
          <div className="text-2xl font-bold" style={{ color: themeStyles.accent }}>
            {analysis?.totalEvents || 0}
          </div>
          <div className="text-sm" style={{ color: themeStyles.accent }}>总事件数</div>
        </div>
        <div className={`${themeStyles.card} p-4 text-center ${themeStyles.fontMono}`}
             style={{ 
               backgroundColor: themeStyles.accent + '15',
               borderRadius: themeStyles.borderRadius,
               border: `1px solid ${themeStyles.accent}40`
             }}>
          <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: themeStyles.accent }} />
          <div className="text-2xl font-bold" style={{ color: themeStyles.accent }}>
            {analysis?.totalHours || 0}h
          </div>
          <div className="text-sm" style={{ color: themeStyles.accent }}>总时长</div>
        </div>
        <div className={`${themeStyles.card} p-4 text-center ${themeStyles.fontMono}`}
             style={{ 
               backgroundColor: themeStyles.accent + '10',
               borderRadius: themeStyles.borderRadius,
               border: `1px solid ${themeStyles.accent}40`
             }}>
          <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: themeStyles.accent }} />
          <div className="text-2xl font-bold" style={{ color: themeStyles.accent }}>
            {analysis?.averageEventDuration || 0}m
          </div>
          <div className="text-sm" style={{ color: themeStyles.accent }}>平均时长</div>
        </div>
        <div className={`${themeStyles.card} p-4 text-center ${themeStyles.fontMono}`}
             style={{ 
               backgroundColor: themeStyles.accent + '15',
               borderRadius: themeStyles.borderRadius,
               border: `1px solid ${themeStyles.accent}40`
             }}>
          <Zap className="w-8 h-8 mx-auto mb-2" style={{ color: themeStyles.accent }} />
          <div className="text-2xl font-bold" style={{ color: themeStyles.accent }}>
            {analysis?.fragmentedTime || 0}m
          </div>
          <div className="text-sm" style={{ color: themeStyles.accent }}>碎片时间</div>
        </div>
      </div>

      {/* 时间模式分析 - 使用主题样式 */}
      <div className={`${themeStyles.card} p-6`}
           style={{ 
             backgroundColor: themeStyles.accent + '08',
             borderRadius: themeStyles.borderRadius,
             border: `1px solid ${themeStyles.accent}30`
           }}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeStyles.fontMono}`}
            style={{ color: themeStyles.text }}>
          <BarChart3 className="w-5 h-5 mr-2" style={{ color: themeStyles.accent }} />
          时间模式分析
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className={`text-sm mb-2 ${themeStyles.fontMono}`} 
                 style={{ color: themeStyles.textLight }}>最忙碌的日期</div>
            <div className={`text-lg font-medium ${themeStyles.fontMono}`} 
                 style={{ color: themeStyles.text }}>{analysis?.busiestDay}</div>
          </div>
          <div>
            <div className={`text-sm mb-2 ${themeStyles.fontMono}`} 
                 style={{ color: themeStyles.textLight }}>最忙碌时间段</div>
            <div className={`text-lg font-medium ${themeStyles.fontMono}`} 
                 style={{ color: themeStyles.text }}>{analysis?.busiestTimeSlot}</div>
          </div>
        </div>
      </div>

      {/* 专注时间块 - 使用主题样式 */}
      {analysis?.focusTimeBlocks && analysis.focusTimeBlocks.length > 0 && (
        <div className={`${themeStyles.card} p-6`}
             style={{ 
               backgroundColor: themeStyles.accent + '08',
               borderRadius: themeStyles.borderRadius,
               border: `1px solid ${themeStyles.accent}30`
             }}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeStyles.fontMono}`}
              style={{ color: themeStyles.text }}>
            <Target className="w-5 h-5 mr-2" style={{ color: themeStyles.accent }} />
            可用专注时间块
          </h3>
          <div className="space-y-3">
            {analysis.focusTimeBlocks.map((block, index) => (
              <div key={index} 
                   className={`flex items-center justify-between p-3 ${themeStyles.fontMono}`}
                                       style={{ 
                      backgroundColor: '#ffffff',
                      borderRadius: themeStyles.borderRadius,
                      border: `1px solid ${themeStyles.accent}20`
                    }}>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" style={{ color: themeStyles.accent }} />
                  <span className="font-medium" style={{ color: themeStyles.text }}>
                    {formatTime(block.start)} - {formatTime(block.end)}
                  </span>
                </div>
                <div className="text-sm" style={{ color: themeStyles.textLight }}>
                  {formatDuration((block.end.getTime() - block.start.getTime()) / (1000 * 60))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI建议 - 使用主题样式 */}
      {analysis?.recommendations && analysis.recommendations.length > 0 && (
        <div className={`${themeStyles.card} p-6`}
             style={{ 
               backgroundColor: themeStyles.accent + '08',
               borderRadius: themeStyles.borderRadius,
               border: `1px solid ${themeStyles.accent}30`
             }}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeStyles.fontMono}`}
              style={{ color: themeStyles.text }}>
            <Brain className="w-5 h-5 mr-2" style={{ color: themeStyles.accent }} />
            AI优化建议
          </h3>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className={`flex items-start ${themeStyles.fontMono}`}>
                <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" 
                            style={{ color: themeStyles.accent }} />
                <p style={{ color: themeStyles.text }}>{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderOptimizationTab = () => (
    <div className="space-y-6">
      {optimization ? (
        <>
          {/* 优化结果概览 - 使用主题样式 */}
          <div className={`${themeStyles.card} p-6`}
               style={{ 
                 backgroundColor: themeStyles.accent + '08',
                 borderRadius: themeStyles.borderRadius,
                 border: `1px solid ${themeStyles.accent}30`
               }}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeStyles.fontMono}`}
                style={{ color: themeStyles.text }}>
              <Zap className="w-5 h-5 mr-2" style={{ color: themeStyles.accent }} />
              优化结果概览
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`text-center ${themeStyles.fontMono}`}>
                <div className="text-2xl font-bold" style={{ color: themeStyles.accent }}>
                  {optimization.improvements.reducedFragmentation}
                </div>
                <div className="text-sm" style={{ color: themeStyles.textLight }}>减少碎片化</div>
              </div>
              <div className={`text-center ${themeStyles.fontMono}`}>
                <div className="text-2xl font-bold" style={{ color: themeStyles.accent }}>
                  {Math.round(optimization.improvements.improvedFocusTime / 60)}h
                </div>
                <div className="text-sm" style={{ color: themeStyles.textLight }}>增加专注时间</div>
              </div>
              <div className={`text-center ${themeStyles.fontMono}`}>
                <div className="text-2xl font-bold" style={{ color: themeStyles.accent }}>
                  {optimization.improvements.conflictsResolved}
                </div>
                <div className="text-sm" style={{ color: themeStyles.textLight }}>解决冲突</div>
              </div>
              <div className={`text-center ${themeStyles.fontMono}`}>
                <div className="text-2xl font-bold" 
                     style={{ 
                       color: optimization.improvements.betterWorkLifeBalance 
                         ? themeStyles.accent 
                         : themeStyles.textLight 
                     }}>
                  {optimization.improvements.betterWorkLifeBalance ? '✓' : '—'}
                </div>
                <div className="text-sm" style={{ color: themeStyles.textLight }}>工作平衡</div>
              </div>
            </div>
          </div>

          {/* 优化建议 */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-yellow-600" />
              优化建议
            </h3>
            <div className="space-y-3">
              {optimization.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 优化对比 - 使用主题样式 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`${themeStyles.card} p-6`}
                 style={{ 
                   backgroundColor: themeStyles.accent + '05',
                   borderRadius: themeStyles.borderRadius,
                   border: `1px solid ${themeStyles.accent}20`
                 }}>
              <h4 className={`font-semibold mb-3 ${themeStyles.fontMono}`}
                  style={{ color: themeStyles.text }}>优化前</h4>
              <div className={`text-sm ${themeStyles.fontMono}`}
                   style={{ color: themeStyles.textLight }}>
                共 {optimization.originalSchedule.length} 个事件
              </div>
            </div>
            <div className={`${themeStyles.card} p-6`}
                 style={{ 
                   backgroundColor: themeStyles.accent + '10',
                   borderRadius: themeStyles.borderRadius,
                   border: `1px solid ${themeStyles.accent}40`
                 }}>
              <h4 className={`font-semibold mb-3 ${themeStyles.fontMono}`}
                  style={{ color: themeStyles.text }}>优化后</h4>
              <div className={`text-sm ${themeStyles.fontMono}`}
                   style={{ color: themeStyles.textLight }}>
                共 {optimization.optimizedSchedule.length} 个事件
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4" style={{ color: themeStyles.textLight }} />
          <p className={`mb-4 ${themeStyles.fontMono}`} style={{ color: themeStyles.textLight }}>暂无优化数据</p>
          <button
            onClick={handleOptimizeSchedule}
            disabled={isLoading}
            className={`px-6 py-2 transition-colors disabled:opacity-50 ${themeStyles.fontMono}`}
            style={{
              backgroundColor: themeStyles.accent,
              color: '#ffffff',
              borderRadius: themeStyles.borderRadius,
              border: 'none'
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = themeStyles.accent + 'dd')}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = themeStyles.accent)}
          >
            {isLoading ? '分析中...' : '开始智能优化'}
          </button>
        </div>
      )}
    </div>
  )

  const renderSuggestionsTab = () => (
    <div className="space-y-6">
      {/* 专注时间建议 - 使用主题样式 */}
      {suggestions?.focusTimeBlocks && suggestions.focusTimeBlocks.length > 0 && (
        <div className={`${themeStyles.card} p-6`}
             style={{ 
               backgroundColor: themeStyles.accent + '08',
               borderRadius: themeStyles.borderRadius,
               border: `1px solid ${themeStyles.accent}30`
             }}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeStyles.fontMono}`}
              style={{ color: themeStyles.text }}>
            <Target className="w-5 h-5 mr-2" style={{ color: themeStyles.accent }} />
            推荐专注时间块
          </h3>
          <div className="space-y-3">
            {suggestions.focusTimeBlocks.map((block, index) => (
              <div key={index} 
                   className={`p-4 ${themeStyles.fontMono}`}
                   style={{ 
                     backgroundColor: '#ffffff',
                     borderRadius: themeStyles.borderRadius,
                     border: `1px solid ${themeStyles.accent}30`
                   }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium" style={{ color: themeStyles.text }}>
                    {formatTime(block.start)} - {formatTime(block.end)}
                  </div>
                  <div className="text-sm font-medium" style={{ color: themeStyles.accent }}>
                    {formatDuration((block.end.getTime() - block.start.getTime()) / (1000 * 60))}
                  </div>
                </div>
                <p className="text-sm" style={{ color: themeStyles.textLight }}>适合深度工作或重要任务</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 休息时间建议 */}
      {suggestions?.breakSuggestions && suggestions.breakSuggestions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            建议休息时间
          </h3>
          <div className="space-y-3">
            {suggestions.breakSuggestions.map((break_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">
                    {formatTime(break_.start)} - {formatTime(break_.end)}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    {formatDuration((break_.end.getTime() - break_.start.getTime()) / (1000 * 60))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">适合短暂休息或准备下一个会议</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 优化提示 */}
      {suggestions?.optimizationTips && suggestions.optimizationTips.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            智能优化提示
          </h3>
          <div className="space-y-3">
            {suggestions.optimizationTips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <Zap className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* 预测性建议 */}
      {autoSuggestions?.suggestions && autoSuggestions.suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI预测性建议
          </h3>
          <div className="space-y-4">
            {autoSuggestions.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    suggestion.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                    suggestion.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                    suggestion.priority === 'medium' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {suggestion.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(suggestion.duration)}
                  {suggestion.deadline && (
                    <>
                      <span className="mx-2">•</span>
                      <span>截止: {suggestion.deadline.toLocaleDateString('zh-CN')}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 智能洞察 - 使用主题样式 */}
      {autoSuggestions?.insights && autoSuggestions.insights.length > 0 && (
        <div className={`${themeStyles.card} p-6`}
             style={{ 
               backgroundColor: themeStyles.accent + '08',
               borderRadius: themeStyles.borderRadius,
               border: `1px solid ${themeStyles.accent}30`
             }}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeStyles.fontMono}`}
              style={{ color: themeStyles.text }}>
            <TrendingUp className="w-5 h-5 mr-2" style={{ color: themeStyles.accent }} />
            智能洞察
          </h3>
          <div className="space-y-3">
            {autoSuggestions.insights.map((insight, index) => (
              <div key={index} className={`flex items-start ${themeStyles.fontMono}`}>
                <Info className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" 
                      style={{ color: themeStyles.accent }} />
                <p style={{ color: themeStyles.text }}>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`${themeStyles.card} w-full max-w-6xl h-[85vh] flex flex-col`}
            style={{ 
              borderRadius: themeStyles.borderRadius,
              fontFamily: themeStyles.fontSecondary
            }}
          >
            {/* 头部 - 使用主题样式 */}
            <div className={`flex items-center justify-between p-6 border-b`} 
                 style={{ borderColor: themeStyles.accent + '40' }}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 flex items-center justify-center ${themeStyles.fontMono}`}
                     style={{ 
                       backgroundColor: themeStyles.accent + '20',
                       color: themeStyles.accent,
                       borderRadius: themeStyles.borderRadius
                     }}>
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${themeStyles.text} ${themeStyles.fontMono}`}>
                    // 智能日程分析
                  </h2>
                  <p className={`text-sm ${themeStyles.textLight} ${themeStyles.fontMono}`}>
                    {selectedDate.toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadAnalysis}
                  disabled={isLoading}
                  className={`p-2 transition-colors disabled:opacity-50 ${themeStyles.fontMono}`}
                  style={{ 
                    backgroundColor: 'transparent',
                    color: themeStyles.accent,
                    borderRadius: themeStyles.borderRadius
                  }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = themeStyles.accent + '20')}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="刷新分析"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className={`p-2 transition-colors ${themeStyles.fontMono}`}
                  style={{ 
                    backgroundColor: 'transparent',
                    color: themeStyles.accent,
                    borderRadius: themeStyles.borderRadius
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.accent + '20'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 标签栏 - 使用主题样式 */}
            <div className="flex border-b" style={{ borderColor: themeStyles.accent + '40' }}>
              {[
                { id: 'analysis', label: '时间分析', icon: BarChart3 },
                { id: 'optimization', label: '智能优化', icon: Zap },
                { id: 'suggestions', label: '时间建议', icon: Target },
                { id: 'insights', label: 'AI洞察', icon: Brain }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${themeStyles.fontMono}`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? themeStyles.accent : 'transparent',
                    color: activeTab === tab.id ? themeStyles.accent : themeStyles.textLight.split(' ')[0].replace('text-', '')
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = themeStyles.text.split(' ')[0].replace('text-', '')
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.color = themeStyles.textLight.split(' ')[0].replace('text-', '')
                    }
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">正在分析日程数据...</p>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'analysis' && renderAnalysisTab()}
                  {activeTab === 'optimization' && renderOptimizationTab()}
                  {activeTab === 'suggestions' && renderSuggestionsTab()}
                  {activeTab === 'insights' && renderInsightsTab()}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SmartSchedulePanel 