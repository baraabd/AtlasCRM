import { INestApplication, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

/** Shared by the running server and HTTP integration tests. */
export function configureApplication(app: INestApplication): void {
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());
}
