# 🗓️ AdventureX 2025 - 智能日历应用

一个功能强大的现代化日历应用，集成了AI助手、地图服务、Google Calendar同步等高级功能。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.3-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.14.1-orange.svg)

## ✨ 功能特性

### 🗓️ 核心日历功能
- **多视图支持**: 日、周、月、年视图切换
- **事件管理**: 创建、编辑、删除、搜索事件
- **分类系统**: 工作、个人、会议、娱乐等分类
- **智能搜索**: 快速查找和过滤事件
- **职业主题**: 8种职业主题风格（程序员、教师、医生等）

### 🔄 同步功能
- **Google Calendar 双向同步**: 实时同步本地和云端日历
- **批量导入导出**: 支持大量事件数据迁移
- **同步状态监控**: 实时显示同步进度和结果
- **冲突检测**: 智能处理时间冲突

### 🤖 AI 助手
- **自然语言交互**: 通过对话创建和管理事件
- **智能建议**: 基于历史数据的个性化建议
- **联网搜索**: 实时搜索地点、天气等信息
- **地点推荐**: 智能推荐合适的会议和活动地点

### 📧 智能邮件管理
- **邮件-日历集成**: 从邮件中智能提取日历事件
- **AI邮件分析**: 自动分类、优先级评估、情感分析
- **安全扫描**: 钓鱼邮件检测、恶意内容识别
- **智能回复**: 多种语调的自动回复生成
- **邮件模板**: AI生成的个性化邮件模板
- **数据分析**: 邮件生产力分析和趋势统计

### 🗺️ 地图集成
- **地点搜索**: 全球地点智能搜索
- **地图预览**: 静态地图显示和导航
- **当前位置**: 一键获取并使用当前位置
- **导航集成**: 支持驾车、步行、公交导航

### 🔐 认证系统
- **多种登录方式**: 邮箱密码 + Google OAuth
- **安全认证**: Firebase Authentication
- **用户管理**: 注册、登录、密码重置
- **权限控制**: 基于用户状态的功能访问

## 🚀 快速开始

### 环境要求
- Node.js 16.0+
- npm 或 yarn
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 1. 克隆项目
```bash
git clone https://github.com/your-username/adventurex-calendar.git
cd adventurex-calendar
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置

#### 创建环境变量文件
```bash
cp .env.example .env
```

#### 配置 Firebase（必需）
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目
3. 启用 Authentication 服务
4. 添加 Web 应用并获取配置信息
5. 在 `.env` 文件中填入配置：

```env
# Firebase 配置
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 配置 Google Calendar API（推荐）
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 启用 Google Calendar API
3. 创建 API 密钥和 OAuth 2.0 客户端
4. 在 `.env` 文件中填入配置：

```env
# Google API 配置
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

#### 配置 OpenAI API（可选）
```env
# OpenAI API 配置（AI联网功能）
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 4. 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 📖 使用指南

### 基础功能

#### 创建事件
1. 点击"创建事件"按钮
2. 填写事件标题、时间、地点等信息
3. 选择分类和主题
4. 点击保存

#### 使用AI助手
1. 点击"AI助手"按钮打开聊天面板
2. 用自然语言描述你的需求，例如：
   - "明天下午2点创建团队会议"
   - "查看今天的安排"
   - "推荐一个开会的地方"

#### 邮件管理功能
1. 点击"邮件管理"按钮打开邮件面板
2. 智能邮件分析：
   - 自动分类邮件（会议、任务、重要等8大类别）
   - 优先级评估和情感分析
   - 安全扫描检测钓鱼邮件
3. 从邮件提取事件：
   - 点击"提取事件"自动识别邮件中的日历信息
   - 一键创建会议邀请
   - 智能生成邮件模板
4. 智能回复功能：
   - 多种语调的自动回复（正式、随意、友好、专业）
   - 一键应用智能回复
   - 邮件生产力分析

#### 地图功能
1. 在创建事件时点击"事件地点"
2. 搜索或选择地点
3. 查看地图预览
4. 点击导航按钮跳转到Google Maps

