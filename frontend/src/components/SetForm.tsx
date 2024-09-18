import React, { useState } from 'react'
import api from '../api/api'

interface SetFormProps {
  programId: string | undefined
  trainingDayId: string | undefined
  exerciseId: string | undefined
  onAddSet: (set: any) => void
}

const SetForm: React.FC<SetFormProps> = ({
  programId,
  trainingDayId,
  exerciseId,
  onAddSet,
}) => {
  const [reps, setReps] = useState(0)
  const [weight, setWeight] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post(
        `/programs/${programId}/trainingDays/${trainingDayId}/exercises/${exerciseId}/sets`,
        { reps, weight }
      )
      onAddSet(res.data.set)
      setReps(0)
      setWeight(0)
    } catch (error) {
      console.error('Error adding set:', error)
      // Handle error (e.g., display error message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(Number(e.target.value))}
        required
        min={1}
      />
      <input
        type="number"
        placeholder="Weight"
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        required
        min={0}
      />
      <button type="submit">Add Set</button>
    </form>
  )
}

export default SetForm
