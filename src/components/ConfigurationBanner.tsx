import React from 'react'
import { AlertCircle, Settings, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

interface ConfigurationBannerProps {
  isVisible: boolean
  onDismiss: () => void
}

const ConfigurationBanner: React.FC<ConfigurationBannerProps> = ({ isVisible, onDismiss }) => {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            🚀 完善配置以启用全部功能
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            当前应用运行在演示模式。配置 Firebase 和 Google API 后，可以启用用户认证和 Google 日历同步功能。
          </p>
          <div className="flex items-center space-x-3">
            <a
              href="/SETUP_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>查看配置指南</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onDismiss}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              暂时忽略
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ConfigurationBanner 