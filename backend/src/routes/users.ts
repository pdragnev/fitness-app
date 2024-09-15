import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import Program from '../models/Program'

const router = Router()

// Get Assigned Programs
router.get('/programs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    // Find programs assigned to the user
    const programs = await Program.find({ assignedUsers: userId }).populate({
      path: 'trainingDays',
      populate: {
        path: 'exercises',
        populate: {
          path: 'sets',
        },
      },
    })

    res.json({ programs })
  } catch (error) {
    const err = error as Error
    res.status(500).json({ error: 'Server error', details: err.message })
  }
})

export default router
