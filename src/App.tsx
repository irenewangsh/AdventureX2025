
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import TransitionPage from './pages/TransitionPage'
import CalendarMain from './pages/CalendarMain'

export type CareerType = 'programmer' | 'office_worker' | 'teacher' | 'student' | 'doctor' | 'finance' | 'sales' | 'freelancer'
export type ViewMode = 'minimal' | 'normal' | 'caring'

interface AppContextType {
  userAge: number
  setUserAge: (age: number) => void
  career: CareerType
  setCareer: (career: CareerType) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [userAge, setUserAge] = useState(28)
  const [career, setCareer] = useState<CareerType>('programmer')
  const [viewMode, setViewMode] = useState<ViewMode>('normal')

  return (
    <AppContext.Provider value={{ 
      userAge, 
      setUserAge, 
      career, 
      setCareer, 
      viewMode, 
      setViewMode 
    }}>
      {children}
    </AppContext.Provider>
  )
}

function App() {
  return (
    <AppProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/transition" element={<TransitionPage />} />
          <Route path="/calendar" element={<CalendarMain />} />
        </Routes>
      </div>
    </AppProvider>
  )
}

export default App
