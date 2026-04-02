# Homework Guru

## Stack
- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Firebase Auth + Firestore
- Groq API for vision/chat
- KaTeX for math rendering

## Purpose
- Socratic AI homework tutor
- Never give direct answers
- Students upload homework images and work problem-by-problem with the guru
- Live on Vercel

## Core rules
- Never provide direct answers in guru flows.
- Keep the Socratic behavior intact unless explicitly asked to change it.
- Use "guru" in user-facing text, not "tutor".
- Keep changes minimal and localized.
- Follow existing patterns before adding abstractions.
- Preserve current auth, session, and streaming behavior unless requested.

## Architecture
- `src/app/api/parse-homework/route.ts` parses homework images into problems.
- `src/app/api/tutor/route.ts` handles streaming Socratic chat.
- `src/app/api/worked-solution/route.ts` generates worked solutions after completion.
- Firestore stores user sessions under `users/{uid}/sessions/{sessionId}`.
- Images are stored in Firestore as compressed base64 data URLs.

## Important behavior
- `tutor` responses use sentinels including `[[SOLVED]]` and token markers.
- Demo mode uses anonymous Firebase auth and sample onboarding.
- Problem chats are tied to `sessionId` and `problemIndex`.
- Keep terminology and flow consistent across app pages.

## Key paths
- `src/app/api/*` for server routes
- `src/app/session/[sessionId]/problem/[problemIndex]` for problem chat
- `src/contexts/AuthContext.tsx` for auth state
- `src/contexts/SessionContext.tsx` for active session state
- `src/lib/firebase.ts` for Firebase setup
- `src/lib/groq.ts` for Groq setup
- `src/lib/types/index.ts` for shared types

## Guardrails
- Ask before changing guru/Socratic rules.
- Ask before changing Firestore schema or storage strategy.
- Ask before changing auth flows.
- Ask before changing Vercel deployment behavior or environment variable usage.
- Ask before changing demo onboarding behavior.

## Validation
- Test auth-required flows and demo mode separately.
- Test streaming chat after modifying tutor logic.
- Test image parsing when changing upload or parse flows.
- Run build and type checks before finishing.