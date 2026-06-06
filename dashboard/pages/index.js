import { useState } from 'react'
import Head from 'next/head'
import toast from 'react-hot-toast'

const FEATURES = [
  {
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    title: 'Project Split Board',
    desc: 'Break down your project into tasks automatically. Get warnings when you\'re running out of time.',
    cta: 'Stop wasting hours planning',
  },
  {
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    title: 'AI Idea Generator',
    desc: 'Generate winning hackathon ideas based on what actually works. Learn from past winners.',
    cta: 'Build on proven ideas',
  },
  {
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Timeline Builder',
    desc: 'Auto-schedule your coding, testing, and polish time. Set alarms so you never miss submission.',
    cta: 'Stay on track',
  },
  {
    icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    title: 'Pitch Generator',
    desc: 'Generate your elevator pitch, demo script, and judge talking points instantly.',
    cta: 'Win judges over fast',
  },
  {
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    title: 'Auto Devpost Writer',
    desc: 'Complete Devpost submissions in minutes. Description, tech stack, challenges - all done.',
    cta: 'No more last-minute panic',
  },
  {
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    title: 'Slideshow Creator',
    desc: 'Clean, professional slides in seconds. Problem, solution, demo - ready to present.',
    cta: 'Look polished instantly',
  },
]

const TESTIMONIALS = [
  {
    quote: 'HackEasy helped us organize our project in minutes instead of hours. The timeline builder alone saved us from missing the submission deadline.',
    author: 'Alex Chen',
    role: 'Milpitas Hacks Winner',
  },
  {
    quote: 'The pitch generator gave us a framework that the judges loved. We went from scattered ideas to a polished presentation in under an hour.',
    author: 'Sarah Kim',
    role: 'Los Altos Hacks Winner',
  },
]

const BENEFITS = [
  { title: 'Build faster', desc: 'AI-powered planning cuts prep time by 70%' },
  { title: 'Present better', desc: 'Generate winning pitches and demos' },
  { title: 'Look professional', desc: 'Polished slides and Devpost in minutes' },
  { title: 'Stay organized', desc: 'Auto-scheduling keeps your team on track' },
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
      <div className="text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-[#8A61FF]/10 border border-[#8A61FF]/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">AI-powered hackathon toolkit</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-mono leading-tight mb-6">
          Win hackathons with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A61FF] to-[#A78BFA]">less stress</span>
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          AI-powered tools to plan faster, pitch better, and polish everything. Built for teams who want to win.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button onClick={scrollToForm} className="btn-primary text-base px-8 py-3">
            Start Building
          </button>
          <button onClick={() => toast.success('HackEasy uses AI to help you plan, build, and present winning hackathon projects. Generate ideas, create timelines, write pitches, and more!')} className="btn-outline text-base px-8 py-3">
            See How It Works
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
          { value: '3x', label: 'Faster planning' },
          { value: '0h', label: 'hours saved', sub: '(just launched)' },
          { value: '0%', label: 'Higher Chances of Winning', sub: '(placeholder)' },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-bold font-mono text-[#8A61FF]">{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            {stat.sub && <div className="text-xs text-gray-600 mt-0.5">{stat.sub}</div>}
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
        <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">Everything you need to win</h2>
        <p className="text-gray-400 max-w-xl mx-auto">AI-powered tools that handle the planning so you can focus on building.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <FeatureCard key={i} {...f} idx={i} />
        ))}
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold font-mono mb-4">Used by winning teams</h2>
        <p className="text-gray-400">See what hackathon winners have to say.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard key={i} {...t} idx={i} />
        ))}
      </div>
    </section>
  )
}

function BenefitsGrid() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-20">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BENEFITS.map((b, i) => (
          <div key={i} className="glass-card p-5 text-center" style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.1}s forwards` }}>
            <div className="w-8 h-8 rounded-full bg-[#8A61FF]/10 border border-[#8A61FF]/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-4 h-4 text-[#8A61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold mb-1">{b.title}</h3>
            <p className="text-xs text-gray-400">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section id="cta" className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="glass-card p-12 glow">
        <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">Start your next hackathon strong</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">From idea generation to submission, HackEasy helps you build better projects faster.</p>
        <a href="/dashboard" className="btn-primary text-base px-8 py-3 inline-block">
          Start Building
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
          <span>Built for hackathon teams.</span>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <>
      <Head>
        <title>HackEasy - Win Hackathons With Less Stress</title>
        <meta name="description" content="AI-powered hackathon tools to plan, build, and present winning projects." />
      </Head>
      <div className="grid-bg min-h-screen">
        <NavBar />
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <TestimonialsSection />
        <BenefitsGrid />
        <CTASection />
        <Footer />
      </div>
    </>
  )
}
