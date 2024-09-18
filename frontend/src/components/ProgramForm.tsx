import React, { useState } from 'react'
import api from '../api/api'

interface ProgramFormProps {
  onAddProgram: (program: any) => void
}

const ProgramForm: React.FC<ProgramFormProps> = ({ onAddProgram }) => {
  const [programName, setProgramName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/programs', { programName })
      onAddProgram(res.data.program)
      setProgramName('')
    } catch (error) {
      console.error('Error creating program:', error)
      // Handle error (e.g., display error message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Program Name"
        value={programName}
        onChange={(e) => setProgramName(e.target.value)}
        required
      />
      <button type="submit">Create Program</button>
    </form>
  )
}

export default ProgramForm
