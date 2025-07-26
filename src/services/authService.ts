
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from '../config/firebase'
import { isFirebaseConfigured } from '../config/firebase'

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
}

class AuthService {
  private googleProvider: GoogleAuthProvider | null = null

  constructor() {
    if (isFirebaseConfigured && auth) {
      this.googleProvider = new GoogleAuthProvider()
      this.googleProvider.addScope('https://www.googleapis.com/auth/calendar')
      this.googleProvider.addScope('https://www.googleapis.com/auth/calendar.events')
    }
  }

  // 检查Firebase是否已配置
  private checkFirebaseConfig(): boolean {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase未配置。请参考SETUP_GUIDE.md设置Firebase配置。')
    }
    return true
  }

  // 邮箱密码登录
  async signInWithEmail(email: string, password: string): Promise<User> {
    this.checkFirebaseConfig()
    try {
      const userCredential = await signInWithEmailAndPassword(auth!, email, password)
      return this.transformUser(userCredential.user)
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // 邮箱密码注册
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
    this.checkFirebaseConfig()
    try {
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password)
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName })
      }
      
      return this.transformUser(userCredential.user)
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // Google OAuth 登录
  async signInWithGoogle(): Promise<User> {
    this.checkFirebaseConfig()
    if (!this.googleProvider) {
      throw new Error('Google认证提供商未初始化')
    }
    
    try {
      const result = await signInWithPopup(auth!, this.googleProvider)
      
      // 获取 Google 访问令牌用于日历 API
      const credential = GoogleAuthProvider.credentialFromResult(result)
      if (credential?.accessToken) {
        localStorage.setItem('google_access_token', credential.accessToken)
      }
      
      return this.transformUser(result.user)
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // 登出
  async signOut(): Promise<void> {
    this.checkFirebaseConfig()
    try {
      await signOut(auth!)
      localStorage.removeItem('google_access_token')
    } catch (error: any) {
      throw new Error('登出失败')
    }
  }

  // 重置密码
  async resetPassword(email: string): Promise<void> {
    this.checkFirebaseConfig()
    try {
      await sendPasswordResetEmail(auth!, email)
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  // 监听认证状态变化
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      // 如果Firebase未配置，返回空的清理函数
      console.warn('Firebase未配置，认证状态监听器被禁用')
      callback(null)
      return () => {}
    }
    
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(this.transformUser(firebaseUser))
      } else {
        callback(null)
      }
    })
  }

  // 获取当前用户
  getCurrentUser(): User | null {
    if (!isFirebaseConfigured || !auth) {
      return null
    }
    
    const firebaseUser = auth.currentUser
    return firebaseUser ? this.transformUser(firebaseUser) : null
  }

  // 获取 Google 访问令牌
  getGoogleAccessToken(): string | null {
    return localStorage.getItem('google_access_token')
  }

  // 检查是否已配置Firebase
  isConfigured(): boolean {
    return isFirebaseConfigured
  }

  // 转换 Firebase 用户对象
  private transformUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified
    }
  }

  // 错误信息处理
  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': '用户不存在',
      'auth/wrong-password': '密码错误',
      'auth/email-already-in-use': '邮箱已被注册',
      'auth/weak-password': '密码强度不够',
      'auth/invalid-email': '邮箱格式无效',
      'auth/user-disabled': '用户账号已被禁用',
      'auth/too-many-requests': '请求过于频繁，请稍后再试',
      'auth/network-request-failed': '网络连接失败',
      'auth/popup-closed-by-user': '登录窗口被用户关闭',
      'auth/cancelled-popup-request': '登录请求被取消'
    }
    
    return errorMessages[errorCode] || '认证失败，请重试'
  }
}

export default new AuthService()
