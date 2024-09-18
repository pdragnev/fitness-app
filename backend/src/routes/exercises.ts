import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { authorize } from '../middleware/authorize'
import { check, validationResult } from 'express-validator'
import Program from '../models/Program'
import { Types } from 'mongoose'

const router = Router({ mergeParams: true })

// Add Exercise to Training Day
router.post(
  '/',
  authMiddleware,
  authorize(['trainer']),
  [check('name', 'Exercise name is required').notEmpty()],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { programId, trainingDayId } = req.params
      const { name } = req.body
      const trainerId = req.user?.id

      // Verify program and training day
      const program = await Program.findOne({ _id: programId, trainerId })
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      const trainingDay = program.trainingDays.id(trainingDayId)

      if (!trainingDay) {
        return res.status(404).json({ error: 'Training day not found' })
      }

      // Check if exercise name already exists
      if (trainingDay.exercises.some((ex) => ex.name === name)) {
        return res.status(400).json({ error: 'Exercise already exists' })
      }

      // Add exercise with generated _id
      const newExercise = {
        _id: new Types.ObjectId(),
        name,
        sets: [],
      }

      trainingDay.exercises.push(newExercise)

      await program.save()

      res.status(201).json({
        message: 'Exercise added to training day',
        exercise: newExercise,
      })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

// Update Exercise
router.put(
  '/:exerciseId',
  authMiddleware,
  authorize(['trainer']),
  [
    check('name')
      .optional()
      .notEmpty()
      .withMessage('Exercise name cannot be empty'),
  ],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { programId, trainingDayId, exerciseId } = req.params
      const { name } = req.body
      const trainerId = req.user?.id

      // Verify program and training day
      const program = await Program.findOne({ _id: programId, trainerId })
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      const trainingDay = program.trainingDays.id(trainingDayId)

      if (!trainingDay) {
        return res.status(404).json({ error: 'Training day not found' })
      }

      const exercise = trainingDay.exercises.id(exerciseId)

      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' })
      }

      // Update exercise
      if (name) {
        // Check if new name already exists in another exercise
        if (
          trainingDay.exercises.some(
            (ex) => ex.name === name && ex._id.toString() !== exerciseId
          )
        ) {
          return res.status(400).json({
            error: 'Exercise with this name already exists',
          })
        }
        exercise.name = name
      }

      await program.save()

      res.json({ message: 'Exercise updated successfully', exercise })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

// Delete Exercise
router.delete(
  '/:exerciseId',
  authMiddleware,
  authorize(['trainer']),
  async (req: Request, res: Response) => {
    try {
      const { programId, trainingDayId, exerciseId } = req.params
      const trainerId = req.user?.id

      // Verify program and training day
      const program = await Program.findOne({ _id: programId, trainerId })
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      const trainingDay = program.trainingDays.id(trainingDayId)

      if (!trainingDay) {
        return res.status(404).json({ error: 'Training day not found' })
      }

      const exercise = trainingDay.exercises.id(exerciseId)

      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' })
      }

      // Remove exercise using pull()
      trainingDay.exercises.pull({ _id: exerciseId })

      await program.save()

      res.json({ message: 'Exercise deleted successfully' })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

router.get(
  '/',
  authMiddleware,
  authorize(['trainer']),
  async (req: Request, res: Response) => {
    try {
      const { programId, trainingDayId } = req.params
      const trainerId = req.user?.id

      // Verify program and training day
      const program = await Program.findOne({
        _id: programId,
        trainerId: new Types.ObjectId(trainerId),
      })

      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      const trainingDay = program.trainingDays.id(trainingDayId)

      if (!trainingDay) {
        return res.status(404).json({ error: 'Training day not found' })
      }

      res.json({ exercises: trainingDay.exercises })
    } catch (error) {
      console.error('Error fetching exercises:', error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

router.get(
  '/:exerciseId',
  authMiddleware,
  authorize(['trainer']),
  async (req: Request, res: Response) => {
    try {
      const { programId, trainingDayId, exerciseId } = req.params
      const trainerId = req.user?.id

      // Verify program and training day
      const program = await Program.findOne({
        _id: programId,
        trainerId: new Types.ObjectId(trainerId),
      })

      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      const trainingDay = program.trainingDays.id(trainingDayId)

      if (!trainingDay) {
        return res.status(404).json({ error: 'Training day not found' })
      }

      const exercise = trainingDay.exercises.id(exerciseId)

      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' })
      }

      res.json({ exercise })
    } catch (error) {
      console.error('Error fetching exercise:', error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

export default router
