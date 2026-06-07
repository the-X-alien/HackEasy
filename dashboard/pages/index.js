import { useState } from 'react'
import Head from 'next/head'
import toast from 'react-hot-toast'

const FEATURES = [
  {
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    title: 'AI-Powered Ideas',
    desc: 'Generate winning hackathon ideas tailored to your track, judging type, and rubric. Each idea comes with a WIS score across pain, novelty, feasibility, and alignment.',
    cta: 'Start generating',
  },
  {
    icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
    title: 'Save for Later',
    desc: 'Bookmark your favorite ideas with one click. They persist across sessions via local storage — no account needed. Export them anytime.',
    cta: 'Build your shortlist',
  },
  {
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    title: 'Ask How to Build',
    desc: 'For any idea, get an instant implementation guide with tech stack recommendations, a day-by-day build plan, and a 60-second demo script.',
    cta: 'Go from idea to code',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Smart Scoring',
    desc: 'Every idea is scored on pain, novelty, feasibility, and rubric alignment. The WIS score tells you at a glance which ideas are most likely to win.',
    cta: 'Score your ideas',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Rubric-Aligned',
    desc: 'Paste your hackathon rubric and every idea is generated to match the judging criteria. No more building something judges wont score well.',
    cta: 'Optimize for the rubric',
  },
  {
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    title: 'Model Selection',
    desc: 'Use HackAI for free generation or unlock premium models (Claude Opus 4.8, GPT-4o, Gemini 2.5 Pro) with your API key in settings.',
    cta: 'Choose your model',
  },
]

const TESTIMONIALS = [
  {
    quote: 'We went from blank page to a polished demo in 36 hours. The AI-generated ideas were actually good, and the build guide saved us from over-engineering.',
    author: 'Alex Chen',
    role: 'Milpitas Hacks Winner',
  },
  {
    quote: 'The WIS scoring helped us pick the right idea. Our first choice scored 94, we built it, and it won. The rubric alignment feature is a cheat code.',
    author: 'Sarah Kim',
    role: 'Los Altos Hacks Winner',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Configure',
    desc: 'Set your track (software/hardware) and judging type. Optionally paste the hackathon rubric.',
  },
  {
    num: '02',
    title: 'Generate',
    desc: 'Browse 10 categories. Generate ideas for one or all at once. Each with a WIS score and breakdown.',
  },
  {
    num: '03',
    title: 'Save & Compare',
    desc: 'Bookmark your favorite ideas. Compare WIS scores. Export your shortlist anytime.',
  },
  {
    num: '04',
    title: 'Build It',
    desc: 'Click "How to build this?" for an instant guide with tech stack, build plan, and demo script.',
  },
  {
    num: '05',
    title: 'Ship & Win',
    desc: 'Execute the plan. Demo with confidence. The rubric alignment means judges see what they are looking for.',
  },
]

function NavBar() {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[rgb(15,23,42)]/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#8A61FF]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-lg font-bold font-mono">HackEasy</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('features')} className="text-sm text-gray-400 hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</button>
          <button onClick={() => scrollTo('testimonials')} className="text-sm text-gray-400 hover:text-white transition-colors">Testimonials</button>
          <a href="/dashboard" className="btn-primary text-sm py-2 px-5">Generate Ideas</a>
        </div>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-[#8A61FF]/10 border border-[#8A61FF]/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">AI-powered hackathon idea generation</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-mono leading-tight mb-6">
          Generate{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A61FF] to-[#A78BFA]">winning ideas</span>
          {' '}in seconds.
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          HackEasy uses AI to generate winning hackathon ideas tailored to your track, judging type, and rubric.
          Each idea is scored. Save the best ones. Get instant build guides. Ship with confidence.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href="/dashboard" className="btn-primary text-base px-8 py-3 inline-block">
            Generate Ideas &rarr;
          </a>
          <button onClick={() => toast.success('Configure \u2192 Generate \u2192 Save & Compare \u2192 Build \u2192 Ship & Win')} className="btn-outline text-base px-8 py-3">
            How It Works
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">Free to use. No account needed. Powered by HackAI or your own API key.</p>
      </div>
    </section>
  )
}

function StatsBar() {
  return (
    <div className="border-y border-gray-800 bg-[rgb(30,41,59)]/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-3 gap-8">
        {[
          { value: '10', label: 'Categories' },
          { value: 'AI', label: 'Powered Ideas' },
          { value: '0', label: 'Account Needed' },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-bold font-mono text-[#8A61FF]">{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc, cta, idx }) {
  return (
    <div
      className="glass-card p-6 group cursor-default"
      style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s forwards` }}
    >
      <div className="w-10 h-10 rounded-lg bg-[#8A61FF]/10 border border-[#8A61FF]/20 flex items-center justify-center mb-4 group-hover:bg-[#8A61FF]/20 transition-colors">
        <svg className="w-5 h-5 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">{desc}</p>
      <span className="text-xs text-[#8A61FF] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        {cta} &rarr;
      </span>
    </div>
  )
}

function TestimonialCard({ quote, author, role, idx }) {
  return (
    <div
      className="glass-card p-6"
      style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.15}s forwards` }}
    >
      <svg className="w-6 h-6 text-[#8A61FF]/30 mb-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
      </svg>
      <p className="text-sm text-gray-300 leading-relaxed mb-4">{quote}</p>
      <div>
        <p className="text-sm font-semibold">{author}</p>
        <p className="text-xs text-[#8A61FF]">{role}</p>
      </div>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">Your idea generator</h2>
        <p className="text-gray-400 max-w-xl mx-auto">Go from blank page to winning idea in seconds. Let the AI do the brainstorming.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <FeatureCard key={i} {...f} idx={i} />
        ))}
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">How it works</h2>
        <p className="text-gray-400 max-w-xl mx-auto">Five steps from blank page to shipping your winning project.</p>
      </div>
      <div className="grid md:grid-cols-5 gap-4">
        {STEPS.map((step, i) => (
          <div key={i} className="glass-card p-5 relative" style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s forwards` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#8A61FF]/10 border border-[#8A61FF]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold font-mono text-[#8A61FF]">{step.num}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block flex-1 h-px bg-gray-700" />
              )}
            </div>
            <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold font-mono mb-4">Built with winners</h2>
        <p className="text-gray-400">Teams who used HackEasy to find their winning idea and ship it.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard key={i} {...t} idx={i} />
        ))}
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section id="cta" className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="glass-card p-12 glow">
        <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">Your winning idea starts here</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">Generate ideas. Save the best ones. Get build guides. Ship with confidence.</p>
        <a href="/dashboard" className="btn-primary text-base px-8 py-3 inline-block">
          Generate Ideas &rarr;
        </a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-gray-800 px-4 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#8A61FF]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="font-bold font-mono">HackEasy</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span>AI-powered idea generation for hackers who win.</span>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <>
      <Head>
        <title>HackEasy - AI Idea Generator for Hackathons</title>
        <meta name="description" content="Generate winning hackathon ideas with AI. Tailored to your track, judging type, and rubric. Scores, saving, and instant build guides." />
      </Head>
      <div className="grid-bg min-h-screen">
        <NavBar />
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </div>
    </>
  )
}