### 高级功能

#### Google Calendar 同步
1. 登录你的Google账号
2. 点击"同步"按钮
3. 选择同步方向（导入/导出）
4. 等待同步完成

#### 职业主题切换
1. 在设置中选择你的职业
2. 界面将自动切换为相应的主题风格
3. 支持程序员、教师、医生等8种职业

## 🛠️ 开发指南

### 项目结构
```
src/
├── components/          # React组件
│   ├── Calendar.tsx     # 日历组件
│   ├── EventForm.tsx    # 事件表单
│   ├── AIChat.tsx       # AI聊天组件
│   └── ...
├── pages/              # 页面组件
│   ├── CalendarMain.tsx # 日历主页面
│   ├── Dashboard.tsx    # 仪表板
│   └── ...
├── services/           # 服务层
│   ├── calendarService.ts    # 日历服务
│   ├── googleCalendarService.ts  # Google日历服务
│   ├── aiService.ts           # AI服务
│   ├── emailService.ts        # 邮件服务
│   ├── enhancedEmailAI.ts     # 增强邮件AI服务
│   └── ...
├── config/             # 配置文件
│   └── firebase.ts     # Firebase配置
└── utils/              # 工具函数
    └── careerConfig.ts # 职业配置
```

### 添加新功能
1. **创建组件**: 在 `src/components/` 下创建新组件
2. **添加服务**: 在 `src/services/` 下创建新服务
3. **更新路由**: 在 `src/App.tsx` 中添加路由
4. **样式设计**: 使用 Tailwind CSS 类

### 构建和部署
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 🔧 配置说明

### 演示模式
应用支持演示模式，无需配置API密钥即可体验：
- 所有UI和交互功能完全可用
- 提供模拟数据和响应
- 适合演示和测试

### API密钥配置优先级
1. **必需**: Firebase配置（用户认证）
2. **推荐**: Google Calendar API（日历同步）
3. **推荐**: OpenAI API（AI助手和邮件分析功能）
4. **可选**: Google Maps API（地图功能）
5. **可选**: 邮件服务API（邮件发送功能）

## 🐛 故障排除

### 常见问题

#### Firebase初始化失败
- 检查 `.env` 文件配置是否正确
- 确认Firebase项目已正确创建
- 验证Authentication服务已启用

#### Google Calendar同步失败
- 确认Google Calendar API已启用
- 检查OAuth配置和域名授权
- 验证API密钥权限

#### AI助手不响应
- 检查网络连接
- 确认OpenAI API密钥配置（推荐）
- 查看浏览器控制台错误信息

#### 邮件功能异常
- 确认邮件服务配置正确
- 检查邮件API密钥和SMTP设置
- 验证邮件发送权限

#### 地图功能异常
- 确认Google Maps API密钥配置
- 检查域名授权设置
- 验证API配额使用情况

### 调试模式
```bash
# 启用调试模式
npm run dev -- --debug
```

## 📊 性能优化

### 最佳实践
- 定期清理本地存储数据
- 合理使用API配额
- 启用浏览器缓存
- 使用懒加载优化大列表

### 监控指标
- 页面加载时间 < 3秒
- AI响应时间 < 2秒
- 事件操作响应 < 1秒

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 编写单元测试
- 更新文档

## 📝 更新日志

### v1.0.0 (2025-01-XX)
- ✅ 完整的日历视图系统
- ✅ Google Calendar 双向同步
- ✅ Firebase 认证集成
- ✅ AI 助手功能
- ✅ 智能邮件管理系统
- ✅ 地图集成服务
- ✅ 响应式设计
- ✅ 多主题支持

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 前端框架
- [Firebase](https://firebase.google.com/) - 后端服务
- [Google Calendar API](https://developers.google.com/calendar) - 日历同步
- [OpenAI](https://openai.com/) - AI服务
- [Zero 邮件项目](https://github.com/Mail-0/Zero) - 邮件AI架构
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架


**AdventureX 2025** - 让日程管理更智能！ 🚀 