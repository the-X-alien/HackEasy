import bcrypt from 'bcryptjs'
import { createUser, getUserByEmail } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  try {
    const existing = getUserByEmail(email)
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = createUser(email, passwordHash)

    return res.status(201).json({ message: 'Account created successfully', userId: user.id })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({ error: 'Failed to create account' })
  }
}