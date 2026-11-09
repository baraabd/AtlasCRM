# ---- deps (install all deps with cache) ----
FROM node:20-alpine AS deps
WORKDIR /repo

# Copy only manifests first for better cache
COPY package.json package-lock.json ./
COPY apps/crm-api/package.json apps/crm-api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN npm ci

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /repo

# Bring installed deps
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/crm-api/node_modules ./apps/crm-api/node_modules

# Copy full repo
COPY . .

# Prisma + build
RUN npx prisma generate --schema apps/crm-api/prisma/schema.prisma
RUN npm --prefix apps/crm-api run build

# ---- prod-deps (install only production deps) ----
FROM node:20-alpine AS prod-deps
WORKDIR /repo

# manifests again (to compute prod deps correctly)
COPY package.json package-lock.json ./
COPY apps/crm-api/package.json apps/crm-api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

# install prod only
RUN npm ci --omit=dev

# ---- runtime (minimal, non-root) ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Run as non-root (best practice)
USER node

# Copy only what we need at runtime
COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=build /repo/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=build /repo/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=prod-deps /repo/apps/crm-api/node_modules ./apps/crm-api/node_modules
COPY --from=build /repo/apps/crm-api/dist ./apps/crm-api/dist
COPY --from=build /repo/apps/crm-api/package.json ./apps/crm-api/package.json

WORKDIR /app/apps/crm-api

RUN node -e "new (require('@prisma/client').PrismaClient)()"

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
