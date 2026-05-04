# syntax=docker/dockerfile:1.7
#
# Multi-stage build for the internal/main GraphQL API + batch job image.
#
# Build flow (see .dockerignore for full context):
#   The CI runner pre-builds `node_modules/` (incl. Prisma TypedSQL
#   generator output written by `prisma generate --sql`, which needs a
#   live DB tunnel) and `dist/`, then invokes `docker buildx build` with
#   those artifacts in the build context. The builder stage trims the
#   tree down to production deps; the runtime stage receives only the
#   slimmed `node_modules` + `dist`.
#
# Why we save/restore `.prisma/` around `pnpm prune`:
#   `prisma generate --sql` writes the schema-bound TypedSQL types to
#   `node_modules/.pnpm/@prisma+client@<...>/node_modules/.prisma/client/`
#   (and `.prisma/client/sql/` for TypedSQL). pnpm does NOT track these
#   generator-output files; `pnpm prune --prod` rewrites the .pnpm store
#   and silently discards them, which causes runtime crashes for any code
#   importing from `@prisma/client/sql` or relying on the generated typed
#   client output. Re-running `prisma generate --sql` inside the runtime
#   stage isn't viable here (the SQL form needs a DB tunnel that isn't
#   available from the docker build context), so we tar-snapshot the
#   `.prisma/` directories before prune and untar them back into the same
#   paths after. This preserves both the slim production image AND the
#   required generator output.
#
# Why we keep the multi-stage split:
#   Production image stays slim (devDependencies pruned) and final stage
#   runs as the non-root `node` user with a HEALTHCHECK. See
#   docs/handbook/SECURITY.md for the broader hardening rationale.
#
# Digest pinning (follow-up):
#   `node:20-slim` is currently tag-only; pin to `@sha256:<digest>` once a
#   known-good digest has been captured from CI (`docker buildx imagetools
#   inspect node:20-slim`).

# ---------------------------------------------------------------------------
# Builder stage: prune to production deps, preserving Prisma generator output.
# ---------------------------------------------------------------------------
FROM node:20-slim AS builder

WORKDIR /app

# corepack ships pnpm as a shim; pin to the version recorded in package.json.
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Copy lockfile + manifests first so subsequent layers cache well.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Pre-built artifacts copied from the CI runner build context.
COPY node_modules ./node_modules
COPY dist ./dist

# Save Prisma generator output (`.prisma/` directories under any package's
# `node_modules`) before pruning. tar preserves the original paths verbatim,
# so the post-prune restore lands the files back at the exact location node
# resolves `@prisma/client/sql` from. `|| true` keeps the layer succeeding on
# fresh builds where the dirs don't exist yet (defensive — they SHOULD exist
# in our flow but the restore step is a no-op if the snapshot is empty).
RUN find node_modules -type d -name .prisma -print0 \
      | xargs -0 -r tar -cf /tmp/prisma-snapshot.tar \
    || true

# `pnpm prune --prod` requires `CI=true` (or `--config.confirm-modules-purge=
# false`) under non-TTY docker buildx, otherwise pnpm 10 bails out with
# `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`.
ENV CI=true
RUN pnpm prune --prod

# Restore the saved `.prisma/` directories. tar -P preserves absolute / as-is
# paths, so the directories land back at the same `.pnpm/<pkg>/node_modules/
# .prisma/` locations they came from.
RUN if [ -s /tmp/prisma-snapshot.tar ]; then \
      tar -xf /tmp/prisma-snapshot.tar \
        && rm /tmp/prisma-snapshot.tar; \
    fi

# ---------------------------------------------------------------------------
# Runtime stage: minimal, non-root, HEALTHCHECK enabled.
# ---------------------------------------------------------------------------
FROM node:20-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# `node:20-slim` ships a `node` user (uid/gid 1000) created for exactly
# this purpose. Run the app as that user instead of root.
USER node

# Copy only what's needed at runtime, owned by the non-root user.
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json

EXPOSE 3000

# HEALTHCHECK is ignored by Cloud Run (which uses its own startup/liveness
# probes), but it's useful for local debugging via `docker run` /
# docker-compose / any orchestrator that honours OCI HEALTHCHECK.
# Node 20 ships a global `fetch`, so no extra runtime dep is required.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# `tsc-alias` (run during `pnpm build`) rewrites every `@/` import in `dist/`
# to a relative path, so `tsconfig-paths/register` is not needed at runtime.
# `tsconfig.json` is also dropped from the runtime stage for the same reason.
CMD ["node", "dist/bootstrap/index.js"]
