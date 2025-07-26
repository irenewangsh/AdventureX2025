
import { 
  Code2, 
  Briefcase, 
  BookOpen, 
  GraduationCap, 
  Stethoscope, 
  TrendingUp, 
  Users, 
  Laptop,
  Coffee,
  PenTool,
  Calculator,
  Target,
  Globe,
  FileText,
  Clock,
  Calendar,
  BarChart3,
  Award,
  Heart,
  Lightbulb
} from 'lucide-react'

export interface CareerConfig {
  id: string
  name: string
  icon: any
  emoji: string
  signature: string
  description: string
  
  // 完全不同的UI模板
  uiTemplate: {
    // 整体布局风格
    layoutStyle: 'terminal' | 'paper' | 'medical' | 'luxury' | 'dynamic' | 'notebook' | 'creative' | 'corporate'
    
    // 字体系统 - 完全不同
    fonts: {
      primary: string
      secondary: string
      display: string
      mono: string
    }
    
    // 配色方案 - 完全不同
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
      surface: string
      text: string
      textLight: string
      border: string
      success: string
      warning: string
      error: string
    }
    
    // 背景系统 - 完全不同
    backgrounds: {
      main: string
      sidebar: string
      card: string
      input: string
      button: string
    }
    
    // 视觉风格 - 完全不同
    visual: {
      borderRadius: string
      shadows: string
      spacing: string
      animations: string
      decorations: string[]
    }
    
    // 组件样式 - 完全不同
    components: {
      button: string
      card: string
      input: string
      sidebar: string
      header: string
    }
  }
  
  statusLabels: {
    working: string
    break: string
    focused: string
    meeting: string
    offline: string
  }
  quickCommands: string[]
  dataLabels: {
    productivity: string
    tasks: string
    time: string
    performance: string
  }
  welcomeTexts: string[]
}

