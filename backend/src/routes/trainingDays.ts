// routes/trainingDays.ts

import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { authorize } from '../middleware/authorize'
import { check, validationResult } from 'express-validator'
import TrainingDay, { ITrainingDay } from '../models/TrainingDay'
import Program, { IProgram } from '../models/Program'
import { Types } from 'mongoose'

const router = Router()

// Add TrainingDay to Program
router.post(
  '/',
  authMiddleware,
  authorize(['trainer']),
  [
    check('programId', 'Program ID is required').notEmpty(),
    check('dayNumber', 'Day number is required').isInt({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { programId, dayNumber } = req.body
      const trainerId = req.user?.id

      // Verify program exists and belongs to the trainer
      const program = (await Program.findOne({
        _id: programId,
        trainerId,
      })) as IProgram
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      // Create new training day
      const trainingDay = new TrainingDay({
        programId,
        dayNumber,
      }) as ITrainingDay

      await trainingDay.save()

      // Add training day to program
      program.trainingDays.push(trainingDay._id as Types.ObjectId)
      await program.save()

      res
        .status(201)
        .json({ message: 'Training day added to program', trainingDay })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
    }
  }
)

// Remove TrainingDay from Program
// router.delete(
//   '/:trainingDayId',
//   authMiddleware,
//   authorize(['trainer']),
//   async (req: Request, res: Response) => {
//     try {
//       const { trainingDayId } = req.params
//       const trainerId = req.user?.id

//       // Find training day
//       const trainingDay = (await TrainingDay.findById(
//         trainingDayId
//       )) as ITrainingDay
//       if (!trainingDay) {
//         return res.status(404).json({ error: 'Training day not found' })
//       }

//       // Verify program belongs to trainer
//       const program = (await Program.findOne({
//         _id: trainingDay.programId,
//         trainerId,
//       })) as IProgram
//       if (!program) {
//         return res.status(403).json({ error: 'Access denied' })
//       }

//       // Remove training day from program
//       program.trainingDays = program.trainingDays.filter(
//         (id) => id.toString() !== trainingDayId
//       )
//       await program.save()

//       // Remove training day
//       await TrainingDay.findByIdAndDelete(trainingDayId)

//       res.json({ message: 'Training day removed from program' })
//     } catch (error) {
//       const err = error as Error
//       res.status(500).json({ error: 'Server error', details: err.message })
//     }
//   }
// )

// Delete TrainingDay
router.delete(
  '/:trainingDayId',
  authMiddleware,
  authorize(['trainer']),
  async (req: Request, res: Response) => {
    try {
      const { trainingDayId } = req.params
      const trainerId = req.user?.id

      // Find training day and verify ownership
      const trainingDay = (await TrainingDay.findById(trainingDayId).populate<{
        programId: IProgram
      }>('programId')) as ITrainingDay & { programId: IProgram }

      if (
        !trainingDay ||
        trainingDay.programId.trainerId.toString() !== trainerId
      ) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // Delete the training day (will trigger cascade deletion)
      await trainingDay.deleteOne()

      res.json({
        message: 'Training day and associated data deleted successfully',
      })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
    }
  }
)

export default router
