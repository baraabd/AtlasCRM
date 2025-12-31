# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /repo

# monorepo manifests
COPY package.json package-lock.json ./
COPY apps/crm-api/package.json apps/crm-api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN npm ci

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY . .

# prisma + build (workspace)
RUN npx prisma generate --schema apps/crm-api/prisma/schema.prisma
RUN npm -w apps/crm-api run build

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# copy built output
COPY --from=build /repo/apps/crm-api/dist ./dist
COPY --from=build /repo/apps/crm-api/package.json ./package.json

# install only runtime deps for crm-api (includes local file dep resolution from monorepo build isn't needed at runtime)
# simplest: keep prod node_modules from build workspace
COPY --from=build /repo/apps/crm-api/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main"]
