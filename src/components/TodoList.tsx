
import React, { useState, useEffect } from 'react'
import { Plus, Clock, CheckCircle, Circle, Calendar, AlertCircle, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAppContext } from '../App'
import { getCareerStyles } from '../utils/careerConfig'
import TodoService, { Todo } from '../services/todoService'

interface TodoListProps {
  className?: string
  onTodoChange?: () => void // 通知父组件待办事项发生变化
}

const TodoList: React.FC<TodoListProps> = ({ className = '', onTodoChange }) => {
  const { career } = useAppContext()
  const styles = getCareerStyles(career, 'normal')
  const [todos, setTodos] = useState<Todo[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [newTodo, setNewTodo] = useState({
    title: '',
    startTime: '',
    endTime: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    priority: 'medium' as const,
    category: 'personal' as const
  })

  useEffect(() => {
    loadTodos()

    // 监听全局事件更新（可能有新的待办事项从日历事件同步而来）
    const handleGlobalEventUpdate = () => {
      loadTodos()
    }

    window.addEventListener('calendarEventsUpdated', handleGlobalEventUpdate as EventListener)

    return () => {
      window.removeEventListener('calendarEventsUpdated', handleGlobalEventUpdate as EventListener)
    }
  }, [])

  const loadTodos = () => {
    const loadedTodos = TodoService.getTodos()
    setTodos(loadedTodos)
  }

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      toast.error('请输入任务标题')
      return
    }

    if (!newTodo.startTime || !newTodo.endTime) {
      toast.error('请设置开始和结束时间')
      return
    }

    try {
      const startDateTime = new Date(`${newTodo.date}T${newTodo.startTime}`)
      const endDateTime = new Date(`${newTodo.date}T${newTodo.endTime}`)

      if (endDateTime <= startDateTime) {
        toast.error('结束时间必须晚于开始时间')
        return
      }

      const todo = TodoService.createTodo({
        title: newTodo.title,
        description: newTodo.description,
        startTime: startDateTime,
        endTime: endDateTime,
        date: new Date(newTodo.date),
        category: newTodo.category,
        priority: newTodo.priority,
        completed: false,
        progress: 0
      })

      setTodos(TodoService.getTodos())
      resetForm()
      toast.success('待办事项已创建并同步到日历！')
      onTodoChange?.()
    } catch (error) {
      toast.error('创建失败，请重试')
    }
  }

  const handleUpdateTodo = async () => {
    if (!editingTodo || !newTodo.title.trim()) {
      toast.error('请输入任务标题')
      return
    }

    try {
      const startDateTime = new Date(`${newTodo.date}T${newTodo.startTime}`)
      const endDateTime = new Date(`${newTodo.date}T${newTodo.endTime}`)

      TodoService.updateTodo(editingTodo.id, {
        title: newTodo.title,
        description: newTodo.description,
        startTime: startDateTime,
        endTime: endDateTime,
        date: new Date(newTodo.date),
        category: newTodo.category,
        priority: newTodo.priority
      })

      setTodos(TodoService.getTodos())
      resetForm()
      toast.success('待办事项已更新并同步到日历！')
      onTodoChange?.()
    } catch (error) {
      toast.error('更新失败，请重试')
    }
  }

  const handleToggleTodo = (id: string) => {
    const updatedTodo = TodoService.toggleTodoCompletion(id)
    if (updatedTodo) {
      setTodos(TodoService.getTodos())
      toast.success(updatedTodo.completed ? '任务已完成！' : '任务已重新激活')
      onTodoChange?.()
    }
  }

  const handleDeleteTodo = (id: string) => {
    if (TodoService.deleteTodo(id)) {
      setTodos(TodoService.getTodos())
      toast.success('待办事项已删除，日历事件已同步删除')
      onTodoChange?.()
    }
  }

  const handleUpdateProgress = (id: string, progress: number) => {
    const updatedTodo = TodoService.updateProgress(id, progress)
    if (updatedTodo) {
      setTodos(TodoService.getTodos())
      if (progress >= 100) {
        toast.success('任务已完成！')
      }
      onTodoChange?.()
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setNewTodo({
      title: todo.title,
      startTime: todo.startTime.toTimeString().slice(0, 5),
      endTime: todo.endTime.toTimeString().slice(0, 5),
      date: todo.date.toISOString().split('T')[0],
      description: todo.description || '',
      priority: todo.priority,
      category: todo.category
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setNewTodo({
      title: '',
      startTime: '',
      endTime: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      priority: 'medium',
      category: 'personal'
    })
    setEditingTodo(null)
    setShowAddForm(false)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      case 'medium':
        return <Star className="w-3 h-3 text-yellow-500" />
      case 'low':
        return <Circle className="w-3 h-3 text-green-500" />
      default:
        return null
    }
  }

  const getDurationText = (startTime: Date, endTime: Date) => {
    const diff = endTime.getTime() - startTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  const todayTodos = todos.filter(todo => {
    const today = new Date()
    const todoDate = new Date(todo.date)
    return todoDate.toDateString() === today.toDateString()
  })

  const stats = TodoService.getStats()

  return (
    <div className={`${className}`} style={{ fontFamily: styles.fontSecondary }}>
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="text-lg font-medium" 
          style={{ color: styles.text }}
        >
          <span style={{ color: styles.textSecondary }}>
            {career === 'programmer' ? '// ' : ''}
          </span>
          待办事项
        </h3>
        <div className="flex items-center space-x-2">
          <div className="text-xs" style={{ color: styles.textSecondary }}>
            {stats.todayCompleted}/{stats.todayTotal} 今日完成
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`p-2 ${styles.card} transition-colors`}
          >
            <Plus className="w-4 h-4" style={{ color: styles.accent }} />
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={`${styles.card} p-2 text-center`}>
          <div className="text-sm font-medium" style={{ color: styles.text }}>
            {stats.total}
          </div>
          <div className="text-xs" style={{ color: styles.textSecondary }}>
            总计
          </div>
        </div>
        <div className={`${styles.card} p-2 text-center`}>
          <div className="text-sm font-medium" style={{ color: styles.accent }}>
            {stats.pending}
          </div>
          <div className="text-xs" style={{ color: styles.textSecondary }}>
            待完成
          </div>
        </div>
        <div className={`${styles.card} p-2 text-center`}>
          <div className="text-sm font-medium" style={{ color: '#10b981' }}>
            {stats.completionRate}%
          </div>
          <div className="text-xs" style={{ color: styles.textSecondary }}>
            完成率
          </div>
        </div>
      </div>

      {/* 添加/编辑任务表单 */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`${styles.card} p-4 mb-4`}
        >
          <div className="space-y-3">
            <input
              type="text"
              value={newTodo.title}
              onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
              placeholder="任务标题..."
              className={`w-full ${styles.input} text-sm`}
              style={{ fontFamily: styles.fontSecondary }}
            />
            
            <textarea
              value={newTodo.description}
              onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
              placeholder="任务描述（可选）..."
              className={`w-full ${styles.input} text-sm h-16 resize-none`}
              style={{ fontFamily: styles.fontSecondary }}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1" style={{ color: styles.textSecondary }}>开始时间</label>
                <input
                  type="time"
                  value={newTodo.startTime}
                  onChange={(e) => setNewTodo({...newTodo, startTime: e.target.value})}
                  className={`w-full ${styles.input} text-xs`}
                  style={{ fontFamily: styles.fontMono }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: styles.textSecondary }}>结束时间</label>
                <input
                  type="time"
                  value={newTodo.endTime}
                  onChange={(e) => setNewTodo({...newTodo, endTime: e.target.value})}
                  className={`w-full ${styles.input} text-xs`}
                  style={{ fontFamily: styles.fontMono }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs mb-1" style={{ color: styles.textSecondary }}>日期</label>
                <input
                  type="date"
                  value={newTodo.date}
                  onChange={(e) => setNewTodo({...newTodo, date: e.target.value})}
                  className={`w-full ${styles.input} text-xs`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: styles.textSecondary }}>优先级</label>
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({...newTodo, priority: e.target.value as any})}
                  className={`w-full ${styles.input} text-xs`}
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: styles.textSecondary }}>分类</label>
                <select
                  value={newTodo.category}
                  onChange={(e) => setNewTodo({...newTodo, category: e.target.value as any})}
                  className={`w-full ${styles.input} text-xs`}
                >
                  <option value="work">工作</option>
                  <option value="personal">个人</option>
                  <option value="meeting">会议</option>
                  <option value="health">健康</option>
                  <option value="travel">旅行</option>
                  <option value="holiday">假期</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={editingTodo ? handleUpdateTodo : handleAddTodo}
                className={`${styles.button} px-3 py-1 text-xs flex items-center space-x-1`}
              >
                <Calendar className="w-3 h-3" />
                <span>{editingTodo ? '更新' : '添加'}到日历</span>
              </button>
              <button
                onClick={resetForm}
                className="px-3 py-1 text-xs bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors"
                style={{ borderRadius: styles.borderRadius }}
              >
                取消
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 任务列表 */}
      <div className="space-y-3">
        {/* 今日任务 */}
        {todayTodos.length > 0 && (
          <>
            <div className="text-sm font-medium" style={{ color: styles.accent }}>
              今日任务 ({todayTodos.length})
            </div>
            {todayTodos.map((todo, index) => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                index={index}
                styles={styles}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
                onUpdateProgress={handleUpdateProgress}
                getPriorityIcon={getPriorityIcon}
                getDurationText={getDurationText}
              />
            ))}
          </>
        )}

        {/* 其他任务 */}
        {todos.filter(todo => {
          const today = new Date()
          const todoDate = new Date(todo.date)
          return todoDate.toDateString() !== today.toDateString()
        }).length > 0 && (
          <>
            <div className="text-sm font-medium pt-2" style={{ color: styles.text }}>
              其他任务
            </div>
            {todos.filter(todo => {
              const today = new Date()
              const todoDate = new Date(todo.date)
              return todoDate.toDateString() !== today.toDateString()
            }).map((todo, index) => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                index={index}
                styles={styles}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
                onUpdateProgress={handleUpdateProgress}
                getPriorityIcon={getPriorityIcon}
                getDurationText={getDurationText}
              />
            ))}
          </>
        )}
        
        {todos.length === 0 && (
          <div 
            className="text-center py-8 text-sm"
            style={{ color: styles.textSecondary }}
          >
            <span>{career === 'programmer' ? '// ' : ''}暂无待办事项</span>
            <div className="text-xs mt-1">
              点击 + 按钮创建任务，会自动同步到日历
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// TodoItem 子组件
interface TodoItemProps {
  todo: Todo
  index: number
  styles: any
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
  onUpdateProgress: (id: string, progress: number) => void
  getPriorityIcon: (priority: string) => React.ReactNode
  getDurationText: (start: Date, end: Date) => string
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  index,
  styles,
  onToggle,
  onDelete,
  onEdit,
  onUpdateProgress,
  getPriorityIcon,
  getDurationText
}) => {
  const [showProgressSlider, setShowProgressSlider] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${styles.card} p-3 transition-colors ${
        todo.completed ? 'opacity-60' : ''
      }`}
      style={{ fontFamily: styles.fontSecondary }}
    >
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggle(todo.id)}
          className="mt-1 transition-colors"
        >
          {todo.completed ? (
            <CheckCircle 
              className="w-4 h-4" 
              style={{ color: styles.accent }}
            />
          ) : (
            <Circle 
              className="w-4 h-4" 
              style={{ color: styles.textSecondary }}
            />
          )}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {getPriorityIcon(todo.priority)}
            <h4 
              className={`text-sm font-medium ${
                todo.completed ? 'line-through' : ''
              }`}
              style={{ color: styles.text }}
            >
              {todo.title}
            </h4>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" style={{ color: styles.accent }} />
              <span className="text-xs" style={{ color: styles.textSecondary }}>
                已同步
              </span>
            </div>
          </div>
          
          {todo.description && (
            <p className="text-xs mt-1" style={{ color: styles.textSecondary }}>
              {todo.description}
            </p>
          )}
          
          <div 
            className="flex items-center space-x-2 mt-1 text-xs"
            style={{ color: styles.textSecondary }}
          >
            <Clock className="w-3 h-3" />
            <span style={{ fontFamily: styles.fontMono }}>
              {todo.startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} - 
              {todo.endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>({getDurationText(todo.startTime, todo.endTime)})</span>
          </div>
          
          {/* 进度条 */}
          {!todo.completed && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: styles.textSecondary }}>
                  进度: {todo.progress}%
                </span>
                <button
                  onClick={() => setShowProgressSlider(!showProgressSlider)}
                  className="text-xs hover:underline"
                  style={{ color: styles.accent }}
                >
                  调整
                </button>
              </div>
              <div 
                className="w-full bg-gray-200 h-1 cursor-pointer"
                style={{ borderRadius: styles.borderRadius }}
                onClick={() => setShowProgressSlider(!showProgressSlider)}
              >
                <div
                  className="h-1 transition-all duration-300"
                  style={{
                    width: `${todo.progress}%`,
                    backgroundColor: todo.progress >= 100 ? '#10b981' : styles.accent,
                    borderRadius: styles.borderRadius
                  }}
                />
              </div>
              {showProgressSlider && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={todo.progress}
                  onChange={(e) => onUpdateProgress(todo.id, parseInt(e.target.value))}
                  className="w-full mt-2"
                  style={{ accentColor: styles.accent }}
                />
              )}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(todo)}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            style={{ color: styles.textSecondary }}
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 hover:bg-red-100 rounded text-xs text-red-500"
          >
            删除
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default TodoList
