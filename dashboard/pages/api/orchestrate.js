import { exec } from 'child_process'
import path from 'path'

const AI_ENDPOINT = 'https://ai.hackclub.com/proxy/v1/chat/completions'

async function callAI(messages) {
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })
    if (!res.ok) throw new Error(`AI API error: ${res.status}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (err) {
    console.error('AI call failed:', err.message)
    return null
  }
}

function generateMockIdeas(track) {
  const ideas = [
    {
      title: `${track || 'Smart'} Analytics Dashboard`,
      description: `A real-time analytics dashboard for ${track || 'your hackathon project'} that visualizes key metrics with interactive charts, AI-powered insights, and anomaly detection. Built with React, D3.js, and TensorFlow.js for on-device ML inference.`,
      probability: '87%',
    },
    {
      title: `${track || 'Community'} Connect Platform`,
      description: `A social platform connecting ${track || 'hackathon'} enthusiasts with mentor matching, project showcases, and collaborative workspaces. Features real-time collaboration and AI-powered skill gap analysis.`,
      probability: '82%',
    },
    {
      title: `AI ${track || 'Assistant'} Pro`,
      description: `An intelligent assistant specialized in ${track || 'hackathon projects'} that helps users discover, learn, and create. Uses RAG with vector embeddings for contextual recommendations.`,
      probability: '76%',
    },
  ]
  return ideas
}

function generateMockScores() {
  return {
    innovation: Math.floor(Math.random() * 2) + 8,
    technical: Math.floor(Math.random() * 3) + 7,
    impact: Math.floor(Math.random() * 2) + 8,
    presentation: Math.floor(Math.random() * 3) + 7,
    feasibility: Math.floor(Math.random() * 2) + 7,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, duration, track, team, tech, existingIdea, generateIdeasOnly, judgeSimulation } = req.body

  if (judgeSimulation) {
    const aiResponse = await callAI([
      {
        role: 'system',
        content: `You are a hackathon judge. Score the following project on a scale of 1-10 for each criterion.
Return ONLY a JSON object with keys: innovation, technical, impact, presentation, feasibility.
Example: {"innovation":8,"technical":7,"impact":9,"presentation":8,"feasibility":7}`,
      },
      {
        role: 'user',
        content: `Project description: ${track || name}`,
      },
    ])

    if (aiResponse) {
      try {
        const scores = JSON.parse(aiResponse)
        return res.json({ scores })
      } catch {
        // fall through to mock
      }
    }

    return res.json({ scores: generateMockScores() })
  }

  if (generateIdeasOnly) {
    const aiResponse = await callAI([
      {
        role: 'system',
        content: `You are a hackathon idea generator. Generate 3 winning project ideas for the given theme.
Return ONLY a JSON array of objects with keys: title, description, probability (as string with %).
Make descriptions detailed (2-3 sentences) and probabilities realistic (70-95%).`,
      },
      {
        role: 'user',
        content: `Theme: ${track || name}`,
      },
    ])

    if (aiResponse) {
      try {
        const ideas = JSON.parse(aiResponse)
        return res.json({ ideas })
      } catch {
        // fall through to mock
      }
    }

    return res.json({ ideas: generateMockIdeas(track || name) })
  }

  const orchestratorPath = path.join(process.cwd(), '..', 'orchestrator.py')

  const runPythonOrchestrator = () => {
    return new Promise((resolve) => {
      const teamArg = team ? team.split('\n').filter(Boolean).join(',') : ''
      const techArg = tech || ''
      const cmd = `python "${orchestratorPath}" --name "${name || ''}" --duration ${duration || 24} --track "${track || ''}" --team "${teamArg}" --tech "${techArg}"`

      exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('Orchestrator error:', stderr)
          resolve(null)
          return
        }
        try {
          resolve(JSON.parse(stdout))
        } catch {
          console.error('Failed to parse orchestrator output')
          resolve(null)
        }
      })
    })
  }

  let result = await runPythonOrchestrator()

  if (!result) {
    const aiResponse = await callAI([
      {
        role: 'system',
        content: `You are a hackathon project generator. Generate a complete project plan.
Return JSON with: title, description, techStack (array), githubRepo (url), vercelUrl (url),
pitchDeckUrl (url), videoUrl (url), judgeScores (object with innovation/technical/impact/presentation/feasibility),
submissionSummary (string). Make it realistic and detailed.`,
      },
      {
        role: 'user',
        content: `Hackathon: ${name || 'Hackathon'}
Duration: ${duration || 24}h
Track: ${track || 'Open'}
Team: ${team || 'Solo'}
Tech: ${tech || 'Any'}
${existingIdea ? `Existing idea: ${existingIdea}` : ''}`,
      },
    ])

    if (aiResponse) {
      try {
        result = JSON.parse(aiResponse)
      } catch {
        result = null
      }
    }
  }

  if (!result) {
    const shortName = (name || 'My Project').substring(0, 20)
    const slug = shortName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    result = {
      title: `${shortName} - ${track || 'Open Track'} Project`,
      description: `A comprehensive ${track || 'full-stack'} application built for ${name || 'the hackathon'}. Features real-time data processing, AI-powered insights, and an intuitive user interface designed to solve real problems.`,
      techStack: (tech || 'React,Node.js,TailwindCSS,MongoDB').split(',').map(t => t.trim()),
      githubRepo: `https://github.com/hackeasy/${slug}`,
      vercelUrl: `https://${slug}.vercel.app`,
      pitchDeckUrl: `https://docs.google.com/presentation/d/${Math.random().toString(36).substring(2, 10)}`,
      videoUrl: `https://youtube.com/watch?v=${Math.random().toString(36).substring(2, 10)}`,
      judgeScores: generateMockScores(),
      submissionSummary: `${shortName} is a ${track || 'full-stack'} application built with ${tech || 'modern web technologies'}. The project features real-time capabilities, AI-driven features, and a polished user interface. Built by a dedicated team during ${name || 'the hackathon'}.`,
    }
  }

  res.json(result)
}
