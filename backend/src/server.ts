import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import programsRoutes from './routes/programs'
import trainingDaysRoutes from './routes/trainingDays'
import exercisesRoutes from './routes/exercises'
import setsRoutes from './routes/sets'
import usersRoutes from './routes/users'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

dotenv.config()
const MONGO_URI = process.env.MONGO_URI as string
const PORT = process.env.PORT as string

const app = express()

// Middleware
app.use(cors())
app.use(bodyParser.json())

app.use('/auth', authRoutes)
app.use('/programs', programsRoutes)
app.use('/trainingDays', trainingDaysRoutes)
app.use('/exercises', exercisesRoutes)
app.use('/sets', setsRoutes)
app.use('/users', usersRoutes)

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
  })
