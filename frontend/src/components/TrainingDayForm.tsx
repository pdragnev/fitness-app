import React, { useState } from 'react'
import api from '../api/api'

interface TrainingDayFormProps {
  programId: string | undefined
  onAddTrainingDay: (trainingDay: any) => void
}

const TrainingDayForm: React.FC<TrainingDayFormProps> = ({
  programId,
  onAddTrainingDay,
}) => {
  const [dayNumber, setDayNumber] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post(`/programs/${programId}/trainingDays`, {
        dayNumber,
      })
      onAddTrainingDay(res.data.trainingDay)
      setDayNumber(1)
    } catch (error) {
      console.error('Error adding training day:', error)
      // Handle error (e.g., display error message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Day Number"
        value={dayNumber}
        onChange={(e) => setDayNumber(Number(e.target.value))}
        required
        min={1}
      />
      <button type="submit">Add Training Day</button>
    </form>
  )
}

export default TrainingDayForm
