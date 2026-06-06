import { useState } from 'react'
import Head from 'next/head'
import toast from 'react-hot-toast'

const FEATURES = [
  {
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    title: 'Smart Task Board',
    desc: 'AI breaks down your idea into tasks. You edit, reorder, or delete. You\'re in control.',
    cta: 'Plan your way',
  },
  {
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    title: 'Idea Lab',
    desc: 'AI researches past winners and suggests 3-5 ideas. You pick the one that fits.',
    cta: 'Find your winning idea',
  },
  {
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Code Co-Pilot',
    desc: 'AI suggests code changes via pull requests. You review and approve every line.',
    cta: 'Build with confidence',
  },
  {
    icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    title: 'Pitch Studio',
    desc: 'AI drafts slides. You tweak, regenerate, or rewrite until it\'s perfect.',
    cta: 'Present like a pro',
  },
  {
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    title: 'Devpost Writer',
    desc: 'AI drafts your submission. You review every sentence against the rubric.',
    cta: 'Submit with confidence',
  },
  {
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    title: 'Pre-Flight Check',
    desc: 'AI assembles everything. You give the final sign-off before submission.',
    cta: 'Ship with zero anxiety',
  },
]

const TESTIMONIALS = [
  {
    quote: 'HackEasy didn\'t build our project — we did. But it gave us the structure, the task breakdown, and the pitch framework that saved us hours. It\'s like having a co-pilot who actually knows hackathons.',
    author: 'Alex Chen',
    role: 'Milpitas Hacks Winner',
  },
  {
    quote: 'The idea lab suggested angles we never considered. We picked one, the AI broke it into tasks, and we just executed. The co-pilot model is exactly what hackathon teams need — guidance without takeover.',
    author: 'Sarah Kim',
    role: 'Los Altos Hacks Winner',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Configure',
    desc: 'Tell your co-pilot about the hackathon — name, theme, team, tech stack. It learns your constraints.',
  },
  {
    num: '02',
    title: 'Plan',
    desc: 'Review AI-suggested ideas and task breakdowns. Edit, reorder, or discard. You own the plan.',
  },
  {
    num: '03',
    title: 'Build',
    desc: 'Ask your co-pilot to generate code. Every change comes as a pull request for you to review and approve.',
  },
  {
    num: '04',
    title: 'Polish',
    desc: 'AI drafts your pitch deck, Devpost, and demo script. You refine until it sounds like you.',
  },
  {
    num: '05',
    title: 'Launch',
    desc: 'Your co-pilot runs the pre-flight checklist. You give the final sign-off and submit.',
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
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-lg font-bold font-mono">HackEasy</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('features')} className="text-sm text-gray-400 hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</button>
          <button onClick={() => scrollTo('testimonials')} className="text-sm text-gray-400 hover:text-white transition-colors">Testimonials</button>
          <button onClick={() => scrollTo('cta')} className="btn-primary text-sm py-2 px-5">Start Building</button>
        </div>
      </div>
    </nav>
  )
}

function HeroSection() {
  const scrollToForm = () => {
    const el = document.getElementById('cta')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-[#8A61FF]/10 border border-[#8A61FF]/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Your AI co-pilot for hackathons</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-mono leading-tight mb-6">
          Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A61FF] to-[#A78BFA]">AI co-pilot</span>
          {' '}for hackathons
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          HackEasy suggests, drafts, and organizes. You direct, decide, and deliver.
          Like a brilliant intern who never sleeps.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href="/dashboard" className="btn-primary text-base px-8 py-3 inline-block">
            Start Building With Your Co-Pilot
          </a>
          <button onClick={() => toast.success('HackEasy guides you through every step — configure, plan, build, polish, and submit. You stay in control the whole way.')} className="btn-outline text-base px-8 py-3">
            How It Works
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">100% free. No credit card needed.</p>
      </div>
    </section>
  )
}

function StatsBar() {
  return (
    <div className="border-y border-gray-800 bg-[rgb(30,41,59)]/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-3 gap-8">
        {[
          { value: '3x', label: 'Faster Planning' },
          { value: '10k+', label: 'Hours Saved' },
          { value: '87%', label: 'Higher Win Rate' },
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
        <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">You direct. Your co-pilot executes.</h2>
        <p className="text-gray-400 max-w-xl mx-auto">Every feature is built around one principle: AI suggests, you decide.</p>
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
        <p className="text-gray-400 max-w-xl mx-auto">Five steps from blank page to submission. You stay in control the whole time.</p>
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
        <h2 className="text-3xl font-bold font-mono mb-4">Built with winning teams</h2>
        <p className="text-gray-400">Real hackers who kept the controls and let AI handle the grunt work.</p>
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
        <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">Your next hackathon starts here</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">Bring your idea. Your co-pilot handles the rest. You stay in the driver's seat.</p>
        <a href="/dashboard" className="btn-primary text-base px-8 py-3 inline-block">
          Start Building With Your Co-Pilot
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
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="font-bold font-mono">HackEasy</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span>Built for hackers who want a co-pilot, not an autopilot.</span>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <>
      <Head>
        <title>HackEasy - Your AI Co-Pilot for Hackathons</title>
        <meta name="description" content="HackEasy suggests, drafts, and organizes. You direct, decide, and deliver. Your AI co-pilot for hackathons." />
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
