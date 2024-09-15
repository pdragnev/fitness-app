import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  role: 'trainer' | 'user'
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['trainer', 'user'], default: 'user' },
})

export default model<IUser>('User', userSchema)
