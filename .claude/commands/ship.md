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
   - `git diff --stat main...HEAD` (if on a feature branch)
   - `git log --oneline main..HEAD`

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
   - Stage relevant files (avoid catch-all `git add .`)
   - Commit with the approved message

5. **Push and open PR**

   - `git push -u origin <branch>`
   - `gh pr create --title "<title>" --body "<body>"` (use HEREDOC for
     the body to preserve formatting)

6. **Report**

   Return the PR URL. Mention that CI will run; offer to subscribe to
   PR activity events if not already subscribed.

# Safety

- Never `git push --force`.
- Never commit `.env*` or `credentials/`.
- If branch is `main` or `master`, refuse and ask the human to create
  a feature branch first.
