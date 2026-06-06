import { spawn } from 'child_process'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    hackathon_name,
    duration_hours,
    track,
    team_members,
    tech_stack,
    existing_idea,
  } = req.body

  if (!hackathon_name) {
    return res.status(400).json({ error: 'hackathon_name is required' })
  }

  const projectDir = path.resolve(process.cwd(), '..')

  const args = [
    'orchestrator.py',
    '--hackathon', hackathon_name,
    '--duration', String(duration_hours || 48),
  ]

  if (track) {
    args.push('--track', track)
  }

  if (team_members) {
    const members = Array.isArray(team_members)
      ? team_members
      : team_members.split('\n').map(m => m.trim()).filter(Boolean)
    args.push('--team', members.join(','))
  }

  if (tech_stack) {
    const stack = Array.isArray(tech_stack)
      ? tech_stack
      : tech_stack.split(',').map(t => t.trim()).filter(Boolean)
    args.push('--tech-stack', stack.join(','))
  }

  if (existing_idea) {
    args.push('--idea', existing_idea)
  }

  const child = spawn('python', args, {
    cwd: projectDir,
    timeout: 600000,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  let stdout = ''
  let stderr = ''

  child.stdout.on('data', (data) => {
    stdout += data.toString()
  })

  child.stderr.on('data', (data) => {
    stderr += data.toString()
  })

  child.on('error', (err) => {
    return res.status(500).json({
      error: 'Failed to start orchestrator',
      details: err.message,
    })
  })

  child.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({
        error: 'Orchestrator exited with error',
        exitCode: code,
        stderr: stderr.trim(),
      })
    }

    try {
      const result = JSON.parse(stdout.trim())
      return res.status(200).json(result)
    } catch (e) {
      return res.status(500).json({
        error: 'Failed to parse orchestrator output',
        raw: stdout.trim(),
        stderr: stderr.trim(),
      })
    }
  })
}
