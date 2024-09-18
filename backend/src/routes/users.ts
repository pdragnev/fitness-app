import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import Program from '../models/Program'

const router = Router()

router.get('/programs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1 // Default to page 1
    const limit = parseInt(req.query.limit as string) || 10 // Default to 10 items per page
    const skip = (page - 1) * limit

    // Find programs assigned to the user with pagination
    const programs = await Program.find({ assignedUsers: userId })
      .skip(skip)
      .limit(limit)

    // Optionally, get the total count for pagination info
    const totalPrograms = await Program.countDocuments({
      assignedUsers: userId,
    })

    res.json({
      programs,
      currentPage: page,
      totalPages: Math.ceil(totalPrograms / limit),
      totalPrograms,
    })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Server error', details: (error as Error).message })
  }
})

export default router
