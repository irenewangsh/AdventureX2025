# 🔥 Firebase 配置完整指南

欢迎！这个指南将帮你快速配置Firebase，让你的日历应用获得完整功能。

## 📋 准备工作

在开始之前，请确保你有：
- Google 账号
- 已安装 Node.js 和 npm
- 项目已经运行 `npm install`

## 🚀 第一步：创建 Firebase 项目

### 1.1 访问 Firebase Console
访问：https://console.firebase.google.com/

### 1.2 创建新项目
1. 点击 **"创建项目"** 
2. 输入项目名称，例如：`adventure-calendar`
3. 启用 Google Analytics（可选）
4. 点击 **"创建项目"**

### 1.3 添加 Web 应用
1. 在项目概览页面，点击 **Web 图标** (`</>`)
2. 输入应用昵称：`AdventureX Calendar`
3. 勾选 **"同时为此应用设置 Firebase Hosting"**（可选）
4. 点击 **"注册应用"**

## 🔑 第二步：获取 Firebase 配置

### 2.1 复制配置信息
在注册应用后，你会看到 Firebase 配置信息：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "adventure-calendar-xxxx.firebaseapp.com",
  projectId: "adventure-calendar-xxxx",
  storageBucket: "adventure-calendar-xxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

### 2.2 创建环境配置文件
在项目根目录创建 `.env` 文件：

```bash
# 在项目根目录运行
touch .env
```

### 2.3 填写配置信息
将以下内容复制到 `.env` 文件，并替换为你的真实配置：

```env
# Firebase 配置
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=adventure-calendar-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=adventure-calendar-xxxx
VITE_FIREBASE_STORAGE_BUCKET=adventure-calendar-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop

# Google API 配置 (稍后配置)
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# OpenAI API 配置 (可选)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## 🔐 第三步：启用 Authentication

### 3.1 进入 Authentication
1. 在 Firebase Console 左侧菜单点击 **"Authentication"**
2. 点击 **"开始使用"**

### 3.2 设置登录方式
在 **"Sign-in method"** 标签页：

1. **邮箱/密码登录**：
   - 点击 "电子邮件地址/密码"
   - 启用 "电子邮件地址/密码"
   - 点击 "保存"

2. **Google 登录**：
   - 点击 "Google"
   - 启用 "Google"
   - 选择项目的公开名称
   - 设置项目支持电子邮件
   - 点击 "保存"

## 📅 第四步：配置 Google Calendar API

### 4.1 访问 Google Cloud Console
访问：https://console.cloud.google.com/

### 4.2 启用 Calendar API
1. 确保选择了正确的项目（与Firebase项目相同）
2. 导航到 **"API和服务" > "库"**
3. 搜索 "Google Calendar API"
4. 点击进入并点击 **"启用"**

### 4.3 创建 API 凭据
1. 导航到 **"API和服务" > "凭据"**
2. 点击 **"创建凭据" > "API 密钥"**
3. 复制 API 密钥，更新 `.env` 文件中的 `VITE_GOOGLE_API_KEY`

### 4.4 创建 OAuth 2.0 客户端
1. 点击 **"创建凭据" > "OAuth 客户端 ID"**
2. 应用类型选择 **"Web 应用程序"**
3. 名称：`AdventureX Calendar Web Client`
4. **授权的 JavaScript 来源**：
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com (如果有生产域名)
   ```
5. **授权的重定向 URI**：
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com (如果有生产域名)
   ```
6. 点击 **"创建"**
7. 复制客户端 ID，更新 `.env` 文件中的 `VITE_GOOGLE_CLIENT_ID`

## ✨ 第五步：测试配置

### 5.1 重启开发服务器
```bash
npm run dev
```

### 5.2 检查配置状态
1. 打开浏览器访问 `http://localhost:5173`
2. 打开开发者工具 (F12)
3. 查看控制台，应该看到：
   ```
   🔥 Firebase已成功初始化
   ```

### 5.3 测试功能
- 尝试注册/登录
- 测试Google日历同步
- 创建一个测试事件

## 🎯 完整的 .env 示例

```env
# Firebase 配置
VITE_FIREBASE_API_KEY=AIzaSyDxBcEfGhIjKlMnOpQrStUvWxYz123456789
VITE_FIREBASE_AUTH_DOMAIN=adventure-calendar-abc123.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=adventure-calendar-abc123
VITE_FIREBASE_STORAGE_BUCKET=adventure-calendar-abc123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789

# Google API 配置
VITE_GOOGLE_API_KEY=AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq
VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com

# OpenAI API 配置 (可选)
VITE_OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef1234567890abcdef
```

## 🚨 常见问题解决

### 问题1：Firebase初始化失败
**解决方案**：
- 确认 `.env` 文件在项目根目录
- 检查所有环境变量名称是否正确
- 确认没有多余的空格或引号

### 问题2：Google登录失败
**解决方案**：
- 确认OAuth客户端ID正确
- 检查授权域名设置
- 确认在Firebase中启用了Google登录

### 问题3：Google Calendar同步失败
**解决方案**：
- 确认Google Calendar API已启用
- 检查API密钥权限
- 确认OAuth权限范围包含日历访问

## 🎉 配置完成！

配置完成后，你的应用将拥有：
- ✅ 用户认证系统（邮箱/Google登录）
- ✅ Google Calendar双向同步
- ✅ 安全的数据存储
- ✅ 实时用户状态管理

需要帮助？随时问我！ 🚀 