import { getServerSession } from 'next-auth'
import { saveIdea } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res)
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { idea } = req.body
  if (!idea || !idea.title) {
    return res.status(400).json({ error: 'Idea with title is required' })
  }

  try {
    const id = await saveIdea(session.user.id, idea)
    return res.status(201).json({ success: true, id })
  } catch (err) {
    console.error('Save idea error:', err)
    return res.status(500).json({ error: 'Failed to save idea' })
  }
}