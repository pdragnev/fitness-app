import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { authorize } from '../middleware/authorize'
import { check, validationResult } from 'express-validator'
import Program from '../models/Program'
import { Types } from 'mongoose'

const router = Router({ mergeParams: true })

// Add Set to Exercise
router.post(
  '/',
  authMiddleware,
  authorize(['trainer']),
  [
    check('reps', 'Reps are required').isInt({ min: 1 }),
    check('weight', 'Weight is required').isFloat({ min: 0 }),
  ],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { programId, trainingDayId, exerciseId } = req.params // From mount point
      const { reps, weight } = req.body
      const trainerId = req.user?.id

      // Verify program
      const program = await Program.findOne({ _id: programId, trainerId })
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      // Verify training day
      const trainingDay = program.trainingDays.id(trainingDayId)
      if (!trainingDay) {
        return res.status(404).json({ error: 'Training day not found' })
      }

      // Verify exercise
      const exercise = trainingDay.exercises.id(exerciseId)
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' })
      }

      // Add new set with generated _id
      const newSet = {
        _id: new Types.ObjectId(),
        reps,
        weight,
      }

      exercise.sets.push(newSet)

      await program.save()

      res.status(201).json({
        message: 'Set added to exercise',
        set: newSet,
      })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

// Update Set
router.put(
  '/:setId',
  authMiddleware,
  authorize(['trainer']),
  [
    check('reps')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Reps must be at least 1'),
    check('weight')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Weight must be a positive number'),
  ],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { programId, trainingDayId, exerciseId, setId } = req.params
      const { reps, weight } = req.body
      const trainerId = req.user?.id

      // Verify program
      const program = await Program.findOne({ _id: programId, trainerId })
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      // Verify training day
      const trainingDay = program.trainingDays.id(trainingDayId)
      if (!trainingDay) {
        return res.status(404).json({ error: 'Training day not found' })
      }

      // Verify exercise
      const exercise = trainingDay.exercises.id(exerciseId)
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' })
      }

      // Find set
      const set = exercise.sets.id(setId)
      if (!set) {
        return res.status(404).json({ error: 'Set not found' })
      }

      // Update set
      if (reps !== undefined) {
        set.reps = reps
      }
      if (weight !== undefined) {
        set.weight = weight
      }

      await program.save()

      res.json({ message: 'Set updated successfully', set })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

// Delete Set
router.delete(
  '/:setId',
  authMiddleware,
  authorize(['trainer']),
  async (req: Request, res: Response) => {
    try {
      const { programId, trainingDayId, exerciseId, setId } = req.params
      const trainerId = req.user?.id

      // Verify program
      const program = await Program.findOne({ _id: programId, trainerId })
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      // Verify training day
      const trainingDay = program.trainingDays.id(trainingDayId)
      if (!trainingDay) {
        return res.status(404).json({ error: 'Training day not found' })
      }

      // Verify exercise
      const exercise = trainingDay.exercises.id(exerciseId)
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' })
      }

      // Find set
      const set = exercise.sets.id(setId)
      if (!set) {
        return res.status(404).json({ error: 'Set not found' })
      }

      // Remove set using pull()
      exercise.sets.pull({ _id: setId })

      await program.save()

      res.json({ message: 'Set deleted successfully' })
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
      const { programId, trainingDayId, exerciseId } = req.params
      const trainerId = req.user?.id

      // Verify program, training day, and exercise
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

      res.json({ sets: exercise.sets })
    } catch (error) {
      console.error('Error fetching sets:', error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

router.get(
  '/:setId',
  authMiddleware,
  authorize(['trainer']),
  async (req: Request, res: Response) => {
    try {
      const { programId, trainingDayId, exerciseId, setId } = req.params
      const trainerId = req.user?.id

      // Verify program, training day, and exercise
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

      const set = exercise.sets.id(setId)

      if (!set) {
        return res.status(404).json({ error: 'Set not found' })
      }

      res.json({ set })
    } catch (error) {
      console.error('Error fetching set:', error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

export default router
