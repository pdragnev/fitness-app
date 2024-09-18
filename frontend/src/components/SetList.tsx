import React from 'react'

interface Set {
  _id: string
  reps: number
  weight: number
}

interface SetListProps {
  sets: Set[]
}

const SetList: React.FC<SetListProps> = ({ sets }) => {
  return (
    <div>
      <h2>Sets</h2>
      <ul>
        {sets.map((set, index) => (
          <li key={set._id}>
            Set {index + 1}: {set.reps} reps @ {set.weight} kg
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SetList
