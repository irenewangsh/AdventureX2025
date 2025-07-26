
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Settings, 
  Bell,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Database,
  Cpu
} from 'lucide-react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppContext, CareerType } from '../App'
import { getCareerConfig, getCareerStyles, careerConfigs } from '../utils/careerConfig'

type UserStatus = 'working' | 'break' | 'focused' | 'meeting' | 'offline'
type StudentMajor = 'computer_science' | 'business' | 'medicine' | 'literature' | 'engineering' | 'art'

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { userAge, setUserAge, career, setCareer } = useAppContext()
  const [userStatus, setUserStatus] = useState<UserStatus>('working')
  const [studentMajor, setStudentMajor] = useState<StudentMajor>('computer_science')

  const careerConfig = getCareerConfig(career)
  const styles = getCareerStyles(career)

  const userName = "张小明"
  const userEmail = "zhangxiaoming@example.com"

  // 学生专业配置
  const studentMajorConfig = {
    computer_science: {
      name: '计算机科学',
      subjects: ['数据结构', '算法设计', '操作系统', '数据库'],
      activities: ['编程练习', '项目实践'],
      metrics: ['代码量', '项目数']
    },
    business: {
      name: '商业管理',
      subjects: ['市场营销', '财务管理', '战略规划', '人力资源'],
      activities: ['案例分析', '商业计划'],
      metrics: ['案例数', '报告数']
    },
    medicine: {
      name: '医学',
      subjects: ['解剖学', '生理学', '病理学', '临床医学'],
      activities: ['临床实习', '病例研究'],
      metrics: ['病例数', '实习时长']
    },
    literature: {
      name: '文学',
      subjects: ['古典文学', '现代文学', '写作技巧', '文学批评'],
      activities: ['阅读分析', '创作练习'],
      metrics: ['阅读量', '作品数']
    },
    engineering: {
      name: '工程学',
      subjects: ['工程力学', '材料科学', '设计原理', '项目管理'],
      activities: ['设计实践', '工程项目'],
      metrics: ['设计数', '项目数']
    },
    art: {
      name: '艺术',
      subjects: ['绘画基础', '色彩理论', '艺术史', '创意设计'],
      activities: ['创作实践', '作品展示'],
      metrics: ['作品数', '展览次数']
    }
  }

  const currentMajor = studentMajorConfig[studentMajor]

  // 根据职业生成模拟数据
  const generateCareerData = () => {
    if (career === 'student') {
      // 学生按专业生成学习效率数据
      const baseEfficiency = [85, 90, 78, 88, 93, 80, 87]
      return baseEfficiency.map((value, index) => ({
        date: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][index],
        value,
        commits: Math.floor(value / 5) + Math.floor(Math.random() * 5)
      }))
    }
    
    const baseProductivity = career === 'doctor' ? [88, 95, 82, 90, 97, 85, 92] :
                            career === 'teacher' ? [85, 90, 78, 88, 93, 80, 87] :
                            career === 'sales' ? [82, 95, 88, 92, 89, 94, 91] :
                            career === 'finance' ? [90, 88, 95, 87, 92, 89, 94] :
                            [85, 92, 78, 88, 95, 82, 90]

    return baseProductivity.map((value, index) => ({
      date: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][index],
      value,
      commits: Math.floor(value / 5) + Math.floor(Math.random() * 5)
    }))
  }

  const generateTaskDistribution = () => {
    if (career === 'student') {
      // 学生按专业生成任务分布
      return currentMajor.subjects.map((subject, index) => ({
        name: subject,
        value: [40, 25, 20, 15][index] || 10,
        color: [styles.primary, styles.secondary, styles.accent, '#9ca3af'][index] || '#9ca3af'
      }))
    }

    const distributions = {
      programmer: [
        { name: '开发编码', value: 45, color: styles.primary },
        { name: '代码审查', value: 25, color: styles.secondary },
        { name: '文档编写', value: 20, color: styles.accent },
        { name: '会议沟通', value: 10, color: '#9ca3af' }
      ],
      teacher: [
        { name: '课堂教学', value: 50, color: styles.primary },
        { name: '备课准备', value: 25, color: styles.secondary },
        { name: '作业批改', value: 15, color: styles.accent },
        { name: '家长沟通', value: 10, color: '#9ca3af' }
      ],
      doctor: [
        { name: '患者诊疗', value: 40, color: styles.primary },
        { name: '病历记录', value: 25, color: styles.secondary },
        { name: '学术研究', value: 20, color: styles.accent },
        { name: '科室会议', value: 15, color: '#9ca3af' }
      ],
      sales: [
        { name: '客户拜访', value: 45, color: styles.primary },
        { name: '商务谈判', value: 25, color: styles.secondary },
        { name: '市场分析', value: 20, color: styles.accent },
        { name: '内部协调', value: 10, color: '#9ca3af' }
      ],
      finance: [
        { name: '数据分析', value: 40, color: styles.primary },
        { name: '投资研究', value: 30, color: styles.secondary },
        { name: '风险评估', value: 20, color: styles.accent },
        { name: '客户沟通', value: 10, color: '#9ca3af' }
      ],
      freelancer: [
        { name: '项目创作', value: 50, color: styles.primary },
        { name: '客户沟通', value: 25, color: styles.secondary },
        { name: '业务拓展', value: 15, color: styles.accent },
        { name: '学习提升', value: 10, color: '#9ca3af' }
      ],
      office_worker: [
        { name: '日常办公', value: 40, color: styles.primary },
        { name: '会议协调', value: 25, color: styles.secondary },
        { name: '报告撰写', value: 20, color: styles.accent },
        { name: '团队合作', value: 15, color: '#9ca3af' }
      ]
    }
    return distributions[career] || distributions.office_worker
  }

  const generateWeeklyActivity = () => {
    if (career === 'student') {
      // 学生按专业生成活动数据
      const labels = currentMajor.metrics
      const baseData = [
        { day: '周一', primary: 120, secondary: 8 },
        { day: '周二', primary: 180, secondary: 12 },
        { day: '周三', primary: 90, secondary: 6 },
        { day: '周四', primary: 210, secondary: 15 },
        { day: '周五', primary: 150, secondary: 10 },
        { day: '周六', primary: 60, secondary: 4 },
        { day: '周日', primary: 80, secondary: 5 }
      ]
      return { data: baseData, labels }
    }

    const activities = {
      programmer: ['代码行数', '文件数'],
      teacher: ['授课时数', '学生数'],
      doctor: ['患者数', '病历数'],
      sales: ['客户数', '订单数'],
      finance: ['交易数', '报告数'],
      freelancer: ['项目数', '客户数'],
      office_worker: ['任务数', '会议数']
    }
    
    const labels = activities[career] || activities.office_worker
    const baseData = [
      { day: '周一', primary: 1200, secondary: 8 },
      { day: '周二', primary: 1800, secondary: 12 },
      { day: '周三', primary: 900, secondary: 6 },
      { day: '周四', primary: 2100, secondary: 15 },
      { day: '周五', primary: 1500, secondary: 10 },
      { day: '周六', primary: 600, secondary: 4 },
      { day: '周日', primary: 800, secondary: 5 }
    ]

    // 根据职业调整数据规模
    if (career === 'freelancer') {
      baseData.forEach(item => {
        item.primary = Math.floor(item.primary / 100) // 项目数调整为合理范围
        item.secondary = Math.floor(item.secondary * 0.8) // 客户数
      })
    } else if (career === 'office_worker') {
      baseData.forEach(item => {
        item.primary = Math.floor(item.primary / 50) // 任务数
        item.secondary = Math.floor(item.secondary * 1.2) // 会议数
      })
    }

    return { data: baseData, labels }
  }

  const productivityData = generateCareerData()
  const taskDistribution = generateTaskDistribution()
  const weeklyActivity = generateWeeklyActivity()

  const statusConfig = {
    working: { icon: careerConfig.icon, color: `bg-${styles.primary}`, emoji: careerConfig.emoji, label: careerConfig.statusLabels.working },
    break: { icon: Settings, color: 'bg-amber-600', emoji: '☕', label: careerConfig.statusLabels.break },
    focused: { icon: Activity, color: `bg-${styles.accent}`, emoji: '⚡', label: careerConfig.statusLabels.focused },
    meeting: { icon: User, color: 'bg-green-600', emoji: '👥', label: careerConfig.statusLabels.meeting },
    offline: { icon: Bell, color: 'bg-gray-600', emoji: '🌙', label: careerConfig.statusLabels.offline }
  }

  // 根据职业生成合适的分析内容
  const getCareerAnalysisContent = () => {
    const analysisMap = {
      programmer: {
        report: {
          title: '$ performance.report()',
          content: `${careerConfig.dataLabels.performance}: 94.2%\n错误率: 0.8%\n完成度: 87.5%`
        },
        optimization: {
          title: '$ efficiency.optimize()',
          content: '高效时段: 09:00-12:00\n建议: 保持专注模式\n下一步: 代码审查 14:00'
        },
        status: {
          title: '$ career.status()',
          content: `本周开发任务: 47项\n协作项目: 8个\n完成评价: 优秀`
        }
      },
      student: {
        report: {
          title: '学习报告',
          content: `${currentMajor.name}成绩: 94.2%\n错误率: 0.8%\n完成度: 87.5%`
        },
        optimization: {
          title: '学习优化',
          content: `高效时段: 09:00-12:00\n建议: 保持专注模式\n下一步: ${currentMajor.activities[0]} 14:00`
        },
        status: {
          title: '学习状态',
          content: `本周学习任务: 47项\n协作项目: 8个\n完成评价: 优秀`
        }
      },
      teacher: {
        report: {
          title: '教学报告',
          content: `教学质量: 94.2%\n学生满意度: 98.5%\n课程完成度: 87.5%`
        },
        optimization: {
          title: '教学优化',
          content: '高效时段: 09:00-12:00\n建议: 保持互动教学\n下一步: 课程准备 14:00'
        },
        status: {
          title: '教学状态',
          content: '本周教学任务: 20节课\n学生管理: 150人\n完成评价: 优秀'
        }
      },
      doctor: {
        report: {
          title: '诊疗报告',
          content: `诊疗准确率: 96.8%\n患者满意度: 95.2%\n病历完成度: 89.3%`
        },
        optimization: {
          title: '诊疗优化',
          content: '高效时段: 08:00-11:00\n建议: 充分休息保持状态\n下一步: 患者查房 14:00'
        },
        status: {
          title: '医疗状态',
          content: '本周诊疗: 85人次\n手术安排: 3台\n完成评价: 优秀'
        }
      },
      sales: {
        report: {
          title: '销售报告',
          content: `销售达成率: 112.5%\n客户满意度: 94.2%\n目标完成度: 87.5%`
        },
        optimization: {
          title: '销售优化',
          content: '高效时段: 10:00-16:00\n建议: 保持积极沟通\n下一步: 客户拜访 14:00'
        },
        status: {
          title: '销售状态',
          content: '本周销售任务: 25个客户\n成交订单: 8个\n完成评价: 优秀'
        }
      },
      finance: {
        report: {
          title: '投资报告',
          content: `投资回报率: 8.7%\n风险控制: 94.2%\n组合完成度: 87.5%`
        },
        optimization: {
          title: '投资优化',
          content: '高效时段: 09:30-15:00\n建议: 关注市场动态\n下一步: 投资分析 14:00'
        },
        status: {
          title: '投资状态',
          content: '本周分析报告: 12份\n投资决策: 5项\n完成评价: 优秀'
        }
      },
      freelancer: {
        report: {
          title: '项目报告',
          content: `项目完成率: 94.2%\n客户满意度: 96.8%\n创意评分: 87.5%`
        },
        optimization: {
          title: '创作优化',
          content: '高效时段: 10:00-14:00\n建议: 保持创意灵感\n下一步: 项目设计 16:00'
        },
        status: {
          title: '自由职业状态',
          content: '本周创作项目: 3个\n客户沟通: 8次\n完成评价: 优秀'
        }
      },
      office_worker: {
        report: {
          title: '工作报告',
          content: `工作效率: 94.2%\n任务完成率: 98.1%\n团队协作: 87.5%`
        },
        optimization: {
          title: '工作优化',
          content: '高效时段: 09:00-12:00\n建议: 保持工作节奏\n下一步: 项目汇报 14:00'
        },
        status: {
          title: '办公状态',
          content: '本周工作任务: 35项\n会议参与: 12次\n完成评价: 优秀'
        }
      }
    }

    return analysisMap[career] || analysisMap.office_worker
  }

  const analysisContent = getCareerAnalysisContent()

  return (
    <div className={`min-h-screen ${styles.bg}`} style={{ fontFamily: styles.fontPrimary }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center space-x-2 px-4 py-2 ${styles.button} transition-colors duration-200 text-sm`}
            style={{ fontFamily: styles.fontSecondary }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{career === 'programmer' ? 'cd ~/' : '返回首页'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧用户信息 */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${styles.card} p-6`}
              style={{ fontFamily: styles.fontSecondary }}
            >
              {/* 用户头像 */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className={`w-20 h-20 ${styles.card} border-2 p-1 rounded-lg`}>
                    <img 
                      src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                      alt="用户头像"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${statusConfig[userStatus].color} border-2 border-white rounded-full flex items-center justify-center text-xs`}>
                    {statusConfig[userStatus].emoji}
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className={`text-lg mb-1`} style={{ color: styles.text }}>
                    <span style={{ color: styles.textLight }}>{career === 'programmer' ? 'const user = "' : '姓名: '}</span>
                    {userName}
                    <span style={{ color: styles.textLight }}>{career === 'programmer' ? '"' : ''}</span>
                  </h2>
                  <p className={`text-sm`} style={{ color: styles.accent }}>{careerConfig.signature}</p>
                </div>
              </div>

              {/* 职业选择 */}
              <div className="mb-6">
                <label className={`text-sm mb-2 block`} style={{ color: styles.text }}>
                  <span style={{ color: styles.textLight }}>{career === 'programmer' ? '// ' : ''}职业选择：</span>
                </label>
                <select
                  value={career}
                  onChange={(e) => setCareer(e.target.value as CareerType)}
                  className={`w-full px-3 py-2 border text-sm focus:outline-none ${styles.input} rounded`}
                  style={{ fontFamily: styles.fontSecondary }}
                >
                  {Object.entries(careerConfigs).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.emoji} {config.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs" style={{ color: styles.textLight }}>
                  {careerConfig.description}
                </div>
              </div>

              {/* 学生专业选择 */}
              {career === 'student' && (
                <div className="mb-6">
                  <label className={`text-sm mb-2 block`} style={{ color: styles.text }}>
                    <span style={{ color: styles.textLight }}>专业选择：</span>
                  </label>
                  <select
                    value={studentMajor}
                    onChange={(e) => setStudentMajor(e.target.value as StudentMajor)}
                    className={`w-full px-3 py-2 border text-sm focus:outline-none ${styles.input} rounded`}
                    style={{ fontFamily: styles.fontSecondary }}
                  >
                    {Object.entries(studentMajorConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs" style={{ color: styles.textLight }}>
                    当前专业：{currentMajor.name}
                  </div>
                </div>
              )}

              {/* 系统信息 */}
              <div className="mb-6 space-y-3">
                <div className={`p-3 ${styles.card} border rounded`}>
                  <div className="text-xs mb-1" style={{ color: styles.textLight }}>
                    {career === 'programmer' ? '// user.config' : '个人信息'}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div style={{ color: styles.text }}>年龄: <span style={{ color: styles.accent }}>{userAge}</span></div>
                    <div style={{ color: styles.text }}>状态: <span style={{ color: styles.secondary }}>"{statusConfig[userStatus].label}"</span></div>
                    <div style={{ color: styles.text }}>职业: <span style={{ color: styles.primary }}>"{careerConfig.name}"</span></div>
                    {career === 'student' && (
                      <div style={{ color: styles.text }}>专业: <span style={{ color: styles.accent }}>"{currentMajor.name}"</span></div>
                    )}
                  </div>
                </div>
              </div>

              {/* 年龄设置 */}
              <div className="mb-6">
                <label className={`text-sm mb-2 block`} style={{ color: styles.text }}>
                  <span style={{ color: styles.textLight }}>{career === 'programmer' ? '// ' : ''}年龄设置：</span>
                </label>
                <input
                  type="number"
                  value={userAge}
                  onChange={(e) => setUserAge(parseInt(e.target.value) || 28)}
                  className={`w-full px-3 py-2 border text-sm focus:outline-none ${styles.card} rounded`}
                  style={{ fontFamily: styles.fontSecondary }}
                  min="10"
                  max="100"
                />
              </div>

              {/* 状态选择 */}
              <div className="mb-6">
                <h3 className={`text-sm mb-3`} style={{ color: styles.text }}>
                  <span style={{ color: styles.textLight }}>{career === 'programmer' ? '// ' : ''}状态更新：</span>
                </h3>
                <div className="space-y-2">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const IconComponent = config.icon
                    return (
                      <button
                        key={key}
                        onClick={() => setUserStatus(key as UserStatus)}
                        className={`w-full p-2 border text-sm transition-colors rounded ${
                          userStatus === key
                            ? `text-white border-gray-600`
                            : `bg-white border-gray-300`
                        }`}
                        style={{ 
                          backgroundColor: userStatus === key ? config.color.replace('bg-', '') : undefined,
                          color: userStatus === key ? 'white' : styles.text,
                          fontFamily: styles.fontSecondary
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{config.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 用户信息 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm" style={{ fontFamily: styles.fontSecondary }}>
                  <Mail className={`w-4 h-4`} style={{ color: styles.accent }} />
                  <span style={{ color: styles.text }}>{userEmail}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm" style={{ fontFamily: styles.fontSecondary }}>
                  <Settings className={`w-4 h-4`} style={{ color: styles.accent }} />
                  <span style={{ color: styles.text }}>{career === 'programmer' ? 'system.config' : '系统设置'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm" style={{ fontFamily: styles.fontSecondary }}>
                  <careerConfig.icon className={`w-4 h-4`} style={{ color: styles.accent }} />
                  <span style={{ color: styles.text }}>{career === 'programmer' ? 'terminal.active' : `${careerConfig.name}.active`}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 右侧数据分析 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 效率图表 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${styles.card} p-6 rounded-lg`}
                style={{ fontFamily: styles.fontSecondary }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className={`w-5 h-5`} style={{ color: styles.accent }} />
                  <h3 className={`text-lg`} style={{ color: styles.text }}>
                    <span style={{ color: styles.textLight }}>{career === 'programmer' ? '// ' : ''}</span>
                    {career === 'student' ? '学习效率' : careerConfig.dataLabels.productivity}
                  </h3>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productivityData}>
                      <defs>
                        <linearGradient id="careerGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={styles.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={styles.primary} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontFamily: styles.fontSecondary }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontFamily: styles.fontSecondary }} />
                      <Tooltip contentStyle={{ fontFamily: styles.fontSecondary, fontSize: '12px' }} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={styles.primary}
                        fillOpacity={1}
                        fill="url(#careerGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 text-xs" style={{ color: styles.textLight, fontFamily: styles.fontSecondary }}>
                  {career === 'programmer' ? '// avg efficiency: 87.1%' : career === 'student' ? `平均学习效率: 87.1%` : '平均效率: 87.1%'}
                </div>
              </motion.div>

              {/* 任务分布 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${styles.card} p-6 rounded-lg`}
                style={{ fontFamily: styles.fontSecondary }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Database className={`w-5 h-5`} style={{ color: styles.accent }} />
                  <h3 className={`text-lg`} style={{ color: styles.text }}>
                    <span style={{ color: styles.textLight }}>{career === 'programmer' ? '// ' : ''}</span>
                    {career === 'student' ? '学科分布' : `${careerConfig.dataLabels.tasks}分布`}
                  </h3>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <RechartsPieChart
                        data={taskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {taskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                      <Tooltip contentStyle={{ fontFamily: styles.fontSecondary, fontSize: '12px' }} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1">
                  {taskDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs" style={{ fontFamily: styles.fontSecondary }}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span style={{ color: styles.text }}>{item.name}</span>
                      </div>
                      <span style={{ color: styles.textLight }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 活动统计 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${styles.card} p-6 rounded-lg`}
                style={{ fontFamily: styles.fontSecondary }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className={`w-5 h-5`} style={{ color: styles.accent }} />
                  <h3 className={`text-lg`} style={{ color: styles.text }}>
                    <span style={{ color: styles.textLight }}>{career === 'programmer' ? '// ' : ''}</span>
                    {career === 'student' ? '学习统计' : `${careerConfig.dataLabels.time}统计`}
                  </h3>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivity.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontFamily: styles.fontSecondary }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontFamily: styles.fontSecondary }} />
                      <Tooltip contentStyle={{ fontFamily: styles.fontSecondary, fontSize: '12px' }} />
                      <Bar dataKey="primary" fill={styles.secondary} name={weeklyActivity.labels[0]} />
                      <Bar dataKey="secondary" fill={styles.primary} name={weeklyActivity.labels[1]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 text-xs" style={{ color: styles.textLight, fontFamily: styles.fontSecondary }}>
                  {career === 'programmer' ? '// total: 9,800 lines, 60 files' : 
                   career === 'student' ? `总计: 本周${weeklyActivity.labels[0]} 980, ${weeklyActivity.labels[1]} 60` :
                   `总计: 本周${weeklyActivity.labels[0]} ${weeklyActivity.data.reduce((sum, item) => sum + item.primary, 0)}, ${weeklyActivity.labels[1]} ${weeklyActivity.data.reduce((sum, item) => sum + item.secondary, 0)}`}
                </div>
              </motion.div>

              {/* 系统分析 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`${styles.card} p-6 rounded-lg`}
                style={{ fontFamily: styles.fontSecondary }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Cpu className={`w-5 h-5`} style={{ color: styles.accent }} />
                  <h3 className={`text-lg`} style={{ color: styles.text }}>
                    <span style={{ color: styles.textLight }}>{career === 'programmer' ? '// ' : ''}</span>
                    {career === 'student' ? '学习分析' : `${careerConfig.dataLabels.performance}分析`}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                    <div className="text-xs mb-2" style={{ color: styles.textLight, fontFamily: styles.fontSecondary }}>
                      {analysisContent.report.title}
                    </div>
                    <p className="text-sm text-gray-700" style={{ fontFamily: styles.fontSecondary }}>
                      {analysisContent.report.content}
                    </p>
                  </div>
                  <div className="p-3 rounded" style={{ backgroundColor: styles.bg, border: `1px solid ${styles.border}` }}>
                    <div className="text-xs mb-2" style={{ color: styles.textLight, fontFamily: styles.fontSecondary }}>
                      {analysisContent.optimization.title}
                    </div>
                    <p className="text-sm" style={{ color: styles.text, fontFamily: styles.fontSecondary }}>
                      {analysisContent.optimization.content}
                    </p>
                  </div>
                  <div className="p-3 rounded" style={{ backgroundColor: styles.accent + '10', border: `1px solid ${styles.accent}30` }}>
                    <div className="text-xs mb-2" style={{ color: styles.textLight, fontFamily: styles.fontSecondary }}>
                      {analysisContent.status.title}
                    </div>
                    <p className="text-sm" style={{ color: styles.primary, fontFamily: styles.fontSecondary }}>
                      {analysisContent.status.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
