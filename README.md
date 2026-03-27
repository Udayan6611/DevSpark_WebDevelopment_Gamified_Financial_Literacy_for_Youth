# FinPath

FinPath is a gamified financial literacy web app built with Next.js App Router, Tailwind CSS, Zustand, Recharts, and Lucide icons.

## Current Architecture

- Frontend: Next.js 16 + React + TypeScript
- Auth: JWT (HttpOnly cookie) via API routes
- User data: Supabase (primary) with local JSON fallback for local dev
- AI quizzes: Groq API through server route with local procedural fallback
- State: Zustand for client-side gameplay and UI state

## Core Features

- Learning map with progressive module unlocks
- Standard quizzes and challenge mode
- Wallet simulation with random life events
- Analytics dashboard with module scores
- Dynamic leaderboard
- Profile with auto-unlocking achievements
- Daily streak logic based on calendar day

## Authentication

Auth is API-driven and server validated.

- Signup: /api/auth/signup
- Login: /api/auth/login
- Session check: /api/auth/me
- Logout: /api/auth/logout

JWT is stored in an HttpOnly cookie.

## Data Persistence

Primary (for hosting):

- Supabase table public.users

Local fallback (for development only):

- data/users.json

## AI Question Generation

Challenge mode uses this flow:

1. Calls /api/groq-quiz
2. Server requests Groq model
3. If unavailable, app falls back to local generator in lib/questionGenerator.ts

## Environment Variables

Set these in local env and hosting platform.

- GROQ_API_KEY
- JWT_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

## Local Development

1. Install dependencies:

npm install

2. Run dev server:

npm run dev

3. Build check:

npm run build

## Free Hosting (Recommended)

Use Vercel + Supabase.

1. Create Supabase project.
2. Run SQL from supabase/schema.sql.
3. Push project to GitHub.
4. Import repo in Vercel.
5. Add the four environment variables in Vercel.
6. Deploy.

## Supabase Schema

Apply:

- supabase/schema.sql

This creates the users table used by auth/profile/leaderboard APIs.

## Important Security Note

If any API key was committed accidentally, rotate it immediately before production deployment.

## Project Structure

- app/: pages and API routes
- components/: UI components
- lib/: generators and server helpers
- store/: Zustand global state
- supabase/: SQL schema
- data/: local dev fallback storage
