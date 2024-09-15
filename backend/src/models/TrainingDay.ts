// models/TrainingDay.ts

import { Schema, model, Document, Types } from 'mongoose'
import Exercise from './Exercise'
import { IProgram } from './Program'

export interface ITrainingDay extends Document {
  programId: Types.ObjectId | IProgram
  dayNumber: number
  exercises: Types.ObjectId[]
}

const TrainingDaySchema = new Schema<ITrainingDay>({
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  dayNumber: { type: Number, required: true },
  exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
})

// Cascade delete exercises when a training day is deleted
TrainingDaySchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const trainingDayId = this._id
    await Exercise.deleteMany({ trainingDayId })
    next()
  }
)

export default model<ITrainingDay>('TrainingDay', TrainingDaySchema)
