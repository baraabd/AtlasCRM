import { networkInterfaces } from 'node:os';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { configureApplication } from './application';
import { getApiPort, getDatabaseUrl, getJwtSecret } from './config/environment';

async function bootstrap() {
  // Validate once before opening listeners or constructing database connections.
  getDatabaseUrl();
  getJwtSecret();
  const port = getApiPort();
  const app = await NestFactory.create(AppModule);
  configureApplication(app);
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription('Field Sales CRM MVP')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server is running!`);
  console.log(`👉 Local:   http://localhost:${port}/api`);
  console.log(`👉 Health:  http://localhost:${port}/health`);

  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`👉 Network: http://${net.address}:${port}/api`);
      }
    }
  }
}

void bootstrap().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'API startup failed');
  process.exitCode = 1;
});
