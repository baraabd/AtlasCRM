// apps/crm-api/src/main.ts

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
// ✅ 1. إضافة استيراد json و urlencoded من مكتبة express
import { json, urlencoded } from 'express';

async function bootstrap() {
  // 1. إنشاء التطبيق
  const app = await NestFactory.create(AppModule);

  // 2. تفعيل CORS للسماح بالطلبات من أي مكان (مهم جداً للموبايل)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ 3. إضافة Middleware لتحليل JSON (الحل لمشكلة البيانات الفارغة)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // 4. Pipes & Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // يحول JSON إلى كلاسات DTO
    }),
  );
  app.enableShutdownHooks();
  app.useGlobalFilters(new PrismaExceptionFilter());

  // 5. Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription('Field Sales CRM MVP')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 6. الاستماع للاتصال
  const port = Number(process.env.API_PORT ?? 3000);
  
  // ✅✅ الحل الحاسم: الاستماع على 0.0.0.0
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server is running!`);
  console.log(`👉 Local:   http://localhost:${port}/api`);
  
  // طباعة عناوين الشبكة المتاحة للمساعدة في التشخيص
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`👉 Network: http://${net.address}:${port}/api`);
      }
    }
  }
}

void bootstrap();