export const careerConfigs: Record<string, CareerConfig> = {
  // 程序员 - 白底黑字终端风格（高对比度可读性）
  programmer: {
    id: 'programmer',
    name: '程序员',
    icon: Code2,
    emoji: '💻',
    signature: '用代码改变世界，创造数字未来',
    description: '专注于软件开发与技术创新',
    
    uiTemplate: {
      layoutStyle: 'terminal',
      fonts: {
        primary: "'JetBrains Mono', 'Fira Code', monospace",
        secondary: "'Source Code Pro', monospace",
        display: "'Orbitron', monospace",
        mono: "'Consolas', monospace"
      },
      colors: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#666666',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#000000',
        textLight: '#666666',
        border: '#e0e0e0',
        success: '#000000',
        warning: '#333333',
        error: '#666666'
      },
      backgrounds: {
        main: 'bg-white',
        sidebar: 'bg-gray-50 border-gray-300',
        card: 'bg-white border border-gray-300',
        input: 'bg-white border-gray-400 text-black',
        button: 'bg-black hover:bg-gray-800 text-white font-mono'
      },
      visual: {
        borderRadius: '0px',
        shadows: 'shadow-lg shadow-gray-300/50',
        spacing: 'compact',
        animations: 'glitch',
        decorations: ['matrix-rain', 'terminal-cursor', 'code-lines']
      },
      components: {
        button: 'px-4 py-2 bg-black hover:bg-gray-800 text-white font-mono uppercase tracking-wider transition-all duration-200 border border-gray-300',
        card: 'bg-white border border-gray-300 shadow-lg',
        input: 'bg-white border border-gray-400 text-black font-mono placeholder-gray-500 focus:border-gray-600',
        sidebar: 'bg-gray-50 border-r border-gray-300',
        header: 'bg-gradient-to-r from-white to-gray-50 border-b border-gray-300'
      }
    },
    
    statusLabels: {
      working: '编码中',
      break: '代码休息',
      focused: '深度开发',
      meeting: '技术会议',
      offline: '离线调试'
    },
    quickCommands: ['git status', 'npm run dev', 'code review', 'deploy prod'],
    dataLabels: {
      productivity: '代码效率',
      tasks: '开发任务',
      time: '编码时间',
      performance: '代码质量'
    },
    welcomeTexts: ['准备开始今天的编码之旅？', '让我们一起构建优秀的软件', '代码世界等着你去探索']
  },

  // 教师 - 温暖纸质书本风格
  teacher: {
    id: 'teacher',
    name: '教师',
    icon: BookOpen,
    emoji: '📚',
    signature: '传道授业解惑，培育未来栋梁',
    description: '教书育人，传承知识与智慧',
    
    uiTemplate: {
      layoutStyle: 'paper',
      fonts: {
        primary: "'Noto Serif SC', 'Times New Roman', serif",
        secondary: "'Ma Shan Zheng', cursive",
        display: "'Zhi Mang Xing', cursive",
        mono: "'Courier New', monospace"
      },
      colors: {
        primary: '#8b4513',
        secondary: '#deb887',
        accent: '#cd853f',
        background: '#faf6f0',
        surface: '#fff8dc',
        text: '#5d4e37',
        textLight: '#a0522d',
        border: '#daa520',
        success: '#228b22',
        warning: '#ff8c00',
        error: '#dc143c'
      },
      backgrounds: {
        main: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
        sidebar: 'bg-gradient-to-b from-amber-100 to-orange-100 border-r-4 border-amber-600',
        card: 'bg-gradient-to-br from-white to-amber-50 border-2 border-amber-300 shadow-xl',
        input: 'bg-white border-2 border-amber-400 text-amber-900',
        button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
      },
      visual: {
        borderRadius: '12px',
        shadows: 'shadow-2xl shadow-amber-500/30',
        spacing: 'comfortable',
        animations: 'gentle',
        decorations: ['book-pages', 'chalk-dust', 'wisdom-quotes']
      },
      components: {
        button: 'px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-serif shadow-lg',
        card: 'bg-gradient-to-br from-white to-amber-50 border-2 border-amber-300 rounded-xl shadow-xl shadow-amber-500/20',
        input: 'bg-white border-2 border-amber-400 rounded-lg text-amber-900 placeholder-amber-500 focus:border-amber-600',
        sidebar: 'bg-gradient-to-b from-amber-100 to-orange-100 border-r-4 border-amber-600',
        header: 'bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 border-b-4 border-amber-600'
      }
    },
    
    statusLabels: {
      working: '授课中',
      break: '课间休息',
      focused: '备课中',
      meeting: '教研会议',
      offline: '下课了'
    },
    quickCommands: ['课程安排', '学生管理', '作业批改', '教学计划'],
    dataLabels: {
      productivity: '教学效果',
      tasks: '教学任务',
      time: '授课时间',
      performance: '教学质量'
    },
    welcomeTexts: ['今天要给学生们带来什么知识？', '教育是点亮心灵的火把', '每一堂课都是播种希望']
  },

  // 医生 - 清洁医疗风格
  doctor: {
    id: 'doctor',
    name: '医生',
    icon: Stethoscope,
    emoji: '⚕️',
    signature: '救死扶伤，守护生命健康',
    description: '医者仁心，专业严谨治病救人',
    
    uiTemplate: {
      layoutStyle: 'medical',
      fonts: {
        primary: "'Inter', 'Helvetica Neue', sans-serif",
        secondary: "'Roboto', sans-serif",
        display: "'Montserrat', sans-serif",
        mono: "'SF Mono', monospace"
      },
      colors: {
        primary: '#006a6b',
        secondary: '#40e0d0',
        accent: '#20b2aa',
        background: '#f0ffff',
        surface: '#e0ffff',
        text: '#2f4f4f',
        textLight: '#708090',
        border: '#b0e0e6',
        success: '#00ced1',
        warning: '#ffa500',
        error: '#ff6347'
      },
      backgrounds: {
        main: 'bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50',
        sidebar: 'bg-white border-r-8 border-teal-400 shadow-xl',
        card: 'bg-white border-l-4 border-teal-400 shadow-lg',
        input: 'bg-white border-2 border-teal-300 text-teal-900',
        button: 'bg-teal-500 hover:bg-teal-600 text-white'
      },
      visual: {
        borderRadius: '8px',
        shadows: 'shadow-xl shadow-teal-500/20',
        spacing: 'clinical',
        animations: 'pulse',
        decorations: ['heartbeat-line', 'medical-cross', 'vital-signs']
      },
      components: {
        button: 'px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium shadow-md transition-all',
        card: 'bg-white border-l-4 border-teal-400 rounded-lg shadow-lg p-6',
        input: 'bg-white border-2 border-teal-300 rounded-lg text-teal-900 placeholder-teal-400 focus:border-teal-500',
        sidebar: 'bg-white border-r-8 border-teal-400 shadow-xl',
        header: 'bg-gradient-to-r from-teal-100 to-cyan-100 border-b-4 border-teal-400'
      }
    },
    
    statusLabels: {
      working: '诊疗中',
      break: '休息时间',
      focused: '手术中',
      meeting: '病例讨论',
      offline: '下班了'
    },
    quickCommands: ['患者管理', '病历记录', '医嘱开具', '查房安排'],
    dataLabels: {
      productivity: '诊疗效率',
      tasks: '医疗任务',
      time: '工作时间',
      performance: '治疗效果'
    },
    welcomeTexts: ['今天要帮助多少患者康复？', '医者仁心，生命至上', '每一次诊疗都关乎生命']
  },

  // 金融分析师 - 奢华金融风格
  finance: {
    id: 'finance',
    name: '金融分析师',
    icon: TrendingUp,
    emoji: '💰',
    signature: '精准分析，稳健投资理财',
    description: '专业理财，把握市场脉搏',
    
    uiTemplate: {
      layoutStyle: 'luxury',
      fonts: {
        primary: "'Playfair Display', 'Times', serif",
        secondary: "'Crimson Text', serif",
        display: "'Cormorant Garamond', serif",
        mono: "'IBM Plex Mono', monospace"
      },
      colors: {
        primary: '#b8860b',
        secondary: '#daa520',
        accent: '#ffd700',
        background: '#fffef7',
        surface: '#faf7ef',
        text: '#654321',
        textLight: '#8b7355',
        border: '#d4af37',
        success: '#228b22',
        warning: '#ff8c00',
        error: '#b22222'
      },
      backgrounds: {
        main: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50',
        sidebar: 'bg-gradient-to-b from-yellow-100 via-amber-100 to-orange-100 border-r-8 border-yellow-600',
        card: 'bg-gradient-to-br from-white via-yellow-50 to-amber-50 border-4 border-yellow-400 shadow-2xl',
        input: 'bg-gradient-to-r from-white to-yellow-50 border-3 border-yellow-500 text-yellow-900',
        button: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-white'
      },
      visual: {
        borderRadius: '16px',
        shadows: 'shadow-2xl shadow-yellow-500/40',
        spacing: 'luxurious',
        animations: 'elegant',
        decorations: ['golden-ratio', 'market-ticker', 'currency-symbols']
      },
      components: {
        button: 'px-8 py-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-white rounded-2xl font-serif text-lg shadow-xl',
        card: 'bg-gradient-to-br from-white via-yellow-50 to-amber-50 border-4 border-yellow-400 rounded-2xl shadow-2xl p-8',
        input: 'bg-gradient-to-r from-white to-yellow-50 border-3 border-yellow-500 rounded-xl text-yellow-900 placeholder-yellow-600 focus:border-yellow-700',
        sidebar: 'bg-gradient-to-b from-yellow-100 via-amber-100 to-orange-100 border-r-8 border-yellow-600',
        header: 'bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 border-b-8 border-yellow-600'
      }
    },
    
    statusLabels: {
      working: '分析中',
      break: '市场观察',
      focused: '深度研究',
      meeting: '投资会议',
      offline: '收市了'
    },
    quickCommands: ['市场分析', '投资组合', '风险评估', '财务报告'],
    dataLabels: {
      productivity: '投资回报',
      tasks: '金融任务',
      time: '交易时间',
      performance: '业绩表现'
    },
    welcomeTexts: ['今天的市场机会在哪里？', '理性投资，稳健获利', '把握趋势，创造价值']
  },

  // 销售 - 动感活力风格
  sales: {
    id: 'sales',
    name: '销售',
    icon: Users,
    emoji: '🎯',
    signature: '客户至上，业绩为王',
    description: '专业销售，创造双赢价值',
    
    uiTemplate: {
      layoutStyle: 'dynamic',
      fonts: {
        primary: "'Montserrat', 'Arial Black', sans-serif",
        secondary: "'Oswald', sans-serif",
        display: "'Bebas Neue', cursive",
        mono: "'Roboto Mono', monospace"
      },
      colors: {
        primary: '#dc143c',
        secondary: '#ff1493',
        accent: '#ff69b4',
        background: '#fff0f5',
        surface: '#ffe4e1',
        text: '#8b0000',
        textLight: '#cd5c5c',
        border: '#ff6347',
        success: '#32cd32',
        warning: '#ffa500',
        error: '#ff0000'
      },
      backgrounds: {
        main: 'bg-gradient-to-tr from-red-50 via-pink-50 to-rose-50',
        sidebar: 'bg-gradient-to-b from-red-100 via-pink-100 to-rose-100 border-r-6 border-red-500',
        card: 'bg-gradient-to-br from-white via-pink-50 to-red-50 border-3 border-red-400 shadow-xl transform hover:scale-105',
        input: 'bg-white border-3 border-red-400 text-red-800',
        button: 'bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 text-white'
      },
      visual: {
        borderRadius: '20px',
        shadows: 'shadow-xl shadow-red-500/30',
        spacing: 'energetic',
        animations: 'bounce',
        decorations: ['target-rings', 'success-sparks', 'achievement-badges']
      },
      components: {
        button: 'px-8 py-4 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-full font-bold text-lg shadow-xl transform hover:scale-105 transition-all',
        card: 'bg-gradient-to-br from-white via-pink-50 to-red-50 border-3 border-red-400 rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all',
        input: 'bg-white border-3 border-red-400 rounded-2xl text-red-800 placeholder-red-500 focus:border-red-600',
        sidebar: 'bg-gradient-to-b from-red-100 via-pink-100 to-rose-100 border-r-6 border-red-500',
        header: 'bg-gradient-to-r from-red-200 via-pink-200 to-rose-200 border-b-6 border-red-500'
      }
    },
    
    statusLabels: {
      working: '拜访客户',
      break: '休息时间',
      focused: '商务谈判',
      meeting: '销售会议',
      offline: '下班了'
    },
    quickCommands: ['客户管理', '销售跟进', '业绩统计', '商机分析'],
    dataLabels: {
      productivity: '销售业绩',
      tasks: '销售任务',
      time: '工作时间',
      performance: '成交率'
    },
    welcomeTexts: ['今天要拜访哪些客户？', '每一次沟通都是机会', '专业服务创造价值']
  },

  // 学生 - 可爱笔记本风格
  student: {
    id: 'student',
    name: '学生',
    icon: GraduationCap,
    emoji: '🎓',
    signature: '勤奋学习，追求知识与成长',
    description: '专心学业，全面发展自己',
    
    uiTemplate: {
      layoutStyle: 'notebook',
      fonts: {
        primary: "'Comic Neue', 'Comic Sans MS', cursive",
        secondary: "'Kalam', cursive",
        display: "'Fredoka One', cursive",
        mono: "'Source Code Pro', monospace"
      },
      colors: {
        primary: '#4169e1',
        secondary: '#87ceeb',
        accent: '#9370db',
        background: '#f0f8ff',
        surface: '#e6f3ff',
        text: '#191970',
        textLight: '#6495ed',
        border: '#87cefa',
        success: '#32cd32',
        warning: '#ffa500',
        error: '#ff69b4'
      },
      backgrounds: {
        main: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
        sidebar: 'bg-gradient-to-b from-blue-100 via-indigo-100 to-purple-100 border-r-4 border-blue-400 border-dashed',
        card: 'bg-white border-2 border-blue-300 border-dashed shadow-lg',
        input: 'bg-white border-2 border-blue-400 border-dashed text-blue-800',
        button: 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white'
      },
      visual: {
        borderRadius: '25px',
        shadows: 'shadow-lg shadow-blue-500/25',
        spacing: 'playful',
        animations: 'wobble',
        decorations: ['notebook-lines', 'doodles', 'stickers']
      },
      components: {
        button: 'px-6 py-3 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-full font-bold shadow-lg transform hover:rotate-1 transition-all',
        card: 'bg-white border-2 border-blue-300 border-dashed rounded-3xl shadow-lg p-6 transform hover:rotate-1 transition-all',
        input: 'bg-white border-2 border-blue-400 border-dashed rounded-2xl text-blue-800 placeholder-blue-500 focus:border-purple-400',
        sidebar: 'bg-gradient-to-b from-blue-100 via-indigo-100 to-purple-100 border-r-4 border-blue-400 border-dashed',
        header: 'bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 border-b-4 border-blue-400 border-dashed'
      }
    },
    
    statusLabels: {
      working: '学习中',
      break: '课间休息',
      focused: '专心复习',
      meeting: '小组讨论',
      offline: '放学了'
    },
    quickCommands: ['课程表', '作业提醒', '考试安排', '学习计划'],
    dataLabels: {
      productivity: '学习效率',
      tasks: '学习任务',
      time: '学习时间',
      performance: '学习成绩'
    },
    welcomeTexts: ['今天要学习什么新知识？', '知识是通向未来的钥匙', '每天进步一点点']
  },

  // 自由职业者 - 创意艺术风格
  freelancer: {
    id: 'freelancer',
    name: '自由职业者',
    icon: Laptop,
    emoji: '🌟',
    signature: '自由创作，灵活工作',
    description: '独立工作，追求创意与自由',
    
    uiTemplate: {
      layoutStyle: 'creative',
      fonts: {
        primary: "'Poppins', 'Helvetica Neue', sans-serif",
        secondary: "'Dancing Script', cursive",
        display: "'Pacifico', cursive",
        mono: "'Fira Code', monospace"
      },
      colors: {
        primary: '#9932cc',
        secondary: '#da70d6',
        accent: '#ff69b4',
        background: '#faf0e6',
        surface: '#f5f0ff',
        text: '#4b0082',
        textLight: '#9370db',
        border: '#dda0dd',
        success: '#98fb98',
        warning: '#ffa07a',
        error: '#f0696a'
      },
      backgrounds: {
        main: 'bg-gradient-to-tr from-purple-50 via-pink-50 to-indigo-50',
        sidebar: 'bg-gradient-to-b from-purple-100 via-pink-100 to-indigo-100 border-r-8 border-purple-400 rounded-r-3xl',
        card: 'bg-gradient-to-br from-white via-purple-50 to-pink-50 border-4 border-purple-300 shadow-2xl transform rotate-1',
        input: 'bg-gradient-to-r from-white to-purple-50 border-3 border-purple-400 text-purple-800',
        button: 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white'
      },
      visual: {
        borderRadius: '30px',
        shadows: 'shadow-2xl shadow-purple-500/40',
        spacing: 'artistic',
        animations: 'float',
        decorations: ['paint-splashes', 'creative-sparks', 'color-waves']
      },
      components: {
        button: 'px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white rounded-full font-bold text-lg shadow-2xl transform hover:rotate-3 transition-all',
        card: 'bg-gradient-to-br from-white via-purple-50 to-pink-50 border-4 border-purple-300 rounded-3xl shadow-2xl p-8 transform rotate-1 hover:rotate-2 transition-all',
        input: 'bg-gradient-to-r from-white to-purple-50 border-3 border-purple-400 rounded-3xl text-purple-800 placeholder-purple-500 focus:border-pink-400',
        sidebar: 'bg-gradient-to-b from-purple-100 via-pink-100 to-indigo-100 border-r-8 border-purple-400 rounded-r-3xl',
        header: 'bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 border-b-8 border-purple-400 rounded-b-3xl'
      }
    },
    
    statusLabels: {
      working: '创作中',
      break: '灵感时间',
      focused: '专注创作',
      meeting: '客户沟通',
      offline: '自由时间'
    },
    quickCommands: ['项目管理', '创意设计', '客户沟通', '作品展示'],
    dataLabels: {
      productivity: '创作效率',
      tasks: '项目任务',
      time: '工作时间',
      performance: '项目质量'
    },
    welcomeTexts: ['今天要创作什么精彩内容？', '自由工作，无限创意', '每个项目都是新的挑战']
  },

  // 上班族 - 简洁企业风格
  office_worker: {
    id: 'office_worker',
    name: '上班族',
    icon: Briefcase,
    emoji: '💼',
    signature: '高效工作，追求专业卓越',
    description: '专业办公，注重效率与协作',
    
    uiTemplate: {
      layoutStyle: 'corporate',
      fonts: {
        primary: "'Inter', 'Segoe UI', sans-serif",
        secondary: "'Roboto', sans-serif",
        display: "'Montserrat', sans-serif",
        mono: "'Courier New', monospace"
      },
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
        background: '#ecf0f1',
        surface: '#ffffff',
        text: '#2c3e50',
        textLight: '#7f8c8d',
        border: '#bdc3c7',
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c'
      },
      backgrounds: {
        main: 'bg-gradient-to-br from-gray-100 via-blue-50 to-slate-100',
        sidebar: 'bg-white border-r-2 border-gray-300 shadow-lg',
        card: 'bg-white border border-gray-200 shadow-md',
        input: 'bg-white border border-gray-300 text-gray-800',
        button: 'bg-blue-500 hover:bg-blue-600 text-white'
      },
      visual: {
        borderRadius: '6px',
        shadows: 'shadow-md shadow-gray-300/50',
        spacing: 'professional',
        animations: 'smooth',
        decorations: ['grid-lines', 'progress-bars', 'charts']
      },
      components: {
        button: 'px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium shadow-md transition-all',
        card: 'bg-white border border-gray-200 rounded-lg shadow-md p-6',
        input: 'bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:border-blue-500',
        sidebar: 'bg-white border-r-2 border-gray-300 shadow-lg',
        header: 'bg-gradient-to-r from-gray-100 to-blue-100 border-b-2 border-gray-300'
      }
    },
    
    statusLabels: {
      working: '工作中',
      break: '休息时间',
      focused: '专注工作',
      meeting: '会议中',
      offline: '下班了'
    },
    quickCommands: ['查看邮件', '安排会议', '处理文档', '项目进度'],
    dataLabels: {
      productivity: '工作效率',
      tasks: '工作任务',
      time: '工作时间',
      performance: '工作表现'
    },
    welcomeTexts: ['新的工作日开始了！', '让我们高效完成今天的任务', '专业态度成就卓越成果']
  }
}

