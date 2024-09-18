import React from 'react'
import { Link } from 'react-router-dom'

interface Exercise {
  _id: string
  name: string
}

interface ExerciseListProps {
  exercises: Exercise[]
  programId: string | undefined
  trainingDayId: string | undefined
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  programId,
  trainingDayId,
}) => {
  return (
    <div>
      <h2>Exercises</h2>
      <ul>
        {exercises.map((exercise) => (
          <li key={exercise._id}>
            <Link
              to={`/programs/${programId}/trainingDays/${trainingDayId}/exercises/${exercise._id}`}
            >
              {exercise.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ExerciseList
