# AtlasCRM

AtlasCRM contains an Expo/React Native mobile app (`apps/crm-mobile`), a NestJS API
(`apps/crm-api`), and PostgreSQL accessed through Prisma. `apps/crm-admin` is still
a placeholder. The mobile app talks to the API; database credentials belong only
in the API environment.

## Local Android development on Windows

Use PowerShell from the repository root. Keep the API terminal running while you
start the mobile app in another terminal.

Requirements: Node.js 20.19.4 or newer (an actively supported LTS version is
recommended), npm, Docker Desktop, JDK 17, Android Studio with an installed SDK,
and a booted Android virtual device. The mobile app includes MapLibre and needs
a native development build; Expo Go does not include that native module.

### 1. Install dependencies and configure the API

```powershell
npm ci

# Create a local configuration once. Existing local settings are preserved.
if (-not (Test-Path .env.local)) {
    $atlasJwtSecret = node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
    $atlasTemplate = Get-Content .env.example -Raw
    $atlasTemplate.Replace('JWT_SECRET=', "JWT_SECRET=$atlasJwtSecret") |
        Set-Content .env.local -Encoding utf8
}
```

The example selects PostgreSQL at `127.0.0.1:5433/atlascrm_local` and the API at
port `3000`. The generated JWT secret is retained across restarts. Do not copy
the API's database URL or JWT secret into the mobile configuration.

The API, Prisma CLI, and seed command all load the root configuration in this
order: existing shell environment, then `.env.local`, then `.env`. If a previous
PowerShell session has `$env:DATABASE_URL` or `$env:JWT_SECRET` set, those values
still take precedence. Use a fresh PowerShell window to use the file values.

### 2. Start PostgreSQL and create the local database

Docker Compose needs `--env-file .env.local` explicitly. This selects the same
published database port as the API configuration.

```powershell
docker compose --env-file .env.local up -d --wait db
docker compose --env-file .env.local ps

[string]$atlasDatabaseExists = docker compose --env-file .env.local exec -T db psql -U crm -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'atlascrm_local'"
if ($LASTEXITCODE -ne 0) { throw 'Could not query PostgreSQL. Check the db container logs.' }
if ($atlasDatabaseExists.Trim() -ne '1') {
    docker compose --env-file .env.local exec -T db createdb -U crm atlascrm_local
}
```

The named volume is retained. These commands reuse the existing `crm` role and
do not reset its password. If an older volume uses different credentials, match
those credentials in `.env.local`.

### 3. Initialize the local schema and demo account

The historical migration files do not yet describe the complete current schema.
For this **local development database**, use `db push` without a data-loss or
reset flag. Stop and review any schema warning before proceeding. This is not a
production migration procedure.

```powershell
npm run prisma:generate --workspace=crm-api

Push-Location apps/crm-api
npx prisma db push --schema=prisma/schema.prisma
Pop-Location
```

After the schema command succeeds:

```powershell
npm run seed:local --workspace=crm-api
```

The local demo account is `admin@alpha.com`, initially with password `123456`.
Seeding again reuses its tenant and services and preserves its existing password.
To intentionally restore **only this local demo account's** password:

```powershell
npm run seed:local --workspace=crm-api -- --reset-demo-password
```

If `ATLAS_DEMO_PASSWORD` is set, the seed uses that value instead. The demo seed
requires an explicit local command, rejects `NODE_ENV=production`, and accepts
only local development/test database hosts and names. It is never run
automatically during API startup.

### 4. Start and verify the API

```powershell
npm run start:dev --workspace=crm-api
```

From another PowerShell window:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/health

$atlasLoginBody = @{ email = 'admin@alpha.com'; password = '123456' } | ConvertTo-Json
$atlasSession = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/v1/auth/login -ContentType 'application/json' -Body $atlasLoginBody
Invoke-RestMethod -Uri http://127.0.0.1:3000/v1/auth/me -Headers @{ Authorization = "Bearer $($atlasSession.token)" } |
    Select-Object id, email, tenantId
