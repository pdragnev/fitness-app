// models/Program.ts

import { Schema, model, Types, Document } from 'mongoose'

export interface ISet extends Types.Subdocument {
  _id: Types.ObjectId
  reps: number
  weight: number
}

export interface IExercise extends Types.Subdocument {
  _id: Types.ObjectId
  name: string
  sets: Types.DocumentArray<ISet>
}

export interface ITrainingDay extends Types.Subdocument {
  _id: Types.ObjectId
  dayNumber: number
  exercises: Types.DocumentArray<IExercise>
}

export interface IProgram extends Document {
  _id: Types.ObjectId
  trainerId: Types.ObjectId
  programName: string
  trainingDays: Types.DocumentArray<ITrainingDay>
  assignedUsers: Types.ObjectId[]
}

const SetSchema = new Schema<ISet>({
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
})

const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  sets: [SetSchema],
})

const TrainingDaySchema = new Schema<ITrainingDay>({
  dayNumber: { type: Number, required: true },
  exercises: [ExerciseSchema],
})

const ProgramSchema = new Schema<IProgram>({
  trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  programName: { type: String, required: true },
  trainingDays: [TrainingDaySchema],
  assignedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
})

export default model<IProgram>('Program', ProgramSchema)
