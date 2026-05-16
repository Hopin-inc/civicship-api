---
description: Run quality gate, commit current changes, push, and open a PR
---

Ship the current branch: verify quality, commit, push, and open a PR.
Designed to be invoked when work feels done; it surfaces problems before
they reach review.

# Steps

1. **Quality gate** (always)

   Run:
   - `pnpm exec tsc --noEmit`
   - `pnpm lint`
   - `pnpm test`

   If any fails, surface the error and STOP. Do not commit broken code.

2. **Show what will ship**

   - `git status`
   - `git diff --stat develop...HEAD` (if on a feature branch)
   - `git log --oneline develop..HEAD`

   Notes:
   - This repository's base branch is `develop`. If the PR will target a
     different base, use that branch name instead.

   Summarize: how many commits, how many files, primary intent.

3. **Confirm with the human**

   Show the proposed:
   - Commit message (if there are unstaged/uncommitted changes)
   - PR title
   - PR body (Summary + Test plan based on the diff)

   Ask for approval before committing or pushing. The human makes the
   final call on what ships.

4. **Commit any pending changes**

   If `git status` is not clean:
   - Stage relevant files (avoid catch-all `git add .`).
   - Before staging, scan for secrets / config you should never commit
     (`.env`, `.env.*`, `credentials/`, any file matching `*secret*` /
     `*token*` / `*.key`). If any appear in the diff, refuse to stage
     them and ask the human to confirm or move them.
   - Commit with the approved message.

5. **Push and open PR**

   - `git push -u origin <branch>`
   - `gh pr create --title "<title>" --body "<body>"` (use HEREDOC for
     the body to preserve formatting)

6. **Report**

   Return the PR URL. Mention that CI will run; offer to subscribe to
   PR activity events if not already subscribed.

# Safety

- Never `git push --force`.
- Never commit `.env*` or `credentials/`. Run a quick scan of the
  staged file list before committing and refuse if either pattern
  is present.
- If branch is `main`, `master`, or `develop`, refuse and ask the
  human to create a feature branch first.
