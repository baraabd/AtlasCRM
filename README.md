# CRM MVP (Monorepo)

This repo is a company-grade monorepo skeleton for:
- Mobile: React Native (Expo) + Redux Toolkit + SQLite (offline-first)
- API: NestJS + TypeScript + Prisma + Postgres
- Admin: Web dashboard (placeholder)

## Layout
- `apps/` runnable apps (mobile, admin, api)
- `packages/` shared packages (types/schemas/config/ui)
- `docker-compose.yml` local infra

## Next step
We will scaffold the actual Expo app + Nest app and wire shared types, linting, and tests.
