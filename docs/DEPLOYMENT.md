# Deployment

## Platforms

- **Backend**: Render (Node.js/Express/TypeScript service)
- **Frontend**: Vercel (React/Vite static build) — already deployed at
  huddle-demo-sprint.vercel.app
- **Database**: Supabase (Postgres)

## Render configuration

Set in Render's dashboard, per service:

| Setting | Value |
|---|---|
| Root directory | `backend` (matches what's actually in the repo — confirm Render's setting matches, given earlier confusion between "backend" and "server") |
| Build command | `npm run build` |
| Start command | `npm start` |
| Health check path | `/api/health` |
| Environment variables | See `ENV_VARS.md` — DATABASE_URL, JWT_SECRET, PORT |
| Auto-deploy | On push to `main` (confirmed with infra teammate) |

## Deployment flow

1. PR merged into `main`
2. Render detects the push automatically, pulls latest `main`, runs the build
   command
3. If build succeeds and the `/api/health` check passes, Render routes traffic to
   the new version (zero-downtime by default)
4. If the build fails, the previous version keeps running — Render does not
   take a broken build live

This means the GitHub Actions CI (`ci.yml`) and Render's own build are two
separate checks: CI catches problems *before* merge, Render's build is a second
check at deploy time. Belt and suspenders, not redundant.

## Preview/staging deployments

**Frontend (Vercel) — verified, not just assumed:** confirmed directly with frontend
engineer — Git repository connected, preview deployments enabled, auto-deploy from
`main` working, production URL live at huddle-demo-sprint.vercel.app. Every PR
against the frontend gets a real preview URL to review before merging.

**Backend (Render) — real limitation, still applies:** free/Hobby tier ($0, confirmed
with infra) does not include preview deployments per-PR. Testing before merge relies
on: local `npm run dev` testing + CI's build/type-check (and tests, once they exist),
not a live preview URL.

## Rollback

See `ROLLBACK_PROCESS.md`.

## Release process

See `RELEASE_PROCESS.md`.
