// routes/exercises.ts

import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { authorize } from '../middleware/authorize'
import { check, validationResult } from 'express-validator'
import Exercise, { IExercise } from '../models/Exercise'
import TrainingDay, { ITrainingDay } from '../models/TrainingDay'
import { Types } from 'mongoose'
import { IProgram } from '../models/Program'

const router = Router()

router.post(
  '/',
  authMiddleware,
  authorize(['trainer']),
  [
    check('trainingDayId', 'TrainingDay ID is required').notEmpty(),
    check('name', 'Exercise name is required').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { trainingDayId, name } = req.body
      const trainerId = req.user?.id

      // Find training day and verify it belongs to the trainer
      const trainingDay = (await TrainingDay.findById(trainingDayId).populate<{
        programId: IProgram
      }>('programId')) as ITrainingDay & { programId: IProgram }

      if (
        !trainingDay ||
        trainingDay.programId.trainerId.toString() !== trainerId
      ) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // Create new exercise
      const exercise = new Exercise({
        trainingDayId,
        name,
      }) as IExercise

      await exercise.save()

      // Add exercise to training day
      trainingDay.exercises.push(exercise._id as Types.ObjectId)
      await trainingDay.save()

      res
        .status(201)
        .json({ message: 'Exercise added to training day', exercise })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
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
      const { exerciseId } = req.params
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

      // Delete the exercise (will trigger cascade deletion of sets)
      await exercise.deleteOne()

      res.json({ message: 'Exercise and associated sets deleted successfully' })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
    }
  }
)

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
      const { exerciseId } = req.params
      const { name } = req.body
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

      // Update exercise details
      if (name) {
        exercise.name = name
      }

      await exercise.save()

      res.json({ message: 'Exercise updated successfully', exercise })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
    }
  }
)

export default router
