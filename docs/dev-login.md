# Dev auto login (LINE / Firebase bypass)

Lets a tester open a non-production deployment of civicship-portal and land
already signed in as a real, community-joined user — without a LINE account and
without Firebase being involved at any point.

Spans two repositories: `civicship-api` mints and honours the token,
`civicship-portal` provisions the session in its middleware.

## Setup

None. There is no flag to set and no secret to share.

Each side decides from the deployment identity it already carries:

| Service | Enabled when |
| --- | --- |
| civicship-api | `ENV` is one of `LOCAL` / `local` / `dev` / `development` / `staging` |
| civicship-portal | the build is staging or local (`ENV=staging`, `ENV=LOCAL`, or `NODE_ENV=development`) |

The dev deploy workflows already stamp these — `ENV=dev` on the api,
`ENV=staging` on the portal — so a dev deployment has it on and nothing else
needs doing.

## Why it cannot fire in production

The gate is fail-closed on `ENV`, and **production sets no `ENV` at all**: the
prd deploy workflows never pass it, on either repo. An unset or unrecognised
value disables the path, so production does not depend on remembering to turn
anything off.

The two sides evaluate that gate differently, which is worth knowing when
reasoning about it:

- **api** — `isDevLoginEnabled()` reads `ENV` on every call, and `verifyDevToken`
  re-checks it before validating anything. So a token minted on dev is inert
  against production even if one somehow reaches it.
- **portal** — `isStaging` / `isLocal` are module-level constants evaluated once
  at import, so the answer is fixed for the life of a deployment rather than
  re-derived per request.

Either way the deciding input is `ENV`, and production sets none.

## Why the token is not signed

An earlier revision signed the token with a configured shared secret. That secret
was the only thing this feature needed configuring, and a per-process random key
is not an option: Cloud Run runs several instances, so a token minted by one
would fail to verify on another.

So the token's **authority is bounded** instead of being protected by a key:

- `POST /dev-auth/session` takes no identity from the caller. It only ever
  provisions a fresh throwaway user.
- Every identity it creates is prefixed `dev-anon-`.
- `verifyDevToken` refuses any token naming a uid outside that prefix, and
  `handleDevAuth` checks it again at the lookup.

Forging a token therefore buys exactly what calling the endpoint openly already
gives you — a disposable account on a dev database. It cannot name a LINE
identity, so it cannot be used to become a real user, which is the escalation
that would have mattered. The token is an identifier, not a credential.

The endpoint is rate-limited (the same limiter as `/sessionLogin`), so it cannot
be used to flood the dev database either.

## Flow

1. A visitor with no session hits any page on the portal.
2. The portal's middleware calls `POST /dev-auth/session` on the api with the
   community id.
3. The api creates a throwaway `User` with two identities — a community-scoped
   `LINE` identity and a `PHONE` identity, matching a completed real signup —
   joins them to the community and gives them a member wallet. It returns a token
   carrying `{ uid, communityId, exp }`.
4. The portal sets that token as the `dev_auth_token` cookie and injects it into
   the current request, so even the first page view renders signed in.
5. Every later request authenticates with it: SSR through the forwarded cookie,
   browser-side through the `x-dev-auth-token` header. `handleDevAuth` resolves
   the user from the uid exactly as `handleFirebaseAuth` does.

## What the dev user gets

An **OWNER** membership and a member wallet. Owner because a dev deployment
exists to be poked at: `/admin` — including the owner-only `/admin/wallet`,
`/admin/members` and `/admin/analytics` — should be reachable the moment you
land, not after working out how to grant yourself access.

Otherwise the same as a real signup, minus the parts that reach outside the
system: **no signup bonus is granted and no LINE notification is sent**. Fake
users should not consume real incentive budget or push messages at anybody.

## Starting over with a fresh user

Visit `/api/dev-login/reset` on the portal. It clears the cookie and bounces you
back, and the middleware provisions a new user on the next page load.

`?next=/some/path` picks where to land afterwards.

## Cleaning up

Provisioned identities are prefixed `dev-anon-`, so both rows for a user match a
single sweep:

```sql
DELETE FROM t_users WHERE id IN (
  SELECT user_id FROM t_identities WHERE uid LIKE 'dev-anon-%'
);
```

## Limits

- Every session is a brand-new user, so this does **not** exercise the sign-up
  flow, and it cannot be used to log in as an existing account.
- LINE-facing features (messaging, LIFF-specific behaviour) still cannot be
  tested this way — that is the point of the bypass.
- Anyone who can reach the dev api can create a disposable dev account. That is
  the feature, not a hole; if a dev deployment ever needs to be private, put it
  behind network-level access control rather than re-adding a secret here.
