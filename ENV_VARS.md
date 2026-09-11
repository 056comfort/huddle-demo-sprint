# Huddle — Environment Variables Reference

Single source of truth so nobody's guessing during integration. Update this the moment
something changes — a stale copy here is worse than none.

Hosting: **Render** (backend) + **Supabase** (Postgres DB), both us-east-1 / N. Virginia.
(Not AWS ECS/Terraform — that earlier plan was superseded once infra confirmed the actual stack.)

## Backend (Node.js / Express / TypeScript, port 5000)

Set these directly in Render → your service → Environment tab. Not committed to the repo,
not in a Dockerfile — Render injects them at runtime.

| Variable      | Value                                              | Notes                                    |
|---------------|-----------------------------------------------------|--------------------------------------------|
| DATABASE_URL  | Supabase connection string                          | **Password was rotated after being shared in plaintext — get the current value from Supabase dashboard, not from chat history.** |
| JWT_SECRET    | Random 32+ char string                              | Generate once, paste into Render's UI. Any value works locally; keep the deployed one different from anyone's local hardcoded value. |
| PORT          | 5000                                                 | Confirm Render's service settings match — Render often auto-detects this, but check it's not defaulting to something else. |

Local dev (`npm run dev`): backend engineer uses their own local `.env` with their own
local DATABASE_URL/JWT_SECRET — never the real Render/Supabase values.

Health check route: `GET /api/health` — set this in Render → service → Settings → Health Check Path.
Container start command: `npm start` (after Render runs `npm run build`) — set as the Start
Command in Render's service settings, or Render may auto-detect this from `package.json`.

## Frontend (React + Vite, static build)

| Variable        | Value                                     | Notes                          |
|-----------------|--------------------------------------------|---------------------------------|
| VITE_API_URL    | `https://<your-render-service>.onrender.com` | Set in Vercel's Environment Variables UI — static build bakes it in at build time. Get the real Render URL once the service is live. |

Deployed at: huddle-demo-sprint.vercel.app

## CORS

Backend must allow `https://huddle-demo-sprint.vercel.app` (deployed) and
`https://huddle-demo-sprint.onrender.com` (local frontend dev). See `cors-example.js` — unaffected by the
Render/Supabase change, still applies as-is.

## When something breaks during integration

1. Check Render's dashboard → service → Logs (real-time, no CLI setup needed)
2. Check Render's service status — is it "Live" or crash-looping on deploy?
3. Check Supabase dashboard → Database → confirm the DB is reachable and not paused
   (Supabase free tier can pause inactive projects — worth checking first if "nothing works")
4. Confirm env vars in Render's dashboard match this doc exactly — a typo'd var name is a
   common silent failure

## Deprecated — do not use

Earlier planning assumed AWS ECS/Terraform/ALB. That is **not** the actual stack. If you see
old references to ECS clusters, ALB DNS names, or SSM parameters anywhere, they're stale —
this file is the current source of truth.
