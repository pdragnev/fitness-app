import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../components/Login'
import Register from '../components/Register'
import TrainerDashboard from '../components/TrainerDashboard'
import ProgramDetails from '../components/ProgramDetails'
import TrainingDayDetails from '../components/TrainingDayDetails'
import ExerciseDetails from '../components/ExerciseDetails'
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
      return <Navigate to="/dashboard" />
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

      {/* Trainer Routes */}
      <Route
        path="/programs/:programId"
        element={
          <ProtectedRoute>
            <RoleBasedRoute role="trainer">
              <ProgramDetails />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/programs/:programId/trainingDays/:trainingDayId"
        element={
          <ProtectedRoute>
            <RoleBasedRoute role="trainer">
              <TrainingDayDetails />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/programs/:programId/trainingDays/:trainingDayId/exercises/:exerciseId"
        element={
          <ProtectedRoute>
            <RoleBasedRoute role="trainer">
              <ExerciseDetails />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Additional routes can be added here */}
    </Routes>
  )
}

export default App