export const getCareerConfig = (career: string): CareerConfig => {
  return careerConfigs[career] || careerConfigs.programmer
}

export const getCareerStyles = (career: string) => {
  const config = getCareerConfig(career)
  const template = config.uiTemplate
  
  return {
    // 字体系统
    fontPrimary: template.fonts.primary,
    fontSecondary: template.fonts.secondary,
    fontDisplay: template.fonts.display,
    fontMono: template.fonts.mono,
    
    // 背景样式
    bg: template.backgrounds.main,
    sidebar: template.backgrounds.sidebar,
    card: template.backgrounds.card,
    input: template.backgrounds.input,
    button: template.backgrounds.button,
    
    // 颜色系统
    primary: template.colors.primary,
    secondary: template.colors.secondary,
    accent: template.colors.accent,
    text: template.colors.text,
    textLight: template.colors.textLight,
    border: template.colors.border,
    success: template.colors.success,
    warning: template.colors.warning,
    error: template.colors.error,
    
    // 视觉效果
    borderRadius: template.visual.borderRadius,
    shadows: template.visual.shadows,
    spacing: template.visual.spacing,
    animations: template.visual.animations,
    decorations: template.visual.decorations,
    
    // 布局风格
    layoutStyle: template.layoutStyle,
    
    // 职业配置
    career: config
  }
}

// 获取职业特色装饰元素
export const getCareerDecorations = (career: string) => {
  const config = getCareerConfig(career)
  return config.uiTemplate.visual.decorations
}

// 获取职业特色背景图案
export const getCareerBackgroundPattern = (career: string) => {
  const config = getCareerConfig(career)
  return config.uiTemplate.layoutStyle
}
