import { Schema, model, Document, Types } from 'mongoose'
import TrainingDay from './TrainingDay'

export interface IProgram extends Document {
  trainerId: Types.ObjectId
  programName: string
  trainingDays: Types.ObjectId[]
  assignedUsers: Types.ObjectId[]
}

const ProgramSchema = new Schema<IProgram>({
  trainerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  programName: { type: String, required: true },
  trainingDays: [{ type: Schema.Types.ObjectId, ref: 'TrainingDay' }],
  assignedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
})

// Cascade delete training days when a program is deleted
ProgramSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const programId = this._id
    await TrainingDay.deleteMany({ programId })
    next()
  }
)

export default model<IProgram>('Program', ProgramSchema)
