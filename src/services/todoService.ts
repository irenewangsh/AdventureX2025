import CalendarService, { CalendarEvent } from './calendarService'

export interface Todo {
  id: string
  title: string
  startTime: Date
  endTime: Date
  date: Date
  completed: boolean
  progress: number
  calendarEventId?: string // 关联的日历事件ID
  category: 'work' | 'personal' | 'meeting' | 'holiday' | 'travel' | 'health'
  description?: string
  priority: 'low' | 'medium' | 'high'
}

class TodoService {
  private todos: Todo[] = []

  constructor() {
    this.loadFromStorage()
    this.initializeSampleData()
  }

  // 从本地存储加载数据
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('todos')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.todos = parsed.map((todo: any) => ({
          ...todo,
          startTime: new Date(todo.startTime),
          endTime: new Date(todo.endTime),
          date: new Date(todo.date)
        }))
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  }

  // 保存到本地存储
  saveToStorage(): void {
    try {
      localStorage.setItem('todos', JSON.stringify(this.todos))
    } catch (error) {
      console.error('Failed to save todos:', error)
    }
  }

  // 初始化示例数据
  private initializeSampleData(): void {
    if (this.todos.length === 0) {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)

      const sampleTodos: Partial<Todo>[] = [
        {
          title: '完成项目提案',
          startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
          endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0),
          date: now,
          completed: false,
          progress: 75,
          category: 'work',
          description: '准备下周的项目提案演示',
          priority: 'high'
        },
        {
          title: '团队会议准备',
          startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
          endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0),
          date: tomorrow,
          completed: false,
          progress: 50,
          category: 'meeting',
          description: '准备明天的团队周会内容',
          priority: 'medium'
        },
        {
          title: '健身计划',
          startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0),
          endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 30),
          date: now,
          completed: true,
          progress: 100,
          category: 'health',
          description: '今日健身训练',
          priority: 'low'
        }
      ]

      sampleTodos.forEach(todo => this.createTodo(todo))
    }
  }

  // 创建待办事项并同步到日历
  createTodo(todoData: Partial<Todo>): Todo {
    const todo: Todo = {
      id: this.generateId(),
      title: todoData.title || '新任务',
      startTime: todoData.startTime || new Date(),
      endTime: todoData.endTime || new Date(Date.now() + 60 * 60 * 1000),
      date: todoData.date || new Date(),
      completed: todoData.completed || false,
      progress: todoData.progress || 0,
      category: todoData.category || 'personal',
      description: todoData.description,
      priority: todoData.priority || 'medium'
    }

    // 创建对应的日历事件
    try {
      const calendarEvent = CalendarService.createEvent({
        title: `📋 ${todo.title}`,
        description: todo.description || `待办事项: ${todo.title}\n优先级: ${todo.priority}\n进度: ${todo.progress}%`,
        startTime: todo.startTime,
        endTime: todo.endTime,
        allDay: false,
        category: todo.category,
        color: this.getPriorityColor(todo.priority)
      })
      
      todo.calendarEventId = calendarEvent.id
    } catch (error) {
      console.error('Failed to create calendar event for todo:', error)
    }

    this.todos.push(todo)
    this.saveToStorage()
    return todo
  }

  // 更新待办事项并同步到日历
  updateTodo(id: string, todoData: Partial<Todo>): Todo | null {
    const index = this.todos.findIndex(todo => todo.id === id)
    if (index === -1) return null

    const updatedTodo = {
      ...this.todos[index],
      ...todoData
    }

    // 同步更新日历事件
    if (updatedTodo.calendarEventId) {
      try {
        CalendarService.updateEvent(updatedTodo.calendarEventId, {
          title: `📋 ${updatedTodo.title}`,
          description: updatedTodo.description || `待办事项: ${updatedTodo.title}\n优先级: ${updatedTodo.priority}\n进度: ${updatedTodo.progress}%\n状态: ${updatedTodo.completed ? '已完成' : '进行中'}`,
          startTime: updatedTodo.startTime,
          endTime: updatedTodo.endTime,
          category: updatedTodo.category,
          color: updatedTodo.completed ? '#10b981' : this.getPriorityColor(updatedTodo.priority)
        })
      } catch (error) {
        console.error('Failed to update calendar event for todo:', error)
      }
    }

    this.todos[index] = updatedTodo
    this.saveToStorage()
    return updatedTodo
  }

  // 删除待办事项并同步删除日历事件
  deleteTodo(id: string): boolean {
    const index = this.todos.findIndex(todo => todo.id === id)
    if (index === -1) return false

    const todo = this.todos[index]
    
    // 删除对应的日历事件
    if (todo.calendarEventId) {
      try {
        CalendarService.deleteEvent(todo.calendarEventId)
      } catch (error) {
        console.error('Failed to delete calendar event for todo:', error)
      }
    }

    this.todos.splice(index, 1)
    this.saveToStorage()
    return true
  }

  // 切换完成状态
  toggleTodoCompletion(id: string): Todo | null {
    const todo = this.todos.find(t => t.id === id)
    if (!todo) return null

    const updatedProgress = todo.completed ? todo.progress : 100
    return this.updateTodo(id, { 
      completed: !todo.completed,
      progress: updatedProgress
    })
  }

  // 更新进度
  updateProgress(id: string, progress: number): Todo | null {
    const completed = progress >= 100
    return this.updateTodo(id, { progress, completed })
  }

  // 获取所有待办事项
  getTodos(): Todo[] {
    return [...this.todos].sort((a, b) => {
      // 按优先级和时间排序
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority]
      const bPriority = priorityOrder[b.priority]
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return a.startTime.getTime() - b.startTime.getTime()
    })
  }

  // 获取今日待办事项
  getTodayTodos(): Todo[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.todos.filter(todo => {
      const todoDate = new Date(todo.date)
      todoDate.setHours(0, 0, 0, 0)
      return todoDate.getTime() === today.getTime()
    })
  }

  // 获取未完成的待办事项
  getPendingTodos(): Todo[] {
    return this.todos.filter(todo => !todo.completed)
  }

  // 根据日历事件创建待办事项
  createTodoFromCalendarEvent(event: CalendarEvent): Todo | null {
    // 检查是否已经有对应的待办事项
    const existingTodo = this.todos.find(todo => todo.calendarEventId === event.id)
    if (existingTodo) return existingTodo

    const todo = this.createTodo({
      title: event.title.replace('📋 ', ''), // 移除待办事项前缀
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      date: event.startTime,
      category: event.category,
      priority: 'medium',
      completed: false,
      progress: 0
    })

    // 更新日历事件的标题以包含待办事项标识
    try {
      CalendarService.updateEvent(event.id, {
        title: `📋 ${todo.title}`,
        description: `${event.description || ''}\n\n[自动创建的待办事项]`
      })
    } catch (error) {
      console.error('Failed to update calendar event title:', error)
    }

    return todo
  }

  // 获取统计信息
  getStats() {
    const total = this.todos.length
    const completed = this.todos.filter(t => t.completed).length
    const pending = total - completed
    const todayTodos = this.getTodayTodos()
    const todayCompleted = todayTodos.filter(t => t.completed).length
    const avgProgress = total > 0 ? Math.round(this.todos.reduce((sum, t) => sum + t.progress, 0) / total) : 0

    return {
      total,
      completed,
      pending,
      todayTotal: todayTodos.length,
      todayCompleted,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgProgress
    }
  }

  // 生成唯一ID
  private generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 根据优先级获取颜色
  private getPriorityColor(priority: string): string {
    const colors = {
      high: '#dc2626',    // 红色
      medium: '#f59e0b',  // 橙色
      low: '#10b981'      // 绿色
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }
}

export default new TodoService() 