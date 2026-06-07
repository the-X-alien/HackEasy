const HACKAI_ENDPOINT = 'https://ai.hackclub.com/proxy/v1/chat/completions'
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

const HACKAI_API_KEY = process.env.HACKAI_API_KEY || ''

async function callAI(messages, model = 'openai/gpt-4o-mini', userApiKey = '') {
  const useOpenRouter = !!userApiKey
  const endpoint = useOpenRouter ? OPENROUTER_ENDPOINT : HACKAI_ENDPOINT

  const body = {
    model: useOpenRouter ? model : 'openai/gpt-4o-mini',
    messages,
    temperature: 0.8,
    max_tokens: 3000,
  }

  const headers = { 'Content-Type': 'application/json' }
  if (useOpenRouter) {
    headers['Authorization'] = `Bearer ${userApiKey}`
    headers['HTTP-Referer'] = 'https://hackeasy.app'
    headers['X-Title'] = 'HackEasy Idea Generator'
  } else if (HACKAI_API_KEY) {
    headers['Authorization'] = `Bearer ${HACKAI_API_KEY}`
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`AI API error ${res.status}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content || null
  } catch (err) {
    console.error('AI call failed:', err.message)
    return null
  }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const IDEA_PREFIXES = ['AI-Powered', 'Smart', 'Next-Gen', 'Real-Time', 'Automated', 'Intelligent', 'Adaptive', 'Decentralized', 'Collaborative', 'Predictive', 'Personalized', 'Context-Aware', 'Seamless', 'Instant', 'Zero-Click', 'Voice-Activated', 'Gesture-Controlled', 'Privacy-First', 'Open-Source', 'Community-Driven']

const IDEA_SUFFIXES = ['Platform', 'Hub', 'Assistant', 'Engine', 'Dashboard', 'Toolkit', 'Network', 'Companion', 'System', 'Suite', 'Navigator', 'Pilot', 'Sentry', 'Bridge', 'Sync', 'Forge', 'Lens', 'Watch', 'Flow', 'Mind']

const TECH_STACKS = ['React + Node.js + PostgreSQL', 'Next.js + Python FastAPI + Redis', 'Flutter + Firebase + TensorFlow Lite', 'React Native + Supabase + OpenAI', 'Svelte + Go + SQLite', 'Electron + Rust + WebAssembly', 'SwiftUI + CloudKit + CoreML', 'Vue + Django + Celery']
const HARDWARE_STACKS = ['ESP32 + Arduino + MQTT', 'Raspberry Pi + Python + GPIO', 'ESP8266 + Blynk + IFTTT', 'STM32 + Zephyr + BLE', 'Teensy + PlatformIO + Serial', 'Jetson Nano + CUDA + OpenCV', 'Adafruit Feather + LoRa + GPS', 'Arduino + Ultrasonic + WiFi']

const PROBLEMS = {
  'Health & Wellness': ['medication non-adherence', 'mental health stigma', 'sedentary lifestyle', 'sleep quality tracking', 'healthcare accessibility gaps', 'stress monitoring', 'chronic disease management', 'elderly fall detection', 'posture correction', 'hydration tracking'],
  'Productivity & Tools': ['context switching overhead', 'meeting fatigue', 'information overload', 'task fragmentation', 'knowledge silos', 'distraction management', 'email overload', 'time blocking difficulty', 'cross-platform workflow gaps', 'collaboration friction'],
  'Education & Learning': ['student disengagement', 'one-size-fits-all curriculum', 'homework help accessibility', 'study motivation', 'concept visualization gaps', 'language barriers in learning', 'teacher burnout', 'skill gap tracking', 'flashcard fatigue', 'group project coordination'],
  'Entertainment & Fun': ['content discovery overload', 'social gaming loneliness', 'creative block', 'passive consumption habits', 'AR content creation complexity', 'music discovery stagnation', 'storytelling tool complexity', 'live event engagement', 'retro gaming accessibility', 'short-form content addiction'],
  'Safety & Security': ['online privacy complexity', 'phishing detection', 'personal safety while jogging', 'digital footprint management', 'password overload', 'IoT security vulnerabilities', 'emergency alert delivery', 'location sharing boundaries', 'social media impersonation', 'data breach notification'],
  'Environment & Climate': ['individual carbon tracking friction', 'food waste at home', 'energy consumption visibility', 'sustainable product discovery', 'community cleanup coordination', 'water usage monitoring', 'plastic waste reduction', 'composting complexity', 'fast fashion impact', 'local biodiversity tracking'],
  'Social & Community': ['local event discovery', 'volunteer coordination', 'neighborhood communication', 'skill sharing within communities', 'mutual aid organizing', 'loneliness in urban areas', 'cultural exchange accessibility', 'civic engagement barriers', 'community resource sharing', 'intergenerational connection'],
  'Finance & Fintech': ['financial literacy for teens', 'subscription tracking fatigue', 'impulse spending', 'investment complexity for beginners', 'split payment awkwardness', 'credit score improvement', 'side hustle income tracking', 'budget adherence motivation', 'receipt organization', 'tax preparation for freelancers'],
  'Communication': ['async communication delays', 'cross-language barriers', 'meeting overload', 'digital communication tone ambiguity', 'group chat fragmentation', 'feedback delivery difficulty', 'remote team bonding', 'accessibility in communication', 'information decay in threads', 'decision logging'],
  'Data & Analytics': ['personal data fragmentation', 'small business analytics complexity', 'open data accessibility', 'data storytelling barriers', 'social media insight extraction', 'health data correlation', 'sports performance tracking', 'trend detection noise', 'data literacy gaps', 'real-time dashboard complexity'],
}

const SOLUTIONS = {
  'Health & Wellness': [
    'using computer vision and your webcam to detect vitals without any wearable hardware',
    'with AI-powered personalized recommendations based on your daily routines and biometrics',
    'that gamifies healthy habits with streak tracking, social accountability, and reward mechanics',
    'using a smartphone camera and ML to analyze food, posture, or skin health in real-time',
    'that connects patients with peer support groups matched by condition, location, and schedule',
  ],
  'Productivity & Tools': [
    'that automatically groups your tasks by context and energy level using AI scheduling',
    'using NLP to summarize meetings, emails, and documents into a single daily briefing',
    'that blocks distractions by learning your peak focus hours and intelligently scheduling deep work',
    'using a minimalist interface with keyboard-first navigation for power users',
    'that syncs across all your devices with offline-first architecture and instant conflict resolution',
  ],
  'Education & Learning': [
    'that adapts difficulty in real-time based on your answers, confidence, and time spent',
    'using AI to generate personalized practice problems from your class notes and textbooks',
    'that connects you with a study partner matched by subject, skill level, and available time',
    'using spaced repetition and active recall optimized by your personal forgetting curve',
    'that visualizes any concept as an interactive 3D model you can explore and manipulate',
  ],
  'Entertainment & Fun': [
    'that generates unique, personalized content using your preferences, mood, and time of day',
    'using AI to remix your music library into seamless, context-aware playlists',
    'that turns any photo into a playable retro-style video game level',
    'using your webcam and ML to create real-time AR filters for any video call platform',
    'that generates collaborative stories where each person adds a sentence through a voting system',
  ],
  'Safety & Security': [
    'using on-device AI to detect phishing attempts before they reach your inbox',
    'that alerts trusted contacts when your routine is disrupted using passive phone sensors',
    'using computer vision to detect and blur sensitive information in screenshots automatically',
    'that generates unique, memorable passphrases and manages them with biometric auth',
    'using your phone accelerometer to detect falls and automatically alert emergency contacts',
  ],
  'Environment & Climate': [
    'that scans your grocery receipts and suggests lower-carbon alternatives automatically',
    'using your smart meter data to show exactly which appliances consume the most energy',
    'that connects neighbors for tool sharing, compost pickup, and bulk buying to reduce waste',
    'using satellite imagery and ML to help communities track local environmental changes',
    'that gamifies your carbon footprint with challenges, leaderboards, and impact visualization',
  ],
  'Social & Community': [
    'that matches neighbors by skills, needs, and availability for mutual aid and skill sharing',
    'using AI to aggregate and personalize local events, volunteer opportunities, and community needs',
    'that creates temporary, purpose-based chat groups that auto-dissolve after the goal is met',
    'using location-based prompts to facilitate real-world connections in shared spaces',
    'that connects seniors with nearby students for regular video calls and skill exchanges',
  ],
  'Finance & Fintech': [
    'that rounds up every purchase and invests the difference with AI-optimized portfolios',
    'using OCR to scan receipts and automatically categorize spending with personalized insights',
    'that gamifies saving with challenges, streak rewards, and social accountability groups',
    'using AI to detect subscription services you are not using and suggest cancellations',
    'that provides financial education through interactive scenarios and risk-free simulations',
  ],
  'Communication': [
    'that adds emotional context to messages through AI-suggested tone indicators',
    'using real-time translation with speaker identification for multilingual meetings',
    'that summarizes long message threads into action items, decisions, and open questions',
    'using AI to suggest optimal meeting times across time zones with buffer enforcement',
    'that turns voice notes into formatted messages with action items extracted automatically',
  ],
  'Data & Analytics': [
    'that creates a unified personal data dashboard pulling from all your apps and devices',
    'using natural language queries to explore your data without SQL or technical skills',
    'that automatically detects trends and anomalies in your data and explains them in plain English',
    'using AI to generate beautiful, publication-ready visualizations from raw CSV uploads',
    'that correlates data from multiple sources to find hidden insights you would never think to look for',
  ],
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateFallbackIdeas(category, track) {
  const numIdeas = randomInt(3, 4)
  const ideas = []
  const usedTitles = new Set()

  const categoryProblems = PROBLEMS[category] || PROBLEMS['Productivity & Tools']
  const categorySolutions = SOLUTIONS[category] || SOLUTIONS['Productivity & Tools']
  const shuffledProblems = shuffle(categoryProblems)
  const shuffledSolutions = shuffle(categorySolutions)

  for (let i = 0; i < numIdeas; i++) {
    const prefix = IDEA_PREFIXES[randomInt(0, IDEA_PREFIXES.length - 1)]
    const suffix = IDEA_SUFFIXES[randomInt(0, IDEA_SUFFIXES.length - 1)]
    const noun = category.split('&')[0]?.trim() || category.split('/')[0]?.trim() || 'Project'
    const title = `${prefix} ${noun} ${suffix}`
    if (usedTitles.has(title)) continue
    usedTitles.add(title)

    const problem = shuffledProblems[i % shuffledProblems.length]
    const solution = shuffledSolutions[i % shuffledSolutions.length]
    const stacks = track === 'hardware' ? HARDWARE_STACKS : TECH_STACKS
    const stack = stacks[randomInt(0, stacks.length - 1)]

    const wis = randomInt(72, 96)
    const pain = randomInt(65, 95)
    const novelty = randomInt(60, 92)
    const feasibility = randomInt(68, 94)
    const alignment = randomInt(75, 99)

    ideas.push({
      title,
      description: `A ${prefix.toLowerCase()} tool that solves ${problem} ${solution}. Built with ${stack}. Features AI-powered insights, real-time feedback, and a clean, accessible interface designed for hackathon judging.`,
      wis_score: wis,
      pain_score: pain,
      novelty_score: novelty,
      feasibility_score: feasibility,
      alignment_score: alignment,
    })
  }

  return ideas
}

function getSystemMessage(config) {
  const { category, track, judging, rubric } = config

  const trackGuidance = track === 'hardware'
    ? `FOCUS: Physical prototypes. Use ESP32, Arduino, Raspberry Pi, sensors, or specialized hardware. Aim for "Hardware is Hard" but "Hardware is Impactful".`
    : `FOCUS: High-quality software. Use modern frameworks, AI APIs, clever algorithms, or novel UI patterns. Aim for "Scalable" and "Seamless".`

  const judgingGuidance = judging === 'peer-voted'
    ? `STRATEGY: Peer-voted. Focus on HIGH VIRALITY and WOW FACTOR. The project should be demo-ready, visually stunning, or hilarious. It must be something people want to use IMMEDIATELY.`
    : `STRATEGY: Judge-judged. Focus on TECHNICAL RIGOR, REAL-WORLD IMPACT, and PROBLEM-SOLUTION FIT. Clear utility, sophisticated implementation, and aligned with industry trends.`

  const rubricGuidance = rubric ? `\nCRITICAL COMPLIANCE: Adhere strictly to this rubric/theme: ${rubric}` : ''

  return `You are a high-stakes Hackathon Idea Strategist. Your goal is to generate 10-star, winning ideas for the "${category}" category.

${trackGuidance}
${judgingGuidance}
${rubricGuidance}

GENERATION RULES:
1. Generate EXACTLY 3 ideas.
2. TITLE: Punchy, memorable, and specific (e.g., "SentryFlow" instead of "Smart Safety Tool").
3. DESCRIPTION: 2-3 sentences. Explain the specific pain point and the "magic" of the solution.
4. SCORES (0-100):
   - wis_score: The "Why Is it Special" factor.
   - pain_score: How much it hurts if this problem isn't solved.
   - novelty_score: How unique it is compared to typical hackathon projects.
   - feasibility_score: Can a team build an MVP in 24-48 hours?
   - alignment_score: How well it fits the category and judging criteria.

5. OUTPUT FORMAT: Return ONLY a raw JSON array of objects. No markdown, no code blocks, no preamble.

Example Object:
{
  "title": "EcoSnap",
  "description": "Uses on-device computer vision to identify non-recyclables in real-time. Provides instant disposal guidance and tracks community impact stats.",
  "wis_score": 88,
  "pain_score": 75,
  "novelty_score": 82,
  "feasibility_score": 90,
  "alignment_score": 95
}`
}

const HANDLERS = {
  async 'generate-ideas'(config) {
    const { category, track, judging, rubric, model, apiKey } = config

    if (!category) {
      return { ideas: generateFallbackIdeas('Productivity & Tools', track) }
    }

    const messages = [
      { role: 'system', content: getSystemMessage({ category, track, judging, rubric }) },
      { role: 'user', content: `Generate 3 winning hackathon ideas for "${category}" category. Track: ${track || 'software'}. Judging: ${judging || 'judge-judged'}.` },
    ]

    const ai = await callAI(messages, model, apiKey)
    if (ai) {
      try {
        const cleaned = ai.replace(/```json\s*/gi, '').replace(/```\s*$/, '').trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { ideas: parsed.slice(0, 5) }
        }
      } catch {
        const match = ai.match(/\[[\s\S]*\]/)
        if (match) {
          try {
            const parsed = JSON.parse(match[0])
            if (Array.isArray(parsed) && parsed.length > 0) {
              return { ideas: parsed.slice(0, 5) }
            }
          } catch {}
        }
      }
    }

    if (ai) console.log('[AI RESPONSE]', ai.substring(0, 500))
    return { ideas: generateFallbackIdeas(category, track) }
  },

  async 'build-instructions'(config) {
    const { title, description, track, judging } = config

    const messages = [
      { role: 'system', content: 'You are a hackathon engineering mentor. Give practical, actionable build guides.' },
      { role: 'user', content: `Give a team step-by-step build instructions for their hackathon project.

Project: ${title}
Description: ${description}
Type: ${track || 'software'}
Judging: ${judging || 'judge-judged'}

Include:
1. Tech Stack Recommendation — specific frameworks, tools, APIs
2. Build Plan — day-by-day for building MVP in ${track === 'hardware' ? '48h' : '24h'}
3. Demo Script — 60-second pitch script
4. Pitch Tips
5. Common Pitfalls

Return as markdown.` },
    ]

    const ai = await callAI(messages)
    if (ai) return { instructions: ai }

    return { instructions: markdownBuildGuide({ title, description }) }
  },
}

function markdownBuildGuide({ title, description }) {
  const stacks = ['Next.js + Tailwind + Prisma + PostgreSQL', 'React + FastAPI + Redis + Docker', 'Flutter + Firebase + Riverpod', 'SvelteKit + Drizzle + SQLite', 'Electron + React + Webpack']
  const stack = stacks[Math.floor(Math.random() * stacks.length)]

  return `## Implementation Guide: ${title}

### Recommended Tech Stack
- **Frontend**: ${stack}
- **Auth**: NextAuth.js or Clerk
- **AI**: OpenAI API / Anthropic Claude
- **Deploy**: Vercel (web), Railway (backend)

### Build Plan (24h)

**Day 1: Foundation (0-6h)**
- Scaffold project, set up auth, create DB schema
- Deploy preview environment

**Day 1: Core Feature (6-12h)**
- Build the main user-facing feature
- Wire up API endpoints
- Basic UI with loading/error states

**Day 2: Polish (12-18h)**
- Secondary features and edge cases
- Responsive design pass
- AI integrations

**Day 2: Ship (18-24h)**
- Write demo script, prepare slides
- Final bug fixes and deploy
- Record backup demo video

### 60-Second Demo Script

1. **Problem** (15s): "Every day, [target users] struggle with [specific pain point]."
2. **Solution** (15s): "So we built [project name] — it [core value prop]."
3. **Live Demo** (20s): Show the main flow. Keep it simple. One click-through.
4. **Impact** (5s): "Built in 24 hours. Working. Real users."
5. **Close** (5s): Questions?

### Pitch Tips
- Show, don't tell. Demo first, slides second.
- Have a backup video recording ready.
- Know your numbers: active users, messages sent, etc.
- Address the rubric directly in your Q&A.

### Common Pitfalls
- Over-scoping: pick 3 features and nail them
- Skipping error states: judges click broken buttons
- Bad demo data: pre-seed with realistic content
- No mobile responsiveness: judges check on phones`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const { type, config } = body
  const handler = HANDLERS[type]

  if (!handler) {
    return res.status(400).json({ error: `Unknown type: ${type}` })
  }

  try {
    const result = await handler(config || {})
    return res.json(result)
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}
