import React, { createContext, useState, ReactNode, useEffect } from 'react'

interface AuthData {
  token: string | null
  role: string | null
}

interface AuthContextType {
  authData: AuthData
  login: (token: string, role: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface Props {
  children: ReactNode
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData>({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
  })

  useEffect(() => {
    // You can add logic to validate the token here if needed
  }, [])

  const login = (token: string, role: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    setAuthData({ token, role })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setAuthData({ token: null, role: null })
  }

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
