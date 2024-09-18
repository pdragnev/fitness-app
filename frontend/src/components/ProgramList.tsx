import React from 'react'
import { Link } from 'react-router-dom'

interface Program {
  _id: string
  programName: string
}

interface ProgramListProps {
  programs: Program[]
}

const ProgramList: React.FC<ProgramListProps> = ({ programs }) => {
  return (
    <div>
      <h2>Your Programs</h2>
      <ul>
        {programs.map((program) => (
          <li key={program._id}>
            <Link to={`/programs/${program._id}`}>{program.programName}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProgramList
