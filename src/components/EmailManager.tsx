// 邮件管理组件 - 集成 Zero 邮件功能
import React, { useState, useEffect } from 'react'
import { Mail, Calendar, Search, Filter, RefreshCw, Plus, Send, Clock, MapPin, Users, Shield, Bot, BarChart3, MessageSquare, Settings, Star, AlertTriangle, CheckCircle, FileText, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import emailService, { EmailData, MeetingInvite } from '../services/emailService'
import CalendarService, { CalendarEvent } from '../services/calendarService'
import enhancedEmailAI, { EmailClassification, EmailSecurity, SmartReply, EmailTemplate, EmailAnalytics } from '../services/enhancedEmailAI'

interface EmailManagerProps {
  className?: string
  isOpen: boolean
  onClose: () => void
}

const EmailManager: React.FC<EmailManagerProps> = ({ className = '', isOpen, onClose }) => {
  const [emails, setEmails] = useState<EmailData[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'inbox' | 'calendar' | 'compose' | 'ai-analysis' | 'templates' | 'security' | 'analytics'>('inbox')
  const [extractedEvents, setExtractedEvents] = useState<CalendarEvent[]>([])
  const [meetingInvite, setMeetingInvite] = useState<MeetingInvite | null>(null)
  
  // 新增的 AI 功能状态
  const [emailClassification, setEmailClassification] = useState<EmailClassification | null>(null)
  const [emailSecurity, setEmailSecurity] = useState<EmailSecurity | null>(null)
  const [smartReplies, setSmartReplies] = useState<SmartReply[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null)
  const [autoProcessResults, setAutoProcessResults] = useState<any>(null)
  const [isAIProcessing, setIsAIProcessing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadEmails()
      loadTemplates()
      loadAnalytics()
    }
  }, [isOpen])

  const loadEmails = async () => {
    setIsLoading(true)
    try {
      // 模拟加载邮件数据
      // 实际使用时需要连接 Zero 的邮件 API
      const mockEmails: EmailData[] = [
        {
          id: '1',
          subject: '项目会议安排 - 明天下午2点',
          content: '大家好，我们安排在明天下午2点开项目进度会议，地点在会议室A。请大家准时参加。议题包括：1. 项目进度回顾 2. 下阶段规划',
          from: 'manager@company.com',
          to: ['team@company.com'],
          date: new Date(Date.now() - 60*60*1000)
        },
        {
          id: '2', 
          subject: '客户约见确认',
          content: '您好，确认本周五上午10点在星巴克与客户张总会面，讨论合作细节。',
          from: 'sales@company.com',
          to: ['you@company.com'],
          date: new Date(Date.now() - 2*60*60*1000)
        }
      ]
      
      setEmails(mockEmails)
    } catch (error) {
      console.error('加载邮件失败:', error)
      toast.error('加载邮件失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExtractEvents = async (email: EmailData) => {
    setIsLoading(true)
    try {
      console.log('🔍 从邮件中提取事件:', email.subject)
      const events = await emailService.extractEventsFromEmail(email)
      setExtractedEvents(events)
      
      if (events.length > 0) {
        toast.success(`✅ 从邮件中提取到 ${events.length} 个事件`)
      } else {
        toast.info('📧 邮件中未发现日历事件')
      }
    } catch (error) {
      console.error('事件提取失败:', error)
      toast.error('事件提取失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEventFromEmail = async (event: CalendarEvent) => {
    try {
      const createdEvent = CalendarService.createEvent(event)
      toast.success(`✅ 事件"${event.title}"已添加到日历`)
      
      // 触发日历更新
      window.dispatchEvent(new CustomEvent('calendarEventsUpdated', {
        detail: { newEvent: createdEvent, source: 'EmailManager' }
      }))
    } catch (error) {
      console.error('创建事件失败:', error)
      toast.error('创建事件失败')
    }
  }

  const handleCreateMeetingInvite = async (event: CalendarEvent) => {
    try {
      const attendees = ['team@company.com'] // 可以从邮件中智能提取
      const invite = await emailService.createMeetingInvite(event, attendees)
      setMeetingInvite(invite)
      setActiveTab('compose')
      toast.success('📧 会议邀请已准备就绪')
    } catch (error) {
      console.error('创建会议邀请失败:', error)
      toast.error('创建会议邀请失败')
    }
  }

  // 🤖 AI 增强功能
  const handleAIAnalysis = async (email: EmailData) => {
    setIsAIProcessing(true)
    try {
      console.log('🤖 执行 AI 分析:', email.subject)
      
      const results = await enhancedEmailAI.autoProcessEmail(email)
      setAutoProcessResults(results)
      setEmailClassification(results.classification)
      setEmailSecurity(results.security)
      
      // 生成智能回复
      const replies = await enhancedEmailAI.generateSmartReplies(email)
      setSmartReplies(replies)
      
      setActiveTab('ai-analysis')
      toast.success('🎯 AI 分析完成！')
      
    } catch (error) {
      console.error('AI 分析失败:', error)
      toast.error('AI 分析失败')
    } finally {
      setIsAIProcessing(false)
    }
  }

  const handleSecurityScan = async (email: EmailData) => {
    setIsLoading(true)
    try {
      console.log('🛡️ 执行安全扫描:', email.subject)
      
      const security = await enhancedEmailAI.securityScan(email)
      setEmailSecurity(security)
      
      if (security.riskLevel === 'high') {
        toast.error(`⚠️ 高风险邮件！${security.threats.join(', ')}`)
      } else {
        toast.success('✅ 邮件安全检查通过')
      }
      
    } catch (error) {
      console.error('安全扫描失败:', error)
      toast.error('安全扫描失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleIntelligentSearch = async (query: string) => {
    if (!query.trim()) return
    
    setIsLoading(true)
    try {
      console.log('🔍 执行智能搜索:', query)
      
      const results = await enhancedEmailAI.intelligentSearch(query, emails)
      setEmails(results)
      
      toast.success(`🔍 找到 ${results.length} 封相关邮件`)
      
    } catch (error) {
      console.error('智能搜索失败:', error)
      toast.error('智能搜索失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateTemplate = async (category: string, purpose: string) => {
    setIsLoading(true)
    try {
      console.log('📝 生成邮件模板:', category, purpose)
      
      const template = await enhancedEmailAI.generateTemplate(category, purpose)
      setTemplates(prev => [...prev, template])
      
      toast.success(`✅ 模板"${template.name}"生成成功！`)
      
    } catch (error) {
      console.error('模板生成失败:', error)
      toast.error('模板生成失败')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const loadedTemplates = enhancedEmailAI.getTemplates()
      setTemplates(loadedTemplates)
    } catch (error) {
      console.error('加载模板失败:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      if (emails.length > 0) {
        const analyticsData = await enhancedEmailAI.analyzeProductivity(emails)
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('加载分析数据失败:', error)
    }
  }

  const handleUseTemplate = (template: EmailTemplate) => {
    setMeetingInvite({
      event: null as any,
      attendees: [],
      subject: template.subject,
      body: template.content
    })
    setActiveTab('compose')
    
    // 更新模板使用统计
    enhancedEmailAI.updateTemplate(template.id, {
      usage: template.usage + 1,
      lastUsed: new Date()
    })
  }

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-white rounded-lg shadow-2xl max-w-6xl w-full h-5/6 flex flex-col ${className}`}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">邮件与日历集成</h2>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">
                  基于 Zero 邮件技术
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 标签页 */}
            <div className="flex border-b overflow-x-auto">
              {[
                { id: 'inbox', label: '收件箱', icon: Mail },
                { id: 'ai-analysis', label: 'AI 分析', icon: Bot },
                { id: 'security', label: '安全中心', icon: Shield },
                { id: 'templates', label: '邮件模板', icon: FileText },
                { id: 'analytics', label: '数据分析', icon: BarChart3 },
                { id: 'calendar', label: '日历事件', icon: Calendar },
                { id: 'compose', label: '撰写邮件', icon: Send }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'inbox' && (
                <div className="h-full flex">
                  {/* 邮件列表 */}
                  <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-4 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="智能搜索邮件（支持自然语言）..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleIntelligentSearch(searchQuery)
                            }
                          }}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={loadEmails}
                          disabled={isLoading}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                          <span>刷新邮件</span>
                        </button>
                        <button
                          onClick={() => handleIntelligentSearch(searchQuery)}
                          disabled={isLoading || !searchQuery.trim()}
                          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm disabled:opacity-50"
                        >
                          <Bot className="w-4 h-4" />
                          <span>AI 搜索</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {filteredEmails.map(email => (
                        <div
                          key={email.id}
                          onClick={() => setSelectedEmail(email)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                            selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-800 truncate">
                            {email.subject}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {email.from}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {email.date.toLocaleString('zh-CN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 邮件详情 */}
                  <div className="w-2/3 flex flex-col">
                    {selectedEmail ? (
                      <>
                        <div className="p-6 border-b">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {selectedEmail.subject}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>发件人: {selectedEmail.from}</span>
                            <span>{selectedEmail.date.toLocaleString('zh-CN')}</span>
                          </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                          <div className="prose max-w-none">
                            {selectedEmail.content.split('\n').map((line, index) => (
                              <p key={index} className="mb-2">{line}</p>
                            ))}
                          </div>

                          {/* AI 操作按钮 */}
                          <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleExtractEvents(selectedEmail)}
                              disabled={isLoading}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Calendar className="w-4 h-4" />
                              <span>提取事件</span>
                            </button>
                            
                            <button
                              onClick={() => handleAIAnalysis(selectedEmail)}
                              disabled={isAIProcessing}
                              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              <Bot className={`w-4 h-4 ${isAIProcessing ? 'animate-spin' : ''}`} />
                              <span>AI 分析</span>
                            </button>
                            
                            <button
                              onClick={() => handleSecurityScan(selectedEmail)}
                              disabled={isLoading}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <Shield className="w-4 h-4" />
                              <span>安全扫描</span>
                            </button>
                            
                            <button
                              onClick={async () => {
                                const replies = await enhancedEmailAI.generateSmartReplies(selectedEmail)
                                setSmartReplies(replies)
                                setActiveTab('compose')
                              }}
                              disabled={isLoading}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>智能回复</span>
                            </button>
                          </div>

                          {/* 提取的事件 */}
                          {extractedEvents.length > 0 && (
                            <div className="mt-6">
                              <h4 className="font-semibold text-gray-800 mb-3">
                                📅 从邮件中提取的事件
                              </h4>
                              <div className="space-y-3">
                                {extractedEvents.map(event => (
                                  <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h5 className="font-medium text-gray-800">{event.title}</h5>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                          <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{event.startTime.toLocaleString('zh-CN')}</span>
                                          </div>
                                          {event.location && (
                                            <div className="flex items-center space-x-1">
                                              <MapPin className="w-4 h-4" />
                                              <span>{event.location.name}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleCreateEventFromEmail(event)}
                                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                        >
                                          添加到日历
                                        </button>
                                        <button
                                          onClick={() => handleCreateMeetingInvite(event)}
                                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                        >
                                          创建邀请
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>选择邮件查看详情</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI 分析页面 */}
              {activeTab === 'ai-analysis' && (
                <div className="h-full p-6 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Bot className="w-5 h-5 mr-2 text-purple-600" />
                    🤖 AI 智能分析
                  </h3>
                  
                  {autoProcessResults ? (
                    <div className="space-y-6">
                      {/* 邮件分类 */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Star className="w-4 h-4 mr-2" />
                          邮件分类与优先级
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">类别</span>
                            <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block ${
                              emailClassification?.category === 'meeting' ? 'bg-blue-100 text-blue-700' :
                              emailClassification?.category === 'task' ? 'bg-green-100 text-green-700' :
                              emailClassification?.category === 'important' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {emailClassification?.category || '工作'}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">优先级</span>
                            <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block ${
                              emailClassification?.priority === 'high' ? 'bg-red-100 text-red-700' :
                              emailClassification?.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {emailClassification?.priority || 'medium'}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">紧急程度</span>
                            <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block ${
                              emailClassification?.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                              emailClassification?.urgency === 'normal' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {emailClassification?.urgency || 'normal'}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">情感倾向</span>
                            <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block ${
                              emailClassification?.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                              emailClassification?.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {emailClassification?.sentiment || 'neutral'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 行动项目 */}
                      {emailClassification?.actionItems && emailClassification.actionItems.length > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            📋 行动项目
                          </h4>
                          <ul className="space-y-2">
                            {emailClassification.actionItems.map((item, index) => (
                              <li key={index} className="flex items-center text-gray-700">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 智能回复建议 */}
                      {smartReplies.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            💬 智能回复建议
                          </h4>
                          <div className="space-y-3">
                            {smartReplies.map((reply, index) => (
                              <div key={index} className="bg-white p-3 rounded border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                                    reply.type === 'accept' ? 'bg-green-100 text-green-700' :
                                    reply.type === 'decline' ? 'bg-red-100 text-red-700' :
                                    reply.type === 'postpone' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {reply.type}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {reply.tone} • {Math.round(reply.confidence * 100)}% 置信度
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{reply.content}</p>
                                <button 
                                  onClick={() => {
                                    setMeetingInvite({
                                      event: null as any,
                                      attendees: [],
                                      subject: `Re: ${selectedEmail?.subject}`,
                                      body: reply.content
                                    })
                                    setActiveTab('compose')
                                  }}
                                  className="mt-2 text-blue-600 text-xs hover:text-blue-700"
                                >
                                  使用此回复
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 建议操作 */}
                      {autoProcessResults.suggestions.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            ⚡ 建议操作
                          </h4>
                          <div className="space-y-2">
                            {autoProcessResults.suggestions.map((suggestion: string, index: number) => (
                              <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                                <span className="text-gray-700">{suggestion}</span>
                                <button className="text-green-600 text-sm hover:text-green-700">
                                  执行
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 mt-20">
                      <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>选择邮件并点击"AI 分析"开始智能分析</p>
                    </div>
                  )}
                </div>
              )}

              {/* 安全中心页面 */}
              {activeTab === 'security' && (
                <div className="h-full p-6 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-red-600" />
                    🛡️ 邮件安全中心
                  </h3>
                  
                  {emailSecurity ? (
                    <div className="space-y-6">
                      {/* 安全总览 */}
                      <div className={`p-4 rounded-lg ${
                        emailSecurity.riskLevel === 'high' ? 'bg-red-50 border border-red-200' :
                        emailSecurity.riskLevel === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center mb-3">
                          {emailSecurity.riskLevel === 'high' ? (
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                          ) : emailSecurity.riskLevel === 'medium' ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          )}
                          <h4 className="font-semibold">
                            安全风险级别: {
                              emailSecurity.riskLevel === 'high' ? '高风险' :
                              emailSecurity.riskLevel === 'medium' ? '中等风险' :
                              '低风险'
                            }
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-600">钓鱼邮件:</span>
                            <span className={`ml-2 font-medium ${
                              emailSecurity.isPhishing ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {emailSecurity.isPhishing ? '⚠️ 是' : '✅ 否'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">可疑内容:</span>
                            <span className={`ml-2 font-medium ${
                              emailSecurity.isSuspicious ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {emailSecurity.isSuspicious ? '⚠️ 是' : '✅ 否'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 威胁详情 */}
                      {emailSecurity.threats.length > 0 && (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-3">🚨 发现的威胁</h4>
                          <ul className="space-y-2">
                            {emailSecurity.threats.map((threat, index) => (
                              <li key={index} className="flex items-center text-red-700">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                {threat}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 安全建议 */}
                      {emailSecurity.recommendations.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-3">💡 安全建议</h4>
                          <ul className="space-y-2">
                            {emailSecurity.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-center text-blue-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 mt-20">
                      <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>选择邮件并点击"安全扫描"进行安全检查</p>
                    </div>
                  )}
                </div>
              )}

              {/* 邮件模板页面 */}
              {activeTab === 'templates' && (
                <div className="h-full p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      📝 邮件模板管理
                    </h3>
                    <button
                      onClick={() => {
                        const category = prompt('请输入模板类别（如：会议、邀请、跟进）：')
                        const purpose = prompt('请输入模板用途：')
                        if (category && purpose) {
                          handleGenerateTemplate(category, purpose)
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>AI 生成模板</span>
                    </button>
                  </div>
                  
                  {templates.length > 0 ? (
                    <div className="grid gap-4">
                      {templates.map(template => (
                        <div key={template.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{template.name}</h4>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                              {template.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{template.content.substring(0, 100)}...</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>使用次数: {template.usage}</span>
                            <span>最后使用: {template.lastUsed.toLocaleDateString()}</span>
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={() => handleUseTemplate(template)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              使用模板
                            </button>
                            <button
                              onClick={() => enhancedEmailAI.deleteTemplate(template.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 mt-20">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>暂无邮件模板，点击"AI 生成模板"创建第一个模板</p>
                    </div>
                  )}
                </div>
              )}

              {/* 数据分析页面 */}
              {activeTab === 'analytics' && (
                <div className="h-full p-6 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                    📊 邮件数据分析
                  </h3>
                  
                  {analytics ? (
                    <div className="space-y-6">
                      {/* 总览统计 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">{analytics.totalEmails}</div>
                          <div className="text-sm text-gray-600">总邮件数</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{analytics.productivity.meetingsScheduled}</div>
                          <div className="text-sm text-gray-600">会议安排</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600">{analytics.productivity.actionItems}</div>
                          <div className="text-sm text-gray-600">行动项目</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600">{analytics.responseTime}h</div>
                          <div className="text-sm text-gray-600">平均响应时间</div>
                        </div>
                      </div>

                      {/* 邮件分类统计 */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-800 mb-3">📊 邮件分类统计</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(analytics.categorizedEmails).map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-gray-600 capitalize">{category}</span>
                              <div className="flex items-center">
                                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${(count / analytics.totalEmails) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 趋势图表 */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-800 mb-3">📈 邮件量趋势</h4>
                        <div className="h-32 flex items-end space-x-2">
                          {analytics.trends.volume.map((volume, index) => (
                            <div
                              key={index}
                              className="bg-blue-500 rounded-t"
                              style={{
                                height: `${(volume / Math.max(...analytics.trends.volume)) * 100}%`,
                                width: '14.28%'
                              }}
                              title={`第${index + 1}天: ${volume}封邮件`}
                            ></div>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
                            <span key={day}>{day}</span>
                          ))}
                        </div>
                      </div>

                      {/* 生产力指标 */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">⚡ 生产力指标</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-green-600">{analytics.productivity.completedTasks}</div>
                            <div className="text-sm text-gray-600">已完成任务</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-600">{analytics.productivity.meetingsScheduled}</div>
                            <div className="text-sm text-gray-600">安排会议</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-purple-600">
                              {Math.round((analytics.productivity.completedTasks / analytics.productivity.actionItems) * 100) || 0}%
                            </div>
                            <div className="text-sm text-gray-600">任务完成率</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 mt-20">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>正在加载分析数据...</p>
                      <button
                        onClick={loadAnalytics}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        刷新分析
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'calendar' && (
                <div className="h-full p-6">
                  <h3 className="text-lg font-semibold mb-4">📅 日历事件管理</h3>
                  <p className="text-gray-600">
                    这里可以显示从邮件中提取的所有事件，以及发送的会议邀请等。
                  </p>
                </div>
              )}

              {activeTab === 'compose' && (
                <div className="h-full p-6">
                  {meetingInvite ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">✉️ 会议邀请</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            收件人
                          </label>
                          <input
                            type="text"
                            value={meetingInvite.attendees.join(', ')}
                            readOnly
                            className="w-full p-2 border rounded-lg bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            主题
                          </label>
                          <input
                            type="text"
                            value={meetingInvite.subject}
                            readOnly
                            className="w-full p-2 border rounded-lg bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            内容
                          </label>
                          <textarea
                            value={meetingInvite.body}
                            readOnly
                            rows={10}
                            className="w-full p-2 border rounded-lg bg-gray-50"
                          />
                        </div>
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          发送邀请
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>选择事件创建会议邀请</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EmailManager 