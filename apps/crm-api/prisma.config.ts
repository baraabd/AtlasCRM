// apps/crm-api/prisma.config.ts
import path from 'path';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { defineConfig } from 'prisma/config';

dotenvExpand.expand(dotenv.config({ path: path.resolve(__dirname, '../../.env') }));

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
});
