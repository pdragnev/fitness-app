import { Schema, model, Document, Types } from 'mongoose'

export interface ISet extends Document {
  exerciseId: Types.ObjectId
  reps: number
  weight: number
}

const SetSchema = new Schema<ISet>({
  exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
})

export default model<ISet>('Set', SetSchema)
