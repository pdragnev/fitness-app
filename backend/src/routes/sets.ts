// routes/sets.ts

import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { authorize } from '../middleware/authorize'
import { check, validationResult } from 'express-validator'
import Set, { ISet } from '../models/Set'
import Exercise, { IExercise } from '../models/Exercise'
import { ITrainingDay } from '../models/TrainingDay'
import { IProgram } from '../models/Program'
import { Types } from 'mongoose'

const router = Router()

// Add Set to Exercise
router.post(
  '/',
  authMiddleware,
  authorize(['trainer']),
  [
    check('exerciseId', 'Exercise ID is required').notEmpty(),
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
      const { exerciseId, reps, weight } = req.body
      const trainerId = req.user?.id

      // Find exercise and verify ownership
      const exercise = (await Exercise.findById(exerciseId).populate<{
        trainingDayId: ITrainingDay & { programId: IProgram }
      }>({
        path: 'trainingDayId',
        populate: { path: 'programId' },
      })) as IExercise & {
        trainingDayId: ITrainingDay & { programId: IProgram }
      }

      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' })
      }

      const program = exercise.trainingDayId.programId
      if (program.trainerId.toString() !== trainerId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // Create new set
      const set = new Set({
        exerciseId,
        reps,
        weight,
      }) as ISet

      await set.save()

      // Add set to exercise
      exercise.sets.push(set._id as Types.ObjectId)
      await exercise.save()

      res.status(201).json({ message: 'Set added to exercise', set })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
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
      const { setId } = req.params
      const trainerId = req.user?.id

      // Find set and verify ownership
      const set = (await Set.findById(setId).populate<{
        exerciseId: IExercise & {
          trainingDayId: ITrainingDay & { programId: IProgram }
        }
      }>({
        path: 'exerciseId',
        populate: {
          path: 'trainingDayId',
          populate: { path: 'programId' },
        },
      })) as ISet & {
        exerciseId: IExercise & {
          trainingDayId: ITrainingDay & { programId: IProgram }
        }
      }

      if (!set) {
        return res.status(404).json({ error: 'Set not found' })
      }

      const program = set.exerciseId.trainingDayId.programId
      if (program.trainerId.toString() !== trainerId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // Remove set from exercise
      const exercise = set.exerciseId
      exercise.sets = exercise.sets.filter((id) => id.toString() !== setId)
      await exercise.save()

      // Delete the set
      await set.deleteOne()

      res.json({ message: 'Set deleted successfully' })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
    }
  }
)

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
      const { setId } = req.params
      const { reps, weight } = req.body
      const trainerId = req.user?.id

      // Find set and verify ownership
      const set = (await Set.findById(setId).populate<{
        exerciseId: IExercise & {
          trainingDayId: ITrainingDay & { programId: IProgram }
        }
      }>({
        path: 'exerciseId',
        populate: {
          path: 'trainingDayId',
          populate: { path: 'programId' },
        },
      })) as ISet & {
        exerciseId: IExercise & {
          trainingDayId: ITrainingDay & { programId: IProgram }
        }
      }

      if (!set) {
        return res.status(404).json({ error: 'Set not found' })
      }

      const program = set.exerciseId.trainingDayId.programId
      if (program.trainerId.toString() !== trainerId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // Update set details
      if (reps !== undefined) {
        set.reps = reps
      }
      if (weight !== undefined) {
        set.weight = weight
      }

      await set.save()

      res.json({ message: 'Set updated successfully', set })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
    }
  }
)

export default router
