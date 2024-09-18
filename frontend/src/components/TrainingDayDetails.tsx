import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'
import ExerciseList from './ExerciseList'
import ExerciseForm from './ExerciseForm'

interface Exercise {
  _id: string
  name: string
  sets: any[]
}

interface TrainingDay {
  _id: string
  dayNumber: number
  exercises: Exercise[]
}

const TrainingDayDetails: React.FC = () => {
  const { programId, trainingDayId } = useParams<{
    programId: string
    trainingDayId: string
  }>()
  const [trainingDay, setTrainingDay] = useState<TrainingDay | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchTrainingDay = async () => {
    try {
      const res = await api.get(
        `/programs/${programId}/trainingDays/${trainingDayId}`
      )
      setTrainingDay(res.data.trainingDay)
    } catch (error) {
      console.error('Error fetching training day:', error)
    }
  }

  useEffect(() => {
    fetchTrainingDay()
  }, [programId, trainingDayId])

  const handleAddExercise = (newExercise: Exercise) => {
    if (trainingDay) {
      setTrainingDay({
        ...trainingDay,
        exercises: [...trainingDay.exercises, newExercise],
      })
    }
    setShowForm(false)
  }

  if (!trainingDay) return <div>Loading...</div>

  return (
    <div>
      <h1>Day {trainingDay.dayNumber}</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Exercise'}
      </button>
      {showForm && (
        <ExerciseForm
          programId={programId}
          trainingDayId={trainingDayId}
          onAddExercise={handleAddExercise}
        />
      )}
      <ExerciseList
        exercises={trainingDay.exercises}
        programId={programId}
        trainingDayId={trainingDayId}
      />
    </div>
  )
}

export default TrainingDayDetails
