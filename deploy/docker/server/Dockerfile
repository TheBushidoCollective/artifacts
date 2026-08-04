# syntax=docker/dockerfile:1

# The app server plus the viewer's built assets. One image serves both the
# service origin and the sandbox origin; the deployment routes by Host and
# each Cloud Run service gets its own registrable domain under *.run.app.

FROM oven/bun:1-alpine AS build
WORKDIR /src

# Manifests first, so a source-only change does not reinstall dependencies.
COPY package.json bun.lock ./
COPY packages/relic-format/package.json packages/relic-format/
COPY packages/relic-server/package.json packages/relic-server/
COPY packages/relic-mcp/package.json packages/relic-mcp/
COPY packages/relic-viewer/package.json packages/relic-viewer/
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# --- runtime ---------------------------------------------------------------
FROM oven/bun:1-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
# Refuses to start on memory storage under NODE_ENV=production, so a
# misconfigured deploy fails at boot rather than silently losing every relic.

COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/package.json ./package.json
COPY --from=build /src/packages ./packages

# Cloud Run supplies PORT; this is the documented default, not a guess.
ENV PORT=8080
EXPOSE 8080

# Never root.
USER bun

CMD ["bun", "run", "packages/relic-server/src/index.ts"]
