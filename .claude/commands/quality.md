---
description: Run the full quality gate manually (typecheck + lint + tests)
---

Run the full civicship-api quality gate and report each step's result.
This is the same set of checks the Stop hook runs (plus the test suite,
which the Stop hook skips by default).

Steps, in order:

1. **Typecheck** — `pnpm exec tsc --noEmit`
2. **Lint** — `pnpm lint`
3. **Tests** — `pnpm test`

For each step:
- If it passes, report `PASS` with the elapsed seconds.
- If it fails, surface the failing output verbatim (do not summarize)
  and stop the remaining steps. The user needs the raw error to act on it.

If all three pass, report a single-line `Quality gate: PASS`.
