#!/usr/bin/env node

/**
 * Firebase 配置助手脚本
 * 帮助用户快速创建 .env 文件
 */

import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

// 获取当前文件的目录路径 (ES模块中需要手动获取)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log(`
🔥 Firebase 配置助手
==================

这个脚本将帮你创建 .env 文件。
请准备好你的 Firebase 配置信息。

如果你还没有创建Firebase项目，请先查看 FIREBASE_QUICK_SETUP.md

注意：Google API 配置将保持现有设置不变。

`)

const config = {}

const questions = [
  {
    key: 'VITE_FIREBASE_API_KEY',
    question: '请输入 Firebase API Key: ',
    required: true
  },
  {
    key: 'VITE_FIREBASE_AUTH_DOMAIN',
    question: '请输入 Firebase Auth Domain (例如: your-project.firebaseapp.com): ',
    required: true
  },
  {
    key: 'VITE_FIREBASE_PROJECT_ID',
    question: '请输入 Firebase Project ID: ',
    required: true
  },
  {
    key: 'VITE_FIREBASE_STORAGE_BUCKET',
    question: '请输入 Firebase Storage Bucket (例如: your-project.appspot.com): ',
    required: true
  },
  {
    key: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    question: '请输入 Firebase Messaging Sender ID: ',
    required: true
  },
  {
    key: 'VITE_FIREBASE_APP_ID',
    question: '请输入 Firebase App ID: ',
    required: true
  },
  {
    key: 'VITE_OPENAI_API_KEY',
    question: '请输入 OpenAI API Key (可选，用于AI功能，按回车跳过): ',
    required: false
  }
]

async function askQuestion(questionObj) {
  return new Promise((resolve) => {
    rl.question(questionObj.question, (answer) => {
      if (questionObj.required && !answer.trim()) {
        console.log('❌ 这是必填项，请重新输入。')
        askQuestion(questionObj).then(resolve)
      } else {
        resolve(answer.trim())
      }
    })
  })
}

async function main() {
  try {
    console.log('📝 请填写以下配置信息：\n')

    // 收集用户输入
    for (const question of questions) {
      const answer = await askQuestion(question)
      if (answer) {
        config[question.key] = answer
      }
    }

    // 生成 .env 文件内容
    let envContent = `# Firebase 配置
# 由 setup-firebase.js 自动生成于 ${new Date().toLocaleString()}

`

    // Firebase 配置
    const firebaseKeys = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ]

    firebaseKeys.forEach(key => {
      if (config[key]) {
        envContent += `${key}=${config[key]}\n`
      }
    })

    // Google API 配置已存在，保持不变
    envContent += `\n# Google API 配置 (已配置)\n`
    envContent += `# 如需修改Google API配置，请手动编辑.env文件\n`

    // OpenAI 配置
    if (config.VITE_OPENAI_API_KEY) {
      envContent += `\n# OpenAI API 配置 (可选)\n`
      envContent += `VITE_OPENAI_API_KEY=${config.VITE_OPENAI_API_KEY}\n`
    }

    // 添加应用配置
    envContent += `\n# 应用配置\n`
    envContent += `VITE_APP_NAME=AdventureX Calendar\n`
    envContent += `VITE_APP_VERSION=1.0.0\n`

    // 写入文件
    const envPath = path.join(process.cwd(), '.env')
    
    // 检查是否已存在 .env 文件并保留Google API配置
    let existingGoogleConfig = ''
    if (fs.existsSync(envPath)) {
      try {
        const existingContent = fs.readFileSync(envPath, 'utf8')
        
        // 提取现有的Google API配置
        const googleApiKeyMatch = existingContent.match(/VITE_GOOGLE_API_KEY=(.*)/)
        const googleClientIdMatch = existingContent.match(/VITE_GOOGLE_CLIENT_ID=(.*)/)
        
        if (googleApiKeyMatch || googleClientIdMatch) {
          existingGoogleConfig = '\n# Google API 配置 (保留现有配置)\n'
          if (googleApiKeyMatch) {
            existingGoogleConfig += `VITE_GOOGLE_API_KEY=${googleApiKeyMatch[1]}\n`
          }
          if (googleClientIdMatch) {
            existingGoogleConfig += `VITE_GOOGLE_CLIENT_ID=${googleClientIdMatch[1]}\n`
          }
        }
      } catch (error) {
        console.warn('⚠️  读取现有配置失败，将创建新的配置文件')
      }
      
      const overwrite = await new Promise((resolve) => {
        rl.question('\n⚠️  .env 文件已存在，是否更新Firebase配置？(Y/n): ', (answer) => {
          resolve(answer.toLowerCase() !== 'n' && answer.toLowerCase() !== 'no')
        })
      })
      
      if (!overwrite) {
        console.log('\n❌ 操作已取消。')
        rl.close()
        return
      }
    }
    
    // 如果有现有的Google配置，替换掉生成的占位符
    if (existingGoogleConfig) {
      envContent = envContent.replace(
        /\n# Google API 配置 \(已配置\)\n# 如需修改Google API配置，请手动编辑\.env文件\n/,
        existingGoogleConfig
      )
    }

    fs.writeFileSync(envPath, envContent)

    console.log('\n✅ 配置完成！')
    console.log(`📁 .env 文件已创建: ${envPath}`)
    console.log('\n🚀 下一步：')
    console.log('1. 重启开发服务器: npm run dev')
    console.log('2. 检查浏览器控制台是否显示 "🔥 Firebase已成功初始化"')
    console.log('3. 如有问题，请查看 FIREBASE_SETUP_GUIDE.md')
    
    console.log('\n📋 你的配置预览：')
    console.log('━'.repeat(50))
    console.log(envContent)
    console.log('━'.repeat(50))

  } catch (error) {
    console.error('\n❌ 配置过程中出现错误:', error.message)
  } finally {
    rl.close()
  }
}

// 检查是否在正确的目录
const packageJsonPath = path.join(process.cwd(), 'package.json')
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ 请在项目根目录运行此脚本（应包含 package.json 文件）')
  process.exit(1)
}

main() 