import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../components/Login'
import Register from '../components/Register'
import TrainerDashboard from '../components/TrainerDashboard'
import UserDashboard from '../components/UserDashboard'
import { AuthContext } from '../contexts/AuthContext'

const App: React.FC = () => {
  const authContext = useContext(AuthContext)

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (!authContext?.authData.token) {
      return <Navigate to="/login" />
    }
    return children
  }

  const RoleBasedRoute = ({
    role,
    children,
  }: {
    role: string
    children: JSX.Element
  }) => {
    if (authContext?.authData.role !== role) {
      return <Navigate to="/login" />
    }
    return children
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {authContext?.authData.role === 'trainer' ? (
              <TrainerDashboard />
            ) : (
              <UserDashboard />
            )}
          </ProtectedRoute>
        }
      />

      {/* Additional routes can be added here */}
    </Routes>
  )
}

export default App
