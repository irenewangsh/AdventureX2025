
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Terminal, Code2, Cpu } from 'lucide-react'
import { useAppContext } from '../App'

const TransitionPage: React.FC = () => {
  const navigate = useNavigate()
  const { viewMode, userAge } = useAppContext()
  const [currentQuote, setCurrentQuote] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  const generateDailyQuote = () => {
    const quotes = {
      young: [
        "// 今天是编码的好日子，让我们创造一些神奇的东西！",
        "const motivation = 'Keep coding, keep creating!'; 💻",
        "// TODO: 征服今天的每一个bug 🚀",
        "let today = new Opportunity(); // 准备好改变世界了吗？",
        "// 新的一天，新的代码，新的可能性 ⚡"
      ],
      middle: [
        "// 稳步前进，每一行代码都有价值",
        "const experience = years * practice; // 继续积累智慧 📚",
        "// 平衡工作与生活，优化人生算法 ⚖️",
        "function buildWisdom() { return experience + learning; } 🌱",
        "// 今天是实现架构目标的重要一步"
      ],
      senior: [
        "// 健康是最重要的系统资源，记得定期维护 😊",
        "const happiness = family + friends + health; 🌸",
        "// 慢下来，享受代码人生的美好时光",
        "function enjoyLife() { return moment.now().appreciate(); } 🍃",
        "// 今天又是充满智慧和宁静的一天"
      ]
    }

    let category = 'young'
    if (userAge >= 65) category = 'senior'
    else if (userAge >= 35) category = 'middle'

    const categoryQuotes = quotes[category as keyof typeof quotes]
    return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)]
  }

  const getBackgroundStyle = () => {
    const backgrounds = {
      minimal: 'bg-gray-50',
      caring: 'bg-orange-50',
      normal: 'bg-blue-50'
    }
    return backgrounds[viewMode]
  }

  const getTextStyle = () => {
    const styles = {
      minimal: 'text-gray-800',
      caring: 'text-orange-800',
      normal: 'text-blue-800'
    }
    return styles[viewMode]
  }

  const getAccentColor = () => {
    const colors = {
      minimal: 'bg-gray-600',
      caring: 'bg-orange-600',
      normal: 'bg-blue-600'
    }
    return colors[viewMode]
  }

  useEffect(() => {
    setCurrentQuote(generateDailyQuote())
    setIsVisible(true)

    // 进度条动画
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => navigate('/calendar'), 500)
          return 100
        }
        return prev + 2
      })
    }, 80)

    return () => clearInterval(progressInterval)
  }, [navigate, userAge])

  return (
    <div className={`min-h-screen flex items-center justify-center ${getBackgroundStyle()} relative overflow-hidden font-mono`}>
      {/* 动态背景效果 - 代码风格 */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute text-xs text-gray-300 font-mono select-none`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {['const', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export'][Math.floor(Math.random() * 10)]}
          </motion.div>
        ))}
      </div>

      {/* 主内容 */}
      <div className="text-center z-10 max-w-4xl px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* 终端风格标题 */}
          <motion.div 
            className="mb-8"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Terminal className={`w-8 h-8 ${getTextStyle()}`} />
              <h1 className={`text-4xl font-mono ${getTextStyle()} tracking-tight`}>
                {userAge >= 65 ? 'system.inspiration()' : 'loading.motivation()'}
              </h1>
            </div>
          </motion.div>

          {/* 代码块风格的引语 */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-white border border-gray-300 p-6 text-left max-w-2xl mx-auto shadow-sm">
              <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200">
                <Code2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500 font-mono">daily_inspiration.js</span>
              </div>
              <pre className={`text-lg ${getTextStyle()} leading-relaxed font-mono whitespace-pre-wrap`}>
                {currentQuote}
              </pre>
            </div>
          </motion.div>

          {/* 终端风格进度条 */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="bg-white border border-gray-300 p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 mb-3">
                <Cpu className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500 font-mono">
                  calendar.initialize()
                </span>
              </div>
              
              <div className="w-full h-2 bg-gray-200 border border-gray-300 overflow-hidden">
                <motion.div
                  className={`h-full ${getAccentColor()} transition-all duration-100`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 font-mono">
                  Progress: {progress}%
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {progress < 100 ? 'Loading...' : 'Complete!'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* 系统状态 */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <div className="text-xs text-gray-500 font-mono space-y-1">
              <div>// Initializing calendar module...</div>
              <div>// Loading user preferences...</div>
              <div>// Preparing workspace...</div>
              {progress > 80 && <div>// Ready to launch!</div>}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default TransitionPage
