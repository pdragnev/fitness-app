import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'
import SetList from './SetList'
import SetForm from './SetForm'

interface Set {
  _id: string
  reps: number
  weight: number
}

interface Exercise {
  _id: string
  name: string
  sets: Set[]
}

const ExerciseDetails: React.FC = () => {
  const { programId, trainingDayId, exerciseId } = useParams<{
    programId: string
    trainingDayId: string
    exerciseId: string
  }>()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchExercise = async () => {
    try {
      const res = await api.get(
        `/programs/${programId}/trainingDays/${trainingDayId}/exercises/${exerciseId}`
      )
      setExercise(res.data.exercise)
    } catch (error) {
      console.error('Error fetching exercise:', error)
    }
  }

  useEffect(() => {
    fetchExercise()
  }, [programId, trainingDayId, exerciseId])

  const handleAddSet = (newSet: Set) => {
    if (exercise) {
      setExercise({
        ...exercise,
        sets: [...exercise.sets, newSet],
      })
    }
    setShowForm(false)
  }

  if (!exercise) return <div>Loading...</div>

  return (
    <div>
      <h1>{exercise.name}</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Set'}
      </button>
      {showForm && (
        <SetForm
          programId={programId}
          trainingDayId={trainingDayId}
          exerciseId={exerciseId}
          onAddSet={handleAddSet}
        />
      )}
      <SetList sets={exercise.sets} />
    </div>
  )
}

export default ExerciseDetails
