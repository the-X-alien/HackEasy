"""
CodeAgent - Generates full-stack hackathon project code.

Creates a Next.js + Tailwind CSS project with Prisma (SQLite), NextAuth.js,
and pre-built pages/components. Also supports hardware project scaffolding.
"""

import json
import logging
import os
import subprocess
import sys
import tempfile
from pathlib import Path

logger = logging.getLogger("hackeasy.code_agent")

NEXTJS_TEMPLATE_FILES = {
    "package.json": {
        "name": "hackeasy-project",
        "version": "0.1.0",
        "private": True,
        "scripts": {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "test": "jest",
            "lint": "next lint",
        },
        "dependencies": {
            "next": "^14.2.0",
            "react": "^18.3.0",
            "react-dom": "^18.3.0",
            "@prisma/client": "^5.14.0",
            "next-auth": "^4.24.0",
            "tailwindcss": "^3.4.0",
            "autoprefixer": "^10.4.0",
            "postcss": "^8.4.0",
        },
        "devDependencies": {
            "typescript": "^5.4.0",
            "@types/react": "^18.3.0",
            "@types/node": "^20.12.0",
            "prisma": "^5.14.0",
            "jest": "^29.7.0",
            "@testing-library/react": "^15.0.0",
            "ts-jest": "^29.1.0",
        },
    },
    "tsconfig.json": {
        "compilerOptions": {
            "target": "es2017",
            "lib": ["dom", "dom.iterable", "esnext"],
            "allowJs": True,
            "skipLibCheck": True,
            "strict": True,
            "noEmit": True,
            "esModuleInterop": True,
            "module": "esnext",
            "moduleResolution": "bundler",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "jsx": "preserve",
            "incremental": True,
            "plugins": [{"name": "next"}],
            "paths": {"@/*": ["./src/*"]},
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"],
    },
    "next.config.js": "/* @type {import('next').NextConfig} */\nconst nextConfig = {\n  reactStrictMode: true,\n};\nmodule.exports = nextConfig;\n",
    "tailwind.config.js": "/* @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ['./src/**/*.{js,ts,jsx,tsx}'],\n  theme: { extend: {} },\n  plugins: [],\n};\n",
    "postcss.config.js": "module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n",
    ".env.local": "DATABASE_URL=\"file:./dev.db\"\nGITHUB_ID=\nGITHUB_SECRET=\nNEXTAUTH_SECRET=change-me-in-production\nNEXTAUTH_URL=http://localhost:3000\n",
    "prisma/schema.prisma": """generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String?
  email     String?  @unique
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  title       String
  description String
  techStack   String   // JSON array stored as string
  repoUrl     String?
  demoUrl     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
}
""",
}

PAGE_TEMPLATES = {
    "src/pages/_app.tsx": """import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
""",
    "src/pages/index.tsx": """import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FeatureCard from '@/components/FeatureCard'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>HackEasy - Project</title>
        <meta name="description" content="Built with HackEasy" />
      </Head>
      <Header />
      <main className="flex-1">
        <section className="py-20 px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Your Hackathon Project</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built in 24 hours with AI-powered development
          </p>
        </section>
        <section className="py-12 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard title="AI-Powered" description="Leveraging cutting-edge AI to solve real problems" />
          <FeatureCard title="Impact First" description="Designed to make a measurable difference" />
          <FeatureCard title="Demo Ready" description="Fully functional prototype ready to present" />
        </section>
      </main>
      <Footer />
    </div>
  )
}
""",
    "src/pages/api/auth/[...nextauth].ts": """import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
})
""",
    "src/pages/api/hello.ts": """import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string
  timestamp: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({
    message: 'Hello from HackEasy!',
    timestamp: new Date().toISOString(),
  })
}
""",
}

COMPONENT_TEMPLATES = {
    "src/components/Header.tsx": """import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          HackEasy
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
          <Link href="/demo" className="text-sm text-gray-600 hover:text-gray-900">Demo</Link>
          <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">About</Link>
          {session ? (
            <button onClick={() => signOut()} className="text-sm text-gray-600">
              Sign Out
            </button>
          ) : (
            <button onClick={() => signIn()} className="text-sm text-gray-600">
              Sign In
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}
""",
    "src/components/Footer.tsx": """export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8 px-4 text-center text-sm text-gray-500">
      <p>Built with HackEasy - AI-Powered Hackathon Development</p>
    </footer>
  )
}
""",
    "src/components/FeatureCard.tsx": """interface FeatureCardProps {
  title: string
  description: string
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
""",
    "src/components/DemoVideo.tsx": """interface DemoVideoProps {
  src: string
  title?: string
}

export default function DemoVideo({ src, title = 'Demo Video' }: DemoVideoProps) {
  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
      <video
        className="w-full h-full object-cover"
        src={src}
        title={title}
        controls
        autoPlay={false}
      />
    </div>
  )
}
""",
}

LIB_TEMPLATES = {
    "src/lib/prisma.ts": """import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
""",
}

STYLE_TEMPLATES = {
    "src/styles/globals.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
""",
}

TEST_TEMPLATES = {
    "src/__tests__/index.test.tsx": """import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Home page', () => {
  it('renders the heading', () => {
    render(<Home />)
    expect(screen.getByText('Your Hackathon Project')).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(<Home />)
    expect(screen.getByText('AI-Powered')).toBeInTheDocument()
    expect(screen.getByText('Impact First')).toBeInTheDocument()
    expect(screen.getByText('Demo Ready')).toBeInTheDocument()
  })
})
""",
    "src/__tests__/api/hello.test.ts": """import { createMocks } from 'node-mocks-http'
