import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  Search, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  BarChart3,
  X,
  MessageSquare,
  Calendar,
  Clock,
  Tag
} from 'lucide-react'
import chatHistoryService, { ConversationContext, ChatMessage } from '../services/chatHistoryService'

interface ChatHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (conversationId: string) => void
  onNewConversation: () => void
  context?: 'dashboard' | 'calendar'
}

const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  onNewConversation,
  context
}) => {
  const [conversations, setConversations] = useState<ConversationContext[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<'conversations' | 'search' | 'stats'>('conversations')
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([])
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    if (isOpen) {
      loadConversations()
      loadStats()
    }
  }, [isOpen])

  const loadConversations = () => {
    const allConversations = chatHistoryService.getConversations()
    setConversations(allConversations)
  }

  const loadStats = () => {
    const statistics = chatHistoryService.getStatistics()
    setStats(statistics)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = chatHistoryService.searchMessages(query, context)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('确定要删除这个对话吗？')) {
      chatHistoryService.deleteConversation(conversationId)
      loadConversations()
    }
  }

  const handleExportData = () => {
    const data = chatHistoryService.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (chatHistoryService.importData(data)) {
            loadConversations()
            loadStats()
            alert('数据导入成功！')
          } else {
            alert('数据导入失败！')
          }
        } catch (error) {
          alert('文件格式错误！')
        }
      }
      reader.readAsText(file)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
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
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <History className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">聊天历史</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 标签栏 */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'conversations', label: '对话', icon: MessageSquare },
                { id: 'search', label: '搜索', icon: Search },
                { id: 'stats', label: '统计', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-hidden">
              {selectedTab === 'conversations' && (
                <div className="h-full flex flex-col">
                  {/* 操作栏 */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <button
                      onClick={onNewConversation}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>新对话</span>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>导入</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>
                      
                      <button
                        onClick={handleExportData}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>导出</span>
                      </button>
                    </div>
                  </div>

                  {/* 对话列表 */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {conversations.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>还没有对话历史</p>
                        <p className="text-sm">开始一个新对话吧！</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {conversations.map((conversation) => (
                          <motion.div
                            key={conversation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors group"
                            onClick={() => {
                              onSelectConversation(conversation.id)
                              onClose()
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {conversation.title}
                                </h4>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDate(conversation.lastActivity)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MessageSquare className="w-3 h-3" />
                                    <span>{conversation.messageCount} 条消息</span>
                                  </div>
                                </div>
                                {conversation.tags.length > 0 && (
                                  <div className="flex items-center space-x-1 mt-2">
                                    <Tag className="w-3 h-3 text-gray-400" />
                                    <div className="flex flex-wrap gap-1">
                                      {conversation.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                          key={index}
                                          className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTab === 'search' && (
                <div className="h-full flex flex-col">
                  {/* 搜索框 */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="搜索聊天内容..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* 搜索结果 */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {searchQuery && searchResults.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>没有找到相关内容</p>
                      </div>
                    )}
                    
                    {searchResults.length > 0 && (
                      <div className="space-y-4">
                        {searchResults.map((message) => (
                          <div
                            key={message.id}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                message.sender === 'user' ? 'bg-blue-100' : 'bg-gray-200'
                              }`}>
                                {message.sender === 'user' ? '👤' : '🤖'}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm text-gray-900 mb-2">
                                  {message.content}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {message.timestamp.toLocaleString('zh-CN')}
                                  {message.context && (
                                    <span className="ml-2 px-2 py-1 bg-gray-200 rounded">
                                      {message.context === 'dashboard' ? '主页' : '日历'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTab === 'stats' && (
                <div className="h-full overflow-y-auto p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalMessages || 0}
                      </div>
                      <div className="text-sm text-blue-600">总消息数</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.conversations || 0}
                      </div>
                      <div className="text-sm text-green-600">对话数</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.avgMessagesPerConv || 0}
                      </div>
                      <div className="text-sm text-purple-600">平均每对话</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.userMessages || 0}
                      </div>
                      <div className="text-sm text-orange-600">用户消息</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">最活跃日期</h3>
                      <p className="text-gray-600">{stats.mostActiveDay}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">常见话题</h3>
                      <div className="flex flex-wrap gap-2">
                        {(stats.commonTopics || []).map((topic: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChatHistoryPanel 