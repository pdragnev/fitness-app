import React, { useEffect, useState } from 'react'
import api from '../api/api'
import ProgramList from './ProgramList'
import ProgramForm from './ProgramForm'

interface Program {
  _id: string
  programName: string
  trainingDays: any[] // Define proper types later
}

const TrainerDashboard: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [showForm, setShowForm] = useState(false)

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/programs')
      setPrograms(res.data.programs)
    } catch (error) {
      console.error('Error fetching programs:', error)
    }
  }

  useEffect(() => {
    fetchPrograms()
  }, [])

  const handleAddProgram = (newProgram: Program) => {
    setPrograms([...programs, newProgram])
    setShowForm(false)
  }

  return (
    <div>
      <h1>Trainer Dashboard</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Program'}
      </button>
      {showForm && <ProgramForm onAddProgram={handleAddProgram} />}
      <ProgramList programs={programs} />
    </div>
  )
}

export default TrainerDashboard
