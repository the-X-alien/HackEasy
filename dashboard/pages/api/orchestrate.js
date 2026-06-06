const AI_ENDPOINT = 'https://ai.hackclub.com/proxy/v1/chat/completions'

async function callAI(messages, schema) {
  try {
    const apiKey = process.env.AI_API_KEY
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
      },
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

function mockIdeas(track, name) {
  const t = track || name || 'general'
  return [
    { title: `${t} Analytics Hub`, description: `Real-time analytics dashboard for ${t} with interactive charts, AI insights, and anomaly detection. Built with React, D3.js, and TensorFlow.js.`, probability: 87, why: 'Data-driven projects consistently score high on technical criteria.' },
    { title: `${t} Connect`, description: `Social platform for ${t} enthusiasts with mentor matching, project showcases, and collaborative workspaces. Features AI skill gap analysis.`, probability: 82, why: 'Community platforms have strong narrative potential for pitching.' },
    { title: `AI ${t} Assistant`, description: `Intelligent assistant specialized in ${t} using RAG with vector embeddings for contextual recommendations and personalized guidance.`, probability: 76, why: 'AI applications are trending and demonstrate technical depth.' },
  ]
}

function mockTrackSuggestions(name) {
  const tracks = ['AI/ML Innovation', 'Social Impact', 'Developer Tools', 'Health Tech', 'EdTech', 'Climate & Sustainability', 'Fintech', 'Open Innovation']
  return name ? tracks.slice(0, 4).map(t => `${t} (good fit for ${name})`) : tracks.slice(0, 4)
}

function mockRoleSuggestions(teamSize) {
  const roles = ['Frontend Lead', 'Backend Lead', 'ML Engineer', 'UI/UX Designer', 'Project Manager', 'Full Stack Developer', 'Data Engineer', 'DevOps']
  return Array.from({ length: Math.min(teamSize, 8) }, (_, i) => roles[i % roles.length])
}

function mockTasks(ideaTitle) {
  return [
    { name: `Set up ${ideaTitle || 'project'} scaffolding`, time: '45m' },
    { name: 'Configure authentication', time: '1h' },
    { name: 'Build core API routes', time: '2h' },
    { name: 'Create main UI components', time: '2.5h' },
    { name: 'Implement data persistence', time: '1.5h' },
    { name: 'Write tests for critical paths', time: '1h' },
    { name: 'Prepare demo script', time: '30m' },
    { name: 'Final polish and bug fixes', time: '1h' },
  ]
}

function mockSlideContent(title, type) {
  const contents = {
    'Title Slide': 'Project Name\nA Hackathon Project\nBuilt with HackEasy Co-Pilot',
    Problem: 'Hackers waste precious time on planning and logistics instead of building. Our co-pilot handles the overhead so teams focus on what matters.',
    Solution: 'AI-powered co-pilot that suggests, drafts, and organizes at every step. The user stays in control and makes all final decisions.',
  }
  return contents[title] || 'Content goes here. Edit this slide to tell your story.'
}

function mockDevpostContent(config) {
  return {
    problem: `Our project solves the challenge of ${config.track || 'building under time pressure'} during hackathons. Teams waste hours on planning that could be spent building.`,
    build: `Built with ${config.tech || 'modern web technologies'} by a ${config.team ? config.team.split('\n').length + '-person' : 'dedicated'} team during ${config.name || 'the hackathon'}. We used AI-powered tools to accelerate development while maintaining quality.`,
    challenges: `The biggest challenge was designing a co-pilot that guides without taking over. Every interaction point was designed around user approval and control.`,
    accomplishments: 'A fully functional co-pilot that guides users from idea to submission with full transparency and control at every step.',
    tech: config.tech || 'Next.js, React, Tailwind CSS, AI APIs',
    future: 'Real-time team collaboration, expanded AI model support, and a template library from past winning projects.',
  }
}

function mockChecklist() {
  return {
    deploy: { label: 'Project Deployed', status: 'complete', url: 'https://project.vercel.app' },
    github: { label: 'GitHub Repo Created', status: 'complete', url: 'https://github.com/hackeasy/project' },
    pitch: { label: 'Pitch Deck Generated', status: 'complete' },
    devpost: { label: 'Devpost Content Approved', status: 'warning' },
    video: { label: 'Demo Video Rendered', status: 'complete' },
    judge: { label: 'Judge Score >= 7/10', status: 'complete', score: 8.4 },
  }
}

const HANDLERS = {
  async 'suggest-track'(config) {
    const prompt = `Suggest 4 hackathon tracks/themes that would be a great fit for "${config.name || 'a hackathon'}". Return ONLY a JSON array of strings.`
    const ai = await callAI([{ role: 'system', content: 'You are a hackathon consultant. Suggest relevant tracks based on the hackathon name.' }, { role: 'user', content: prompt }])
    if (ai) try { return { suggestions: JSON.parse(ai) } } catch {}
    return { suggestions: mockTrackSuggestions(config.name) }
  },

  async 'suggest-roles'(config) {
    const names = (config.team || '').split('\n').filter(Boolean)
    const prompt = `Suggest roles for a ${names.length}-person hackathon team: ${names.join(', ')}. Return ONLY a JSON array of strings where each is "Name - Role".`
    const ai = await callAI([{ role: 'system', content: 'You are a hackathon team consultant. Suggest optimal roles based on team members.' }, { role: 'user', content: prompt }])
    if (ai) try { return { suggestions: JSON.parse(ai) } } catch {}
    return { suggestions: mockRoleSuggestions(names.length) }
  },

  async 'generate-ideas'(config) {
    const prompt = `Generate 5 winning hackathon project ideas for "${config.name || 'a hackathon'}"${config.track ? ` in the ${config.track} track` : ''}. Return ONLY a JSON array of objects with: title, description (2-3 sentences), probability (number 65-95), why (1 sentence why this fits).`
    const ai = await callAI([{ role: 'system', content: 'You are a top hackathon strategist. Generate ideas with win probabilities based on judging trends.' }, { role: 'user', content: prompt }])
    if (ai) try { return { ideas: JSON.parse(ai) } } catch {}
    return { ideas: mockIdeas(config.track, config.name) }
  },

  async 'generate-tasks'(idea) {
    const prompt = `Break down the hackathon project "${idea || 'a hackathon project'}" into 6-8 tasks with estimated times. Return ONLY a JSON array of objects with: name, time (string like "1h" or "45m"). Prioritize tasks for a 24-hour build window.`
    const ai = await callAI([{ role: 'system', content: 'You are a project manager for hackathon teams. Break down projects into actionable tasks.' }, { role: 'user', content: prompt }])
    if (ai) try { return { tasks: JSON.parse(ai) } } catch {}
    return { tasks: mockTasks(idea) }
  },

  async 'generate-slide'(slide) {
    const prompt = `Write content for a pitch deck slide titled "${slide.title || 'Slide'}" (type: ${slide.type || 'text'}). Return ONLY a JSON object with: title (string), content (2-3 sentences).`
    const ai = await callAI([{ role: 'system', content: 'You are a presentation expert for hackathon pitch decks.' }, { role: 'user', content: prompt }])
    if (ai) try { return JSON.parse(ai) } catch {}
    return { title: slide.title, content: mockSlideContent(slide.title, slide.type) }
  },

  async 'generate-devpost'(config) {
    const prompt = `Draft a Devpost submission for a ${config.track || 'general'} hackathon project. Return ONLY a JSON object with keys: problem, build (how we built it), challenges, accomplishments, tech (comma-separated), future.`
    const ai = await callAI([{ role: 'system', content: 'You are a Devpost writing expert. Draft compelling hackathon submission text.' }, { role: 'user', content: prompt }])
    if (ai) try { return { sections: JSON.parse(ai) } } catch {}
    return { sections: mockDevpostContent(config) }
  },

  async 'generate-script'(idea) {
    const prompt = `Write a 60-second demo script for "${idea || 'a hackathon project'}". Return ONLY a JSON object with: script (string with 3 paragraphs: intro, demo, closing).`
    const ai = await callAI([{ role: 'system', content: 'You are a demo scriptwriter. Write concise, impactful demo scripts.' }, { role: 'user', content: prompt }])
    if (ai) try { return JSON.parse(ai) } catch {}
    return { script: `Welcome to our demo of ${idea || 'our project'}!\n\n[The problem] Hackers waste time on planning.\n[Our solution] An AI co-pilot that accelerates every step.\n[Live demo] Watch how it works.\n[Impact] Teams can focus on building.\n\nThank you! Questions?` }
  },

  async 'checklist'() {
    return { checklist: mockChecklist() }
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, config, idea, slide } = req.body
  const handler = HANDLERS[type]

  if (!handler) {
    return res.status(400).json({ error: `Unknown type: ${type}. Valid: ${Object.keys(HANDLERS).join(', ')}` })
  }

  try {
    const result = await handler({ config, idea, slide, ...(config || {}) })
    return res.json(result)
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
