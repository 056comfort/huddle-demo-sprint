# Rollback Process

## Status: Verified & Tested (September 10, 2026)

The Render rollback procedure has been tested on the live Hobby-tier setup by the
infra teammate. Confirmed results: took approximately 1 minute, automatically
disabled Auto-Deploy to prevent accidental overwrites during the rollback, and
successfully reverted the service to the target deployment while the `/api/health`
check confirmed the service came back healthy.

## Render rollback (Backend) — verified steps

1. Render dashboard → open the backend web service (`huddle-demo-sprint`)
2. Click the **Deploys** tab in the left sidebar to see historical builds
3. Locate the last known-good deployment hash, before the faulty commit
4. Click that deployment entry → select **Rollback to this deploy**
5. Confirm the prompt — Render automatically disables **Auto-Deploy** at this
   point (protects against a new commit accidentally overwriting the rollback)
   and starts the rollback build
6. Monitor the deploy logs: confirm `/api/health` returns `200 OK` and the service
   status shows **Live**

**Took ~1 minute in the verified test run.**

## Vercel rollback (Frontend) — verified steps

1. Vercel project dashboard → **Deployments** tab
2. Locate the stable deployment from before the incident
3. Click the overflow menu (**...**) on that deployment card → **Promote to
   Production**
4. Vercel routes traffic to that snapshot instantly, no rebuild needed

## When to roll back vs. fix forward

| Scenario | Action | Why |
|---|---|---|
| Critical failure (crash loops, auth outages, `/api/health` failing) | Roll back immediately | Minimizes downtime, especially close to the Saturday deadline — don't burn time root-causing under pressure when a known-good rollback takes ~1 minute |
| Minor cosmetic/logic issue (styling glitch, non-blocking warning, typo) | Fix forward | A targeted patch commit is faster than a rollback + re-diagnosis cycle |

## Action items after any rollback

- **Re-enable Auto-Deploy** in Render's service settings once the issue is
  resolved and new commits are ready to go out again — it stays off after a
  rollback until someone turns it back on, so this is a real step, not automatic
- **Check secrets stayed in sync** — confirm `JWT_SECRET` and Supabase
  credentials are consistent across whatever deployment state you rolled back to,
  since environment variables can drift from what a given commit expects
