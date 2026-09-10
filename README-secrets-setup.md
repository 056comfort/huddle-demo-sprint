Setting up env vars & secrets — Render + Supabase

No Terraform, no AWS CLI needed for this part. Everything below is dashboard clicks.

1. Rotate the Supabase password (do this first)

The original password was shared in plaintext chat — treat it as compromised.

Supabase dashboard → your project → Project Settings → Database
Reset database password → copy the new connection string
Never paste the raw string in chat/Slack again — use Render's env var UI directly, or a password manager if it must be shared between people
2. Generate JWT_SECRET

Any random 32+ character string works. Quick way in PowerShell:

powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | % {[char]$_})

Copy the output — you'll paste it into Render, not commit it anywhere.

3. Set env vars in Render

Render dashboard → your backend service → Environment tab → Add Environment Variable, for each of: DATABASE_URL (new Supabase string), JWT_SECRET (from step 2), PORT (5000).

4. Set health check + start command in Render

Same service → Settings:

Health Check Path: /api/health
Start Command: npm start (only if Render didn't already auto-detect it from package.json)
5. Confirm it's live

Render dashboard shows deploy logs in real time — watch for "Live" status. If it crash-loops, check the logs tab first; it almost always shows the actual error (commonly: missing env var, or DB connection failing because Supabase project is paused).

6. Update ENV_VARS.md

Once the Render URL exists (e.g. huddle-backend.onrender.com), update ENV_VARS.md and tell frontend so they can set VITE_API_URL in Vercel.

7. Local testing against Supabase: use the pooler connection, not the direct one

If you're setting DATABASE_URL in a local .env to run tests locally (e.g. auth.test.ts) and get errors like P1001 Can't reach database server or DatabaseNotReachable, this is likely why:

Supabase deprecated direct IPv4 database connections in January 2024. The direct connection format (db.<project-ref>.supabase.co:5432) now resolves to an IPv6-only address. If your network/ISP doesn't support IPv6 (common on many home networks), you cannot reach it directly — this isn't a paused project or a wrong password, it's a network-level IPv6 gap.

Fix: use Supabase's connection pooler instead, which supports IPv4:

Supabase dashboard → your project → Project Settings → Database
Look for "Connection pooling" or a connection string with a *.pooler.supabase.com host
Use that string as DATABASE_URL for local testing instead of the db.<ref>.supabase.co direct format

Double-check the project reference in the pooler URL matches your actual project (the string after postgres. in the pooler hostname, or embedded in the connection string) — it's easy to accidentally grab a pooler string for a different Supabase project if more than one exists on the account.

Render itself may not need this change — server environments often have IPv6 support where local dev machines don't. Only switch Render's DATABASE_URL to the pooler format if the deployed app is also failing to connect; don't change what's already working in production just because local testing needed the pooler.