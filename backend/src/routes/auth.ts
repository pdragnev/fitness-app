import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'
import dotenv from 'dotenv'
import { check, validationResult } from 'express-validator'
dotenv.config()

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET as string

// Register Route
router.post(
  '/register',
  [
    // Validation middleware
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({
      min: 6,
    }),
    check('role', 'Role must be either "trainer" or "user"').isIn([
      'trainer',
      'user',
    ]),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const { email, password, role } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' })
      }

      // Hash the password
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Create new user
      const user: IUser = new User({ email, password: hashedPassword, role })
      await user.save()

      res.status(201).json({ message: 'User registered successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Server error' })
    }
  }
)

// Login Route
router.post(
  '/login',
  [
    // Validation middleware
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req: Request, res: Response) => {
    // Handle validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const { email, password } = req.body

      // Find user by email
      const user = (await User.findOne({ email })) as IUser
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' })
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' })
      }

      // Create JWT payload
      const payload = {
        id: user._id,
        role: user.role,
      }

      // Sign token
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '1h',
      })

      res.json({ token, role: user.role })
    } catch (error) {
      res.status(500).json({ error: 'Server error' })
    }
  }
)

export default router
