// routes/programs.ts

import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { authorize } from '../middleware/authorize'
import { check, validationResult } from 'express-validator'
import Program, { IProgram } from '../models/Program'
import User, { IUser } from '../models/User'
import { Types } from 'mongoose'

const router = Router()

// Create Program
router.post(
  '/',
  authMiddleware,
  authorize(['trainer']),
  [check('programName', 'Program name is required').notEmpty()],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { programName } = req.body
      const trainerId = req.user?.id

      const program = new Program({
        trainerId,
        programName,
      }) as IProgram

      await program.save()
      res.status(201).json({ message: 'Program created successfully', program })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
    }
  }
)

// Assign Program to User
router.post(
  '/:programId/assign',
  authMiddleware,
  authorize(['trainer']),
  [check('userId', 'User ID is required').notEmpty()],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { programId } = req.params
      const { userId } = req.body
      const trainerId = req.user?.id

      // Verify program exists and belongs to the trainer
      const program = (await Program.findOne({
        _id: programId,
        trainerId,
      })) as IProgram
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      // Verify user exists
      const user = (await User.findById(userId)) as IUser
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Assign program to user
      const userIdObj = new Types.ObjectId(userId)
      if (!program.assignedUsers.some((id) => id.equals(userIdObj))) {
        program.assignedUsers.push(userIdObj)
        await program.save()
      }

      res.json({ message: 'Program assigned to user', program })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
    }
  }
)

// Delete Program
router.delete(
  '/:programId',
  authMiddleware,
  authorize(['trainer']),
  async (req: Request, res: Response) => {
    try {
      const { programId } = req.params
      const trainerId = req.user?.id

      // Verify program exists and belongs to the trainer
      const program = (await Program.findOne({
        _id: programId,
        trainerId,
      })) as IProgram
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      // Delete the program
      await program.deleteOne()

      res.json({ message: 'Program deleted successfully' })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
    }
  }
)

router.put(
  '/:programId',
  authMiddleware,
  authorize(['trainer']),
  [
    check('programName')
      .optional()
      .notEmpty()
      .withMessage('Program name cannot be empty'),
  ],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { programId } = req.params
      const { programName } = req.body
      const trainerId = req.user?.id

      // Verify program exists and belongs to the trainer
      const program = (await Program.findOne({
        _id: programId,
        trainerId,
      })) as IProgram
      if (!program) {
        return res.status(404).json({ error: 'Program not found' })
      }

      // Update program details
      if (programName) {
        program.programName = programName
      }

      await program.save()

      res.json({ message: 'Program updated successfully', program })
    } catch (error) {
      const err = error as Error
      res.status(500).json({ error: 'Server error', details: err.message })
    }
  }
)

export default router
