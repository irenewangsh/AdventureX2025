
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// 检查是否有有效的Firebase配置
const hasValidFirebaseConfig = () => {
  const requiredEnvs = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ]
  
  return requiredEnvs.every(env => 
    import.meta.env[env] && 
    import.meta.env[env] !== 'your_firebase_api_key_here' &&
    import.meta.env[env] !== 'your_project_id' &&
    import.meta.env[env].trim() !== ''
  )
}

// 默认配置（用于开发环境，不会初始化Firebase）
const defaultConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
}

// Firebase配置
const firebaseConfig = hasValidFirebaseConfig() ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
} : defaultConfig

// 应用状态
export const isFirebaseConfigured = hasValidFirebaseConfig()

// 初始化Firebase
let firebaseApp = null
let firebaseAuth = null

if (isFirebaseConfigured) {
  try {
    firebaseApp = initializeApp(firebaseConfig)
    console.log('🔥 Firebase App已初始化')
  } catch (error) {
    console.error('❌ Firebase App初始化失败:', error)
  }
  
  try {
    if (firebaseApp) {
      firebaseAuth = getAuth(firebaseApp)
      console.log('🔐 Firebase Auth已初始化')
      console.log('🔐 Auth对象状态:', firebaseAuth ? '✅ 可用' : '❌ 不可用')
      
      // 暴露到window供调试使用
      if (typeof window !== 'undefined' && firebaseAuth && firebaseApp) {
        (window as any).firebaseAuth = firebaseAuth
        (window as any).firebaseApp = firebaseApp
        console.log('🌐 Firebase已暴露到window对象')
      }
    }
  } catch (error) {
    console.error('❌ Firebase Auth初始化失败:', error)
  }
} else {
  console.warn('⚠️  Firebase配置未找到，认证功能将被禁用')
  console.warn('💡 请参考SETUP_GUIDE.md配置Firebase')
}

export { firebaseAuth as auth }
export default firebaseApp