```

`/health` returns `status: ok` and `database: up` only after a real auth-table
query succeeds. Login returns the database user, a token, and the user's actual
tenant. `/v1/auth/me` rechecks that user and tenant in PostgreSQL. Swagger is at
`http://localhost:3000/api`; `/api` is not a prefix for mobile requests.

### 5. Configure and run the mobile app

Create or update `apps/crm-mobile/.env.local` with this local Android emulator
configuration. Keep unrelated environment settings if the file already exists:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
EXPO_PUBLIC_API_HOST=10.0.2.2
EXPO_PUBLIC_API_PORT=3000
EXPO_PUBLIC_USE_EMULATOR=true
```

`EXPO_PUBLIC_API_BASE_URL` takes precedence and is shared by authentication,
metadata, business API requests, and the sync HTTP transport. Supply the server
origin without `/api` or `/v1`. With no explicit configuration, Android
development uses `10.0.2.2:3000`. A release build requires an explicit HTTPS URL.

For a physical phone, use the computer's reachable LAN address and set
`EXPO_PUBLIC_USE_EMULATOR=false`; `10.0.2.2` is specific to the Android Emulator.

Ensure `adb devices -l` reports `device`, then run from the repository root:

```powershell
npm run android --workspace=crm-mobile
```

If the development build is already installed, restart its JavaScript server
after pulling code or changing environment settings:

```powershell
npm run start --workspace=crm-mobile -- --dev-client --clear
```

Use one Metro instance, and press `a` in that terminal to open the app on the
running emulator. Successful login opens the user's real workspace directly;
the old synthetic `t1` tenant is no longer used.

### Diagnose a failed login by layer

| Result                                                                       | Meaning                                                               | Next check                                                                   |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| API fails before listening                                                   | Missing configuration, unreachable database, or another startup error | Read the API terminal and confirm the root `.env.local`                      |
| `/health` returns 503                                                        | The API is reachable but the auth database/schema is unavailable      | Check PostgreSQL and the local schema initialization                         |
| Login returns 401                                                            | The API processed the request but rejected the email/password         | Use the intended account; explicitly reset the local demo password if needed |
| Mobile shows `Cannot reach the API at ...`                                   | No HTTP response reached the app                                      | Check the displayed address and the running API                              |
| Host health works but the emulator cannot open `http://10.0.2.2:3000/health` | The remaining fault is on the host/emulator network path              | Check API binding and the Windows private-network firewall rule for Node.js  |

The mobile app includes the configured API address in development connection
errors. It does not print passwords or tokens. Native debug builds permit local
HTTP; use HTTPS for release builds.

## Automated verification

```sh
npm run test --workspace=crm-mobile
npm run test:ci --workspace=crm-api -- --runInBand
npm run typecheck --workspace=crm-api
npm run typecheck --workspace=crm-mobile
npm run build --workspace=crm-api
```

For database integration, provision a disposable PostgreSQL database named
`atlascrm_test` (or `atlascrm_test_<suffix>`), set `TEST_DATABASE_URL`, and run:

```sh
npm run test:e2e --workspace=crm-api -- --runInBand
```

The suite creates and removes only its own temporary schema. It exercises the
real Prisma database, repeatable seeding, password reset opt-in, input
validation, login/profile contracts, tenant metadata isolation, and database
failure responses.

With a separately running API backed by a seeded disposable database, set
`TEST_API_BASE_URL`, `TEST_API_EMAIL`, `TEST_API_PASSWORD`, and optionally
`TEST_EXPECTED_SERVICE_COUNT=4`, then run:

```sh
npm run test:mobile-api
```

This test imports the actual mobile API/session modules and sends real HTTP
requests; only native platform detection is replaced. It does not replace the
Android UI or the final Windows/emulator network check. The
`Auth and database integration` GitHub Actions workflow runs these checks with
PostgreSQL 16 on pull requests and pushes to `main`.

## Current scope

Authentication, profile restoration, metadata retrieval, and the shared
authenticated HTTP connection are covered by these checks. They do not certify
the entire CRM for production: the offline SQLite/outbox synchronization remains
unfinished, the admin app is a placeholder, and production migration history
still needs reconciliation. Do not infer that every offline lead/visit change
has reached PostgreSQL from a successful login.
