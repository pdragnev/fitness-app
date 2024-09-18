import React, { useState } from 'react'
import api from '../api/api'

interface ExerciseFormProps {
  programId: string | undefined
  trainingDayId: string | undefined
  onAddExercise: (exercise: any) => void
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
  programId,
  trainingDayId,
  onAddExercise,
}) => {
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post(
        `/programs/${programId}/trainingDays/${trainingDayId}/exercises`,
        { name }
      )
      onAddExercise(res.data.exercise)
      setName('')
    } catch (error) {
      console.error('Error adding exercise:', error)
      // Handle error (e.g., display error message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Exercise Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit">Add Exercise</button>
    </form>
  )
}

export default ExerciseForm
