# HOP: Hackathon Optimization Protocol

## Core Principle: The T/4 Rule

You have T hours. You must have a working demo in T/4 hours. The remaining 3T/4 is for polish, pitch, and backup.

## Duration-Specific MVP Tiers

### 1-Hour Sprint
- No database. No auth. Single HTML page. Copy-paste deploy.
- Demo: Static UI walkthrough. Judges see design + idea only.

### 2-Hour Blitz
- Static landing page with mock data. Single API call to AI model.
- Demo: Show the page, click one button, show AI response.

### 4-Hour Mini
- Single-page React app. One API route. SQLite (file-based).
- Demo: User enters input, sees AI output, sees a result visualization.

### 8-Hour Standard
- Full Next.js app. 2-3 pages. Prisma + SQLite. NextAuth (GitHub OAuth).
- Demo: User logs in, performs core action, sees personalized result.

### 12-Hour Extended
- Multi-page app. 3-5 API routes. Background jobs. Email notifications.
- Demo: Full user journey with loading states and error handling.

### 24-Hour Full
- Complete full-stack app. User accounts. Dashboard. Data visualization.
- Demo: Login -> Create -> Process -> View Results -> Share.

### 36-48 Hour Mega
- Everything above + real-time features, WebSockets, file uploads, CI/CD pipeline.
- Demo: Polished, multi-step walkthrough with edge cases handled.

## The MVP Cascade

For any duration, use this cascade:
1. Can I describe the core loop in 1 sentence? (30 seconds)
2. Can I sketch the main UI screen? (5 minutes)
3. Can I hardcode a single successful response? (15 minutes)
4. Can I connect the AI model? (30 minutes)
5. Can I make one full user flow work? (T/4 hours)
6. Can I add the second screen? (T/2 hours)
7. Can I polish and add animations? (3T/4 hours)

## Scope Reduction Rules

When running out of time, cut in this order (never reverse):
1. User accounts / auth
2. Database persistence
3. Edge cases and error handling
4. Animations and polish
5. Second user flow
6. Settings pages
7. Mobile responsiveness
8. THE CORE DEMO (never cut this)

## Tech Stack by Duration

| Duration | Frontend | Backend | Database | Auth | Deploy |
|---|---|---|---|---|---|
| 1-2h | HTML + Tailwind CDN | None | None | None | GitHub Pages |
| 4h | React (Vite) | Next.js API | SQLite | None | Vercel |
| 8h | Next.js + Tailwind | Next.js API | Prisma + SQLite | NextAuth | Vercel |
| 12h+ | Next.js + Tailwind + shadcn | Next.js + tRPC | Prisma + PostgreSQL | NextAuth | Vercel + Railway |

## The Demo Golden Path

Every demo must follow this exact sequence:
1. "Here's the problem" (10 seconds)
2. "This is our solution" (10 seconds)
3. "Watch me use it" (60-90 seconds - the actual demo)
4. "Here's the result" (10 seconds)
5. "Here's the impact" (20 seconds)
6. "What's next" (10 seconds)
Total: 2-3 minutes max
