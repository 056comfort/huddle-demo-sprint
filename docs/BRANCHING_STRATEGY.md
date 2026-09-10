# Branching Strategy

Kept intentionally simple for a 1-week, 6-person sprint — not a long-term enterprise
git-flow setup. Optimized for: fast merges, minimal ceremony, nobody blocked waiting
on review for more than an hour or two.

## Branches

- **`main`** — always deployable. This is what Render and Vercel actually build from.
  Nothing broken should ever sit on `main`, even briefly.
- **`feature/<short-description>`** — one branch per piece of work
  (e.g. `feature/env-config-secrets`, `feat/channel-ui`). Branch off `main`, merge
  back into `main` via PR.

No `develop` branch, no long-lived staging branch — the sprint is too short for the
overhead to pay off, and Render's preview deploys (see `DEPLOYMENT.md`) cover the
"test before merging" need instead.

## Workflow

1. `git checkout main && git pull origin main` before starting anything new
2. `git checkout -b feature/<what-youre-doing>`
3. Commit as you go, push regularly (`git push origin feature/<branch>`) — don't
   sit on a large uncommitted/unpushed change, since a shared repo means someone
   else may need to build on what you're doing
4. Open a PR against `main` when ready
5. At least one other team member glances at it before merging — for a sprint this
   size, a quick read-through beats a strict formal review process
6. Merge, then delete the branch (GitHub can do this automatically on merge — worth
   enabling in repo settings to keep the branch list from cluttering)

## Naming convention

`feature/<area>-<short-description>` or `fix/<short-description>` for bug fixes.
Lowercase, hyphens, no spaces. Matches what's already in use
(`feature/env-config-secrets`, `feat/channel-ui`).

## Commit messages

Short, present-tense, describes what changed: `"Add RLS policies for messages table"`
not `"updates"` or `"fixed stuff"`. Doesn't need to be more formal than that for this
sprint.

## Conflict handling

`git pull origin main` before starting work each session catches most conflicts
early. If a merge conflict happens anyway, resolve locally, don't force-push over
someone else's work.
