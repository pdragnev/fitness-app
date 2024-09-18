// components/ProgramDetails.tsx

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'
import TrainingDayList from './TrainingDayList'
import TrainingDayForm from './TrainingDayForm'

interface Program {
  _id: string
  programName: string
  trainingDays: TrainingDay[]
}

interface TrainingDay {
  _id: string
  dayNumber: number
  exercises: any[] // Define proper types later
}

const ProgramDetails: React.FC = () => {
  const { programId } = useParams<{ programId: string }>()
  const [program, setProgram] = useState<Program | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchProgram = async () => {
    try {
      const res = await api.get(`/programs/${programId}`)
      setProgram(res.data.program)
    } catch (error) {
      console.error('Error fetching program:', error)
    }
  }

  useEffect(() => {
    fetchProgram()
  }, [programId])

  const handleAddTrainingDay = (newTrainingDay: TrainingDay) => {
    if (program) {
      setProgram({
        ...program,
        trainingDays: [...program.trainingDays, newTrainingDay],
      })
    }
    setShowForm(false)
  }

  if (!program) return <div>Loading...</div>

  return (
    <div>
      <h1>{program.programName}</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Training Day'}
      </button>
      {showForm && (
        <TrainingDayForm
          programId={programId}
          onAddTrainingDay={handleAddTrainingDay}
        />
      )}
      <TrainingDayList
        trainingDays={program.trainingDays}
        programId={programId}
      />
    </div>
  )
}

export default ProgramDetails
