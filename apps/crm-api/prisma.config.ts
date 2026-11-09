// apps/crm-api/prisma.config.ts
import path from 'path';

import { defineConfig } from 'prisma/config';

import { loadEnvironment } from './src/config/environment';

loadEnvironment();

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
});