import handler from '../pages/api/hello'

describe('/api/hello', () => {
  it('returns a greeting', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('message')
    expect(data).toHaveProperty('timestamp')
  })
})
""",
    "src/__tests__/components/FeatureCard.test.tsx": """import { render, screen } from '@testing-library/react'
import FeatureCard from '../../components/FeatureCard'

describe('FeatureCard', () => {
  it('renders title and description', () => {
    render(<FeatureCard title="Test Title" description="Test Description" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })
})
""",
}

JEST_CONFIG = {
    "jest.config.js": """const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  setupFilesAfterSetup: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
""",
    "jest.setup.js": "import '@testing-library/jest-dom'\n",
}

ALL_TEMPLATES = {
    **NEXTJS_TEMPLATE_FILES,
    **PAGE_TEMPLATES,
    **COMPONENT_TEMPLATES,
    **LIB_TEMPLATES,
    **STYLE_TEMPLATES,
    **TEST_TEMPLATES,
    **JEST_CONFIG,
}


class CodeAgent:
    """Generates full-stack hackathon project code."""

    def __init__(self, ai_client=None):
        self.ai = ai_client

    async def generate(
        self,
        idea: dict,
        tech_stack: list[str] | None = None,
        duration_hours: float = 24,
    ) -> str:
        """Generate a complete Next.js project. Returns the project directory path."""
        project_dir = Path(tempfile.mkdtemp(suffix="_hackeasy"))
        logger.info("Generating project in %s", project_dir)

        self._write_structure(project_dir)
        self._write_pages(project_dir)
        self._write_components(project_dir)
        self._write_lib(project_dir)
        self._write_styles(project_dir)
        self._write_tests(project_dir)
        self._write_jest_config(project_dir)

        readme = self._generate_readme(idea, tech_stack)
        (project_dir / "README.md").write_text(readme, encoding="utf-8")

        custom_code = await self._generate_custom_code(idea, tech_stack)
        if custom_code:
            custom_dir = project_dir / "src" / "custom"
            custom_dir.mkdir(parents=True, exist_ok=True)
            (custom_dir / "app.py").write_text(custom_code, encoding="utf-8")

        logger.info("Project generated at %s", project_dir)
        return str(project_dir)

    def _write_structure(self, base: Path) -> None:
        dirs = [
            "src/pages/api/auth",
            "src/components",
            "src/lib",
            "src/styles",
            "src/__tests__/api",
            "src/__tests__/components",
            "prisma",
            "public",
        ]
        for d in dirs:
            (base / d).mkdir(parents=True, exist_ok=True)

        for path, content in NEXTJS_TEMPLATE_FILES.items():
            full_path = base / path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            if isinstance(content, dict):
                full_path.write_text(json.dumps(content, indent=2), encoding="utf-8")
            else:
                full_path.write_text(content, encoding="utf-8")

    def _write_pages(self, base: Path) -> None:
        for path, content in PAGE_TEMPLATES.items():
            full_path = base / path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")

    def _write_components(self, base: Path) -> None:
        for path, content in COMPONENT_TEMPLATES.items():
            full_path = base / path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")

    def _write_lib(self, base: Path) -> None:
        for path, content in LIB_TEMPLATES.items():
            full_path = base / path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")

    def _write_styles(self, base: Path) -> None:
        for path, content in STYLE_TEMPLATES.items():
            full_path = base / path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")

    def _write_tests(self, base: Path) -> None:
        for path, content in TEST_TEMPLATES.items():
            full_path = base / path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")

    def _write_jest_config(self, base: Path) -> None:
        for path, content in JEST_CONFIG.items():
            full_path = base / path
            full_path.write_text(content, encoding="utf-8")

    def _generate_readme(self, idea: dict, tech_stack: list[str] | None) -> str:
        return f"""# {idea.get('problem_statement', 'Hackathon Project')}

Built with **HackEasy** — AI-powered hackathon development.

## Problem
{idea.get('problem_statement', 'TBD')}

## Target Users
{idea.get('target_user', 'TBD')}

## How It Works
1. **Before:** {idea.get('workflow_before', 'Manual process')}
2. **AI Step:** {idea.get('ai_step', 'AI automation')}
3. **Demo:** {idea.get('demo_flow', 'Live demo')}

## Tech Stack
{', '.join(tech_stack or idea.get('tech_stack', ['Next.js', 'TypeScript', 'Tailwind CSS']))}

## Getting Started

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```
"""

    async def _generate_custom_code(self, idea: dict, tech_stack: list[str] | None) -> str:
        """Optionally generate AI-powered custom code based on the idea."""
        if not self.ai:
            return ""

        prompt = (
            f"Write the core Python logic file for a hackathon project. "
            f"Project idea: {idea.get('problem_statement', '')}\n"
            f"AI step: {idea.get('ai_step', '')}\n"
            f"Tech: {tech_stack or idea.get('tech_stack', [])}\n\n"
            f"Return ONLY the Python code, no explanations."
        )
        try:
            return str(await self.ai.chat(prompt))
        except Exception as e:
            logger.warning("Custom code generation failed: %s", e)
            return ""

    def generate_hardware(self, idea: dict) -> str:
        """Generate hardware project scaffolding (Arduino sketch, KiCad placeholder)."""
        project_dir = Path(tempfile.mkdtemp(suffix="_hackeasy_hw"))
        logger.info("Generating hardware project in %s", project_dir)

        hw_dir = project_dir / "hardware"
        fw_dir = project_dir / "firmware"
        hw_dir.mkdir(parents=True, exist_ok=True)
        fw_dir.mkdir(parents=True, exist_ok=True)

        (fw_dir / "sketch.ino").write_text(
            f"// {idea.get('problem_statement', 'Hardware Project')}\n"
            f"// Generated by HackEasy\n\n"
            f"void setup() {{\n"
            f"  Serial.begin(9600);\n"
            f"  // Initialize hardware here\n"
            f"}}\n\n"
            f"void loop() {{\n"
            f"  // Main logic here\n"
            f"  delay(100);\n"
            f"}}\n",
            encoding="utf-8",
        )

        (hw_dir / "README.md").write_text(
            f"# Hardware Design\n\n"
            f"PCB design files for: {idea.get('problem_statement', '')}\n\n"
            f"Open `board.kicad_pcb` in KiCad 8+ to view the layout.",
            encoding="utf-8",
        )

        return str(project_dir)
