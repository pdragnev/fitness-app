import React from 'react'
import { Link } from 'react-router-dom'

interface TrainingDay {
  _id: string
  dayNumber: number
}

interface TrainingDayListProps {
  trainingDays: TrainingDay[]
  programId: string | undefined
}

const TrainingDayList: React.FC<TrainingDayListProps> = ({
  trainingDays,
  programId,
}) => {
  return (
    <div>
      <h2>Training Days</h2>
      <ul>
        {trainingDays.map((day) => (
          <li key={day._id}>
            <Link to={`/programs/${programId}/trainingDays/${day._id}`}>
              Day {day.dayNumber}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TrainingDayList
