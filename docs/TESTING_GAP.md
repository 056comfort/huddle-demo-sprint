# Testing status

## Current state: verified, passing

Backend has a real test suite (`auth.test.ts`, `health.test.ts`, Jest) that has been
run and confirmed passing locally:

Test Suites: 2 passed, 2 total
Tests: 8 passed, 8 total


This was not a given — getting here surfaced and fixed three separate real issues:

1. **Out-of-sync `package-lock.json`** — blocked `npm ci` entirely (unrelated
   phantom dependencies in the lock file). Fixed by regenerating from a clean
   install.
2. **Supabase direct IPv4 connections are deprecated** — the direct connection
   string (`db.<ref>.supabase.co`) resolves to IPv6-only, which failed to connect
   from a local network without IPv6 support. Fixed by switching to Supabase's
   connection pooler (`*.pooler.supabase.com`), which supports IPv4.
3. **Database migrations had never been applied** — the actual Supabase database
   was missing all tables (`users`, `conversations`, etc.) even though Prisma's
   migration files existed in the repo. This likely meant the **live deployed
   backend** was failing on every registration/login attempt, not just tests.
   Fixed by running `npx prisma migrate deploy` against the real database.

Frontend has no tests configured (confirmed earlier: no test framework set up).
This remains a real, separate gap — not addressed by the backend work above.

## CI pipeline status

`ci.yml`'s backend job now includes `DATABASE_URL` and `JWT_SECRET` as job-level
env vars, sourced from GitHub Actions repository secrets (Settings > Secrets and
variables > Actions). This allows `npm test --if-present` to actually connect and
run `auth.test.ts` in CI, not just skip it.

**Note on what this means for test isolation:** CI test runs hit the real, shared
Supabase database (same one used for the deployed app) — there is no separate
test database for this sprint. This is a deliberate pragmatic tradeoff given the
timeline, not an oversight. Worth confirming with backend that `auth.test.ts`
cleans up the test user it creates, so repeated CI runs don't accumulate junk
data in the shared database.

## Remaining action items

- Confirm the GitHub Actions secrets are actually set (not just referenced in
  `ci.yml`) and that a real CI run shows the backend job's test step passing
  with real output, not silently skipped
- Frontend: no tests exist yet - out of scope for this fix, worth raising
  separately if full coverage matters for submission
- Confirm whether Render's deployed backend needed the same pooler connection
  string change, or if it was unaffected by the IPv4/IPv6 issue
- Health check path corrected from `/health` to `/api/health` — confirm Render's
  Health Check Path setting has been updated to match