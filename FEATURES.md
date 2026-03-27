# FinPath Feature Status

This file reflects the current implementation.

## Implemented

### Product

- Multi-view app shell (map, analytics, challenge, leaderboard, profile)
- Mobile responsive dark UI
- Module progression flow and quiz results
- Life event modal with wallet impact

### Authentication and Session

- JWT signup/login/logout/me endpoints
- HttpOnly cookie session handling
- Client session bootstrap on app load

### Persistence

- Supabase-backed user storage when configured
- Local JSON fallback for local development
- Server profile sync endpoint

### Quiz Systems

- Standard module quizzes (static bank)
- Challenge mode (dynamic generation)
- Groq-backed generation route with strict JSON parsing
- Local procedural generation fallback

### Analytics and Progress

- Score tracking per module
- Analytics dashboard with chart
- Recommendation card based on low-score category

### Leaderboard

- Server leaderboard endpoint
- Ranking by XP, quiz count, then streak
- Current user rank highlighting

### Achievements

Auto-unlock rules are now active:

- first_quiz
- perfect_score
- module_master
- streak_7
- level_5
- wallet_1000
- challenge_master
- knowledge_seeker

### Streak Logic

- Day-based streak tracking via lastActiveDate
- Same-day quizzes do not inflate streak
- Missing a day resets streak

## API Routes

- /api/auth/signup
- /api/auth/login
- /api/auth/me
- /api/auth/logout
- /api/user/profile
- /api/leaderboard
- /api/groq-quiz

## Environment Requirements

Required for full cloud mode:

- JWT_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GROQ_API_KEY (optional but recommended for live AI generation)

## Hosting Readiness

Project is ready for free hosting with Vercel + Supabase.

Setup reference:

- supabase/schema.sql
- README.md

## Known Notes

- If Supabase env vars are missing, app falls back to local JSON file.
- If Groq key is missing/unavailable, challenge mode falls back to local generator.
