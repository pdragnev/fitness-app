import React, { createContext, useState, ReactNode, useEffect } from 'react'

interface AuthData {
  token: string
  role: string
}

interface AuthContextType {
  authData: AuthData
  login: (token: string, role: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface Props {
  children: ReactNode
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData>(() => {
    const token = localStorage.getItem('token') || ''
    const role = localStorage.getItem('role') || ''
    return { token, role }
  })

  const login = (token: string, role: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    setAuthData({ token, role })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setAuthData({ token: '', role: '' })
  }

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
