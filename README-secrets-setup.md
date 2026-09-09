# Setting up env vars & secrets — Render + Supabase

No Terraform, no AWS CLI needed for this part. Everything below is dashboard clicks.

## 1. Rotate the Supabase password (do this first)

The original password was shared in plaintext chat — treat it as compromised.

1. Supabase dashboard → your project → Project Settings → Database
2. Reset database password → copy the new connection string
3. Never paste the raw string in chat/Slack again — use Render's env var UI directly,
   or a password manager if it must be shared between people

## 2. Generate JWT_SECRET

Any random 32+ character string works. Quick way in PowerShell:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | % {[char]$_})
```

Copy the output — you'll paste it into Render, not commit it anywhere.

## 3. Set env vars in Render

Render dashboard → your backend service → Environment tab → Add Environment Variable,
for each of: DATABASE_URL (new Supabase string), JWT_SECRET (from step 2), PORT (5000).

## 4. Set health check + start command in Render

Same service → Settings:
- Health Check Path: `/health`
- Start Command: `npm start` (only if Render didn't already auto-detect it from package.json)

## 5. Confirm it's live

Render dashboard shows deploy logs in real time — watch for "Live" status. If it
crash-loops, check the logs tab first; it almost always shows the actual error
(commonly: missing env var, or DB connection failing because Supabase project is paused).

## 6. Update ENV_VARS.md

Once the Render URL exists (e.g. `huddle-backend.onrender.com`), update ENV_VARS.md and
tell frontend so they can set VITE_API_URL in Vercel.
