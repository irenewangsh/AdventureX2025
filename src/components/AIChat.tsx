
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Bot, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const getAIResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('日历') || message.includes('calendar')) {
      return '我可以帮你管理日历事件！你可以告诉我要添加什么事件，或者询问你的日程安排。'
    }
    
    if (message.includes('事件') || message.includes('event')) {
      return '你想添加什么事件吗？请告诉我事件的标题、时间和地点，我来帮你创建。'
    }
    
    if (message.includes('今天') || message.includes('today')) {
      return '今天你有以下安排：\n- 团队会议 10:00-11:00\n- 项目评审 14:00-15:30\n\n还有什么需要我帮助的吗？'
    }
    
    if (message.includes('明天') || message.includes('tomorrow')) {
      return '明天的日程相对轻松：\n- 客户电话 09:30-10:00\n- 午餐会议 12:00-13:00\n\n要添加其他安排吗？'
    }
    
    if (message.includes('会议') || message.includes('meeting')) {
      return '我可以帮你安排会议！请告诉我：\n1. 会议主题\n2. 参与人员\n3. 时间\n4. 地点\n\n我会为你创建会议事件。'
    }
    
    const responses = [
      '我是你的日历助手，可以帮你管理日程、创建事件和提醒安排。',
      '有什么日程安排需要我协助的吗？我可以帮你添加、修改或查询事件。',
      '你可以问我关于日历功能的任何问题，比如如何创建事件或设置提醒。'
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsTyping(true)

    try {
      const response = await getAIResponse(message)
      
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: 'assistant',
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
      }, 1000 + Math.random() * 1000)
    } catch (error) {
      console.error('AI response error:', error)
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors z-40 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-white border border-gray-300 shadow-2xl z-50 flex flex-col font-mono"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-gray-600" />
                <h3 className="font-mono text-sm text-gray-900">// calendar.assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-mono">
                    你好！我是日历助手。<br />
                    有什么日程需要帮助的吗？
                  </p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className="w-6 h-6 border border-gray-300 flex items-center justify-center text-xs">
                      {msg.sender === 'user' ? (
                        <User className="w-3 h-3" />
                      ) : (
                        <Bot className="w-3 h-3" />
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 text-xs font-mono border ${
                        msg.sender === 'user'
                          ? 'bg-gray-100 border-gray-300'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <pre className="whitespace-pre-wrap">{msg.content}</pre>
                      <div className="text-xs text-gray-500 mt-1">
                        {msg.timestamp.toLocaleTimeString('zh-CN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="w-6 h-6 border border-gray-300 flex items-center justify-center text-xs">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="px-3 py-2 text-xs font-mono border bg-white border-gray-300">
                      <div className="flex space-x-1">
                        <span>thinking</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-400 animate-bounce"></div>
                          <div className="w-1 h-1 bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入消息..."
                  className="flex-1 px-3 py-2 text-xs font-mono border border-gray-300 focus:outline-none focus:border-gray-500"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isTyping || !message.trim()}
                  className="px-3 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIChat
