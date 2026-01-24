// apps/crm-api/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeadsModule } from './leads/leads.module';
import { VisitsModule } from './visits/visits.module';

// ✅ 1. استيراد الملف
import { AuthModule } from './auth/auth.module'; 

@Module({
  imports: [
    // ✅ 2. إضافته هنا ضروري جداً ليتم تحميله
    AuthModule, 
    
    LeadsModule, 
    VisitsModule, 
    // PrismaModule (عادة ما يكون داخل الموديولات الأخرى، لكن لا بأس بوجوده هنا إذا كنت تستخدمه)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}