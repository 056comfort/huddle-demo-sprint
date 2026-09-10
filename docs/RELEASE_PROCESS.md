# Release Process

Given the 1-week timeline, "release" here means merging to `main`, not a formal
versioned release with tags/changelogs — that ceremony doesn't pay off at this scale.

## Steps

1. PR opened against `main`, described clearly (what changed, any open caveats —
   see the PR description pattern already used for the env-config-secrets PR)
2. CI (`ci.yml`) runs automatically — must pass lint + build before merge is safe
   (tests will run too, once they exist — see `TESTING_GAP.md`)
3. At least one teammate reviews before merging (per `BRANCHING_STRATEGY.md`)
4. Merge to `main`
5. Render and Vercel auto-deploy within a few minutes
6. Whoever merged does a quick manual sanity check: hit the deployed URL, confirm
   the app loads and the specific feature that changed actually works
7. Post a one-line note in the team channel: what shipped, any known issues

## Before the Saturday submission deadline

Note: the original practicum brief targets a Friday demo, but this team's actual
submission deadline is **Saturday** — plan around the real date, not the brief's
default.

- Freeze new merges to `main` once the critical end-to-end flow
  (register → login → channel → send message) is confirmed working end-to-end
  in the deployed environment, and once test execution (happening today) is
  complete — this matches the sprint brief's own rule: "test the critical
  end-to-end flow and fix critical issues before adding anything new."
- Any last-minute change gets extra scrutiny — a merge shortly before submission
  that breaks something is worse than not merging it at all.
