import { getServerSession } from 'next-auth'
import { removeIdea } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res)
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.body
  if (!id) {
    return res.status(400).json({ error: 'Idea ID is required' })
  }

  try {
    await removeIdea(session.user.id, id)
    return res.json({ success: true })
  } catch (err) {
    console.error('Delete idea error:', err)
    return res.status(500).json({ error: 'Failed to delete idea' })
  }
}