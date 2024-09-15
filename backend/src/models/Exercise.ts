// models/Exercise.ts

import { Schema, model, Document, Types } from 'mongoose'
import Set from './Set'
import { ITrainingDay } from './TrainingDay'

export interface IExercise extends Document {
  trainingDayId: Types.ObjectId | ITrainingDay
  name: string
  sets: Types.ObjectId[]
}

const ExerciseSchema = new Schema<IExercise>({
  trainingDayId: {
    type: Schema.Types.ObjectId,
    ref: 'TrainingDay',
    required: true,
  },
  name: { type: String, required: true },
  sets: [{ type: Schema.Types.ObjectId, ref: 'Set' }],
})

// Cascade delete sets when an exercise is deleted
ExerciseSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const exerciseId = this._id
    await Set.deleteMany({ exerciseId })
    next()
  }
)

export default model<IExercise>('Exercise', ExerciseSchema)
