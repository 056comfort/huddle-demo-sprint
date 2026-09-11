# Repository Structure

## Current layout

Frontend already lives at the repo root (established first, before backend/infra
existed) — `src/`, `public/`, `package.json`, `vite.config.js`, etc.

## Recommended going forward

Rather than restructuring the existing frontend (disruptive, rewrites history/paths
for work already merged), add backend alongside it in its own folder:

```
huddle-demo-sprint/
├── src/                  # frontend (existing, unchanged)
├── public/               # frontend (existing, unchanged)
├── backend/              # NEW - all backend code goes here
│   ├── src/
│   ├── package.json      # backend's own dependencies, separate from frontend's
│   └── Dockerfile         # only if Render is configured for Docker deploys
├── sql/                  # RLS policies, migrations (already exists)
├── docs/                 # this folder - CI/CD, deployment, process docs
├── .github/workflows/    # CI pipeline definitions
├── ENV_VARS.md
├── README-secrets-setup.md
├── cors-example.js
├── .env.example
└── .gitignore
```

## Why this shape

- Two `package.json` files (root = frontend, `backend/` = backend) means each side's
  dependencies, scripts, and lint config stay independent — no risk of a frontend
  `npm install` pulling in backend packages or vice versa.
- Render and Vercel can each be pointed at their own subfolder as the build root,
  so deploys stay isolated per service.
- CI workflow (see `.github/workflows/ci.yml`) runs frontend and backend as separate
  jobs, matching this split — a backend-only change doesn't trigger a frontend
  rebuild and vice versa.

## Action needed

Backend engineer's code isn't in the repo yet. Once it's added, it should land in
`backend/` per this structure — flag this to them before they push, so it doesn't
land at the root and collide with frontend's files.
