# 日历应用设置指南

本指南将帮助你配置和运行这个高级日历应用，包括 Firebase 认证和 Google Calendar 集成。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制环境变量示例文件：

```bash
cp .env.example .env
```

### 3. Firebase 配置

#### 3.1 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"创建项目"
3. 输入项目名称，按提示完成创建
4. 启用 Authentication 服务
5. 在 Authentication > Sign-in method 中启用：
   - 邮箱/密码
   - Google

#### 3.2 获取 Firebase 配置

1. 在项目设置中，找到"您的应用"部分
2. 点击 Web 应用图标添加应用
3. 复制配置对象中的值到 `.env` 文件：

```env
VITE_FIREBASE_API_KEY=你的_API_密钥
VITE_FIREBASE_AUTH_DOMAIN=你的项目ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=你的项目ID
VITE_FIREBASE_STORAGE_BUCKET=你的项目ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=你的消息发送者ID
VITE_FIREBASE_APP_ID=你的应用ID
```

### 4. Google Calendar API 配置

#### 4.1 启用 Google Calendar API

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google Calendar API：
   - 导航到 "API和服务" > "库"
   - 搜索 "Google Calendar API"
   - 点击启用

#### 4.2 创建 API 密钥

1. 导航到 "API和服务" > "凭据"
2. 点击 "创建凭据" > "API 密钥"
3. 复制 API 密钥到 `.env` 文件

#### 4.3 创建 OAuth 2.0 客户端

1. 在凭据页面，点击 "创建凭据" > "OAuth 客户端 ID"
2. 选择应用类型为 "Web 应用"
3. 添加授权的 JavaScript 来源：
   - `http://localhost:5173` (开发环境)
   - 你的生产域名
4. 添加授权的重定向 URI：
   - `http://localhost:5173` (开发环境)
   - 你的生产域名
5. 复制客户端 ID 到 `.env` 文件

```env
VITE_GOOGLE_API_KEY=你的_Google_API_密钥
VITE_GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
```

### 5. 运行应用

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 🔧 功能特性

### 日历功能

- ✅ **多视图支持**: 日、周、月、年视图
- ✅ **事件管理**: 创建、编辑、删除事件
- ✅ **分类管理**: 工作、个人、会议等分类
- ✅ **搜索过滤**: 快速查找事件
- ✅ **职业主题**: 程序员、教师、医生等主题风格

### 同步功能

- ✅ **Google Calendar 同步**: 双向同步本地和 Google 日历
- ✅ **实时同步**: 自动同步最新变更
- ✅ **导入功能**: 从 Google Calendar 导入现有事件
- ✅ **同步状态**: 显示同步进度和状态

### 认证功能

- ✅ **多种登录方式**: 邮箱密码、Google OAuth
- ✅ **用户管理**: 注册、登录、密码重置
- ✅ **安全认证**: Firebase 安全认证系统

### AI 助手

- ✅ **智能聊天**: AI 助手帮助管理日历
- ✅ **自动创建事件**: 通过自然语言创建事件
- ✅ **智能建议**: 基于历史数据的智能建议

## 🛠️ 开发指南

### 项目结构

```
src/
├── components/          # 组件
│   ├── Calendar.tsx     # 基础日历组件
│   ├── CalendarGridView.tsx  # 网格视图组件
│   ├── EventForm.tsx    # 事件表单
│   ├── AuthModal.tsx    # 认证模态框
│   └── ...
├── pages/              # 页面
│   ├── CalendarMain.tsx # 日历主页面
│   ├── Dashboard.tsx    # 仪表板
│   └── ...
├── services/           # 服务
│   ├── calendarService.ts    # 日历服务
│   ├── googleCalendarService.ts  # Google 日历服务
│   ├── authService.ts        # 认证服务
│   └── ...
├── config/             # 配置
│   └── firebase.ts     # Firebase 配置
└── utils/              # 工具函数
    └── careerConfig.ts # 职业配置
```

### 添加新功能

1. **创建新组件**: 在 `src/components/` 下创建
2. **添加新服务**: 在 `src/services/` 下创建
3. **更新路由**: 在 `src/App.tsx` 中添加路由
4. **更新样式**: 使用 Tailwind CSS 类

### 样式系统

应用使用动态主题系统，根据职业类型切换样式：

```typescript
const styles = getCareerStyles(career)
// 使用 styles.bg, styles.card, styles.button 等
```

## 🐛 故障排除

### 常见问题

1. **Firebase 初始化失败**
   - 检查 `.env` 文件配置是否正确
   - 确认 Firebase 项目已正确创建

2. **Google Calendar API 错误**
   - 确认 API 已启用
   - 检查 OAuth 配置是否正确
   - 验证域名授权设置

3. **认证问题**
   - 确认 Firebase Authentication 已启用
   - 检查登录方式配置

4. **同步失败**
   - 确认用户已登录
   - 检查 Google Calendar API 权限
   - 查看浏览器控制台错误信息

### 调试模式

启用调试模式查看详细日志：

```bash
npm run dev -- --debug
```

## 📝 更新日志

### v1.0.0 (最新)

- ✅ 完整的日历视图系统
- ✅ Google Calendar 双向同步
- ✅ Firebase 认证集成
- ✅ AI 助手功能
- ✅ 响应式设计
- ✅ 多主题支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## �� 许可证

MIT License 