import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { authorize } from '../middleware/authorize'
import { check, validationResult } from 'express-validator'
import Program from '../models/Program'
import { Types } from 'mongoose'

const router = Router({ mergeParams: true })

// Add Training Day to Program
router.post(
  '/',
  authMiddleware,
  authorize(['trainer']),
  [check('dayNumber', 'Day number is required').isInt({ min: 1 })],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { programId } = req.params
      const { dayNumber } = req.body
      const trainerId = req.user?.id

      // Verify program exists and belongs to the trainer
      const program = await Program.findOne({ _id: programId, trainerId })
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      // Check if dayNumber already exists
      if (program.trainingDays.some((day) => day.dayNumber === dayNumber)) {
        return res.status(400).json({ error: 'Training day already exists' })
      }

      // Add new training day with a generated _id
      const newTrainingDay = {
        _id: new Types.ObjectId(),
        dayNumber,
        exercises: [],
      }

      program.trainingDays.push(newTrainingDay)

      await program.save()

      res.status(201).json({
        message: 'Training day added to program',
        trainingDay: newTrainingDay,
      })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

// Update Training Day
router.put(
  '/:trainingDayId',
  authMiddleware,
  authorize(['trainer']),
  [
    check('dayNumber')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Day number must be at least 1'),
  ],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { programId, trainingDayId } = req.params
      const { dayNumber } = req.body
      const trainerId = req.user?.id

      // Verify program exists and belongs to the trainer
      const program = await Program.findOne({ _id: programId, trainerId })
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      // Find the training day by _id using the 'id' method
      const trainingDay = program.trainingDays.id(trainingDayId)

      if (!trainingDay) {
        return res.status(404).json({ error: 'Training day not found' })
      }

      // Update training day
      if (dayNumber) {
        // Check if new dayNumber already exists in another training day
        if (
          program.trainingDays.some(
            (day) =>
              day.dayNumber === dayNumber &&
              day._id.toString() !== trainingDayId
          )
        ) {
          return res.status(400).json({
            error: 'Training day with this number already exists',
          })
        }
        trainingDay.dayNumber = dayNumber
      }

      await program.save()

      res.json({ message: 'Training day updated successfully', trainingDay })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

// Delete Training Day
router.delete(
  '/:trainingDayId',
  authMiddleware,
  authorize(['trainer']),
  async (req: Request, res: Response) => {
    try {
      const { programId, trainingDayId } = req.params
      const trainerId = req.user?.id

      // Verify program exists and belongs to the trainer
      const program = await Program.findOne({ _id: programId, trainerId })
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      // Check if the training day exists
      const trainingDayExists = program.trainingDays.id(trainingDayId)
      if (!trainingDayExists) {
        return res.status(404).json({ error: 'Training day not found' })
      }

      // Remove training day using pull()
      program.trainingDays.pull({ _id: trainingDayId })

      await program.save()

      res.json({ message: 'Training day deleted successfully' })
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
      const { programId } = req.params
      const trainerId = req.user?.id

      // Verify program exists and belongs to the trainer
      const program = await Program.findOne({
        _id: programId,
        trainerId: new Types.ObjectId(trainerId),
      })

      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      res.json({ trainingDays: program.trainingDays })
    } catch (error) {
      console.error('Error fetching training days:', error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

router.get(
  '/:trainingDayId',
  authMiddleware,
  authorize(['trainer']),
  async (req: Request, res: Response) => {
    try {
      const { programId, trainingDayId } = req.params
      const trainerId = req.user?.id

      // Verify program exists and belongs to the trainer
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

      res.json({ trainingDay })
    } catch (error) {
      console.error('Error fetching training day:', error)
      res
        .status(500)
        .json({ error: 'Server error', details: (error as Error).message })
    }
  }
)

export default router
