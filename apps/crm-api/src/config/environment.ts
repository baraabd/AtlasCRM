import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { parse } from 'dotenv';
import { expand } from 'dotenv-expand';

let environmentLoaded = false;

function projectDirectory(): string {
  let directory = __dirname;
  while (true) {
    if (existsSync(join(directory, 'apps', 'crm-api', 'package.json'))) {
      return directory;
    }
    const parent = dirname(directory);
    if (parent === directory) return process.cwd();
    directory = parent;
  }
}

/** Shell variables take precedence over .env.local, then .env. */
export function loadEnvironmentFiles(
  directory: string,
  environment: NodeJS.ProcessEnv = process.env,
): void {
  const parsed: Record<string, string> = {};
  for (const name of ['.env', '.env.local']) {
    const filename = join(directory, name);
    if (existsSync(filename))
      Object.assign(parsed, parse(readFileSync(filename)));
  }
  // dotenv-expand's public types require defined strings, unlike ProcessEnv.
  const processEnv: Record<string, string> = {};
  for (const [key, value] of Object.entries(environment)) {
    if (value !== undefined) processEnv[key] = value;
  }
  expand({ parsed, processEnv });
  Object.assign(environment, processEnv);
}

export function loadEnvironment(): void {
  if (environmentLoaded) return;
  loadEnvironmentFiles(projectDirectory());
  environmentLoaded = true;
}

export function getDatabaseUrl(): string {
  loadEnvironment();
  const value = process.env.DATABASE_URL;
  if (!value)
    throw new Error(
      'DATABASE_URL is required. Configure the root .env.local file.',
    );
  try {
    const url = new URL(value);
    if (
      !['postgres:', 'postgresql:'].includes(url.protocol) ||
      !url.hostname ||
      url.pathname === '/'
    ) {
      throw new Error('Invalid database URL');
    }
  } catch {
    throw new Error(
      'DATABASE_URL must be a PostgreSQL URL with a database name.',
    );
  }
  return value;
}

export function getJwtSecret(): string {
  loadEnvironment();
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      'JWT_SECRET must contain at least 32 characters. Configure the root .env.local file.',
    );
  }
  return secret;
}

export function getApiPort(): number {
  loadEnvironment();
  const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_PORT must be an integer between 1 and 65535.');
  }
  return port;
}
