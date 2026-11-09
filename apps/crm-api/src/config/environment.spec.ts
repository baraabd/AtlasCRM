import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { loadEnvironmentFiles } from './environment';

describe('environment precedence', () => {
  const directory = mkdtempSync(join(tmpdir(), 'atlascrm-env-'));

  afterAll(() => rmSync(directory, { recursive: true, force: true }));

  it('uses .env.local over .env and expands the selected values', () => {
    writeFileSync(
      join(directory, '.env'),
      'DB_PORT=5432\nDATABASE_URL=postgresql://local@127.0.0.1:${DB_PORT}/atlascrm_local\n',
    );
    writeFileSync(join(directory, '.env.local'), 'DB_PORT=5433\n');
    const environment: NodeJS.ProcessEnv = {};
    loadEnvironmentFiles(directory, environment);
    expect(environment.DATABASE_URL).toBe(
      'postgresql://local@127.0.0.1:5433/atlascrm_local',
    );
  });

  it('preserves explicitly exported connection settings', () => {
    const environment: NodeJS.ProcessEnv = {
      DATABASE_URL: 'postgresql://local@127.0.0.1:55439/atlascrm_test',
      DB_PORT: '55439',
    };
    loadEnvironmentFiles(directory, environment);
    expect(environment.DATABASE_URL).toBe(
      'postgresql://local@127.0.0.1:55439/atlascrm_test',
    );
    expect(environment.DB_PORT).toBe('55439');
  });
});
