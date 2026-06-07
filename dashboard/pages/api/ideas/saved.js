import { getServerSession } from 'next-auth'
import { getSavedIdeas } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, {
    providers: [],
    callbacks: {
      async authorize() { return true }
    }
  })

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const ideas = getSavedIdeas(parseInt(session.user.id))
    return res.json({ ideas })
  } catch (err) {
    console.error('Get ideas error:', err)
    return res.status(500).json({ error: 'Failed to fetch ideas' })
  }
}