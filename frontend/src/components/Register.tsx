import React, { useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

const Register: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'trainer' | 'user'>('user')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/auth/register', { email, password, role })
      navigate('/login')
    } catch (error) {
      console.error(error)
      // Handle error (e.g., display error message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as 'trainer' | 'user')}
      >
        <option value="user">User</option>
        <option value="trainer">Trainer</option>
      </select>
      <button type="submit">Register</button>
    </form>
  )
}

export default Register
