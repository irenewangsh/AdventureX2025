# 🔥 Firebase 快速配置指南

既然你的Google API已经配置好了，我们只需要设置Firebase认证即可！

## 🚀 快速步骤

### 1️⃣ 创建Firebase项目

1. 访问：https://console.firebase.google.com/
2. 点击 **"创建项目"**
3. 项目名称：`adventure-calendar` (或你喜欢的名称)
4. 启用Google Analytics (可选)
5. 点击 **"创建项目"**

### 2️⃣ 添加Web应用

1. 在项目概览页面，点击 **Web图标** `</>`
2. 应用昵称：`AdventureX Calendar`
3. 点击 **"注册应用"**
4. **复制配置信息** (稍后要用)

### 3️⃣ 启用Authentication

1. 左侧菜单点击 **"Authentication"**
2. 点击 **"开始使用"**
3. 在 **"Sign-in method"** 标签页：

   **启用邮箱/密码登录**：
   - 点击 "电子邮件地址/密码"
   - 启用 "电子邮件地址/密码"
   - 点击 "保存"

   **启用Google登录**：
   - 点击 "Google"  
   - 启用 "Google"
   - 设置项目支持电子邮件
   - 点击 "保存"

### 4️⃣ 配置环境变量

运行我为你准备的配置脚本：

```bash
npm run setup
```

然后按提示输入你的Firebase配置信息即可！

### 5️⃣ 测试配置

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173`，检查控制台是否显示：
```
🔥 Firebase已成功初始化
```

## 📋 需要的Firebase配置信息

从Firebase Console复制这些信息：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // 复制这个
  authDomain: "project.firebaseapp.com",  // 复制这个
  projectId: "project-id",       // 复制这个
  storageBucket: "project.appspot.com",   // 复制这个
  messagingSenderId: "123456789", // 复制这个
  appId: "1:123:web:abc..."      // 复制这个
};
```

## 🎯 完成后你将拥有

- ✅ 用户注册/登录系统
- ✅ Google OAuth登录
- ✅ 安全的用户认证
- ✅ 与你现有Google Calendar的完美集成

## 🚨 如果遇到问题

1. **Firebase初始化失败**：检查.env文件配置
2. **登录失败**：确认在Firebase中启用了相应的登录方式
3. **权限错误**：检查Firebase项目权限设置

需要帮助随时问我！🚀 