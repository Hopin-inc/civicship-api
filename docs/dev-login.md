# Dev auto login (LINE / Firebase bypass)

Lets a tester open a non-production deployment of civicship-portal and land
already signed in as a real, community-joined user — without a LINE account and
without Firebase being involved at any point.

Spans two repositories: `civicship-api` mints and honours the token,
`civicship-portal` provisions the session in its middleware.

## Enabling it

Set all three on the **api** service:

| Variable | Value |
| --- | --- |
| `DEV_LOGIN_ENABLED` | `true` |
| `ENV` | one of `LOCAL` / `local` / `dev` / `development` / `staging` |
| `DEV_LOGIN_SECRET` | a random string, **32 chars or longer** |

And on the **portal** service:

| Variable | Value |
| --- | --- |
| `DEV_LOGIN_ENABLED` | `true` |
| `DEV_LOGIN_SECRET` | the same value as the api's |

`DEV_LOGIN_SECRET` is deliberately **not** `NEXT_PUBLIC_` — it is only ever used
by the portal's middleware, server-side, and never reaches the browser.

## Why it cannot fire in production

The api gate (`src/config/devAuth.ts`) requires all three of its variables, and
production sets none of them: the prd deploy workflows never set `ENV` at all, so
even if the flag and secret leaked into the environment the allow-list would
still reject it. Every gate is checked again on every request, not just at
startup, and `verifyDevToken` re-checks the gate before it will validate a
signature — so a token minted on dev is inert against a production api.

The portal gates independently on `!isProduction && DEV_LOGIN_ENABLED &&
DEV_LOGIN_SECRET`. Neither side trusts the other's gating.

## Flow

1. A visitor with no session hits any page on the portal.
2. The portal's middleware calls `POST /dev-auth/session` on the api with the
   shared secret and the community id.
3. The api creates a throwaway `User` with two identities — a community-scoped
   `LINE` identity and a `PHONE` identity, matching a completed real signup —
   joins them to the community and gives them a member wallet. It returns an
   HMAC-signed token carrying `{ uid, communityId, exp }`.
4. The portal sets that token as the `dev_auth_token` cookie and injects it into
   the current request, so even the first page view renders signed in.
5. Every later request authenticates with it: SSR through the forwarded cookie,
   browser-side through the `x-dev-auth-token` header. `handleDevAuth` resolves
   the user from the uid exactly as `handleFirebaseAuth` does.

## What the dev user gets

A membership and a member wallet — the same as a real signup, minus the parts
that reach outside the system. **No signup bonus is granted and no LINE
notification is sent**: fake users should not consume real incentive budget or
push messages at anybody.

## Starting over with a fresh user

Visit `/api/dev-login/reset` on the portal. It clears the cookie and bounces you
back, and the middleware provisions a new user on the next page load.

## Impersonating a specific existing user

`POST /dev-auth/session` also accepts `{"uid": "..."}` and will issue a token for
that identity instead of provisioning a new one, provided the identity already
exists in the target community. It never creates a user for an unknown uid.

## Cleaning up

Provisioned identities are prefixed `dev-anon-`, so both rows for a user match a
single sweep:

```sql
DELETE FROM t_users WHERE id IN (
  SELECT user_id FROM t_identities WHERE uid LIKE 'dev-anon-%'
);
```

## Limits

- It impersonates registered users, so it does **not** exercise the sign-up flow.
- LINE-facing features (messaging, LIFF-specific behaviour) still cannot be
  tested this way — that is the point of the bypass.
