// apps/crm-api/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeadsModule } from './leads/leads.module';
import { VisitsModule } from './visits/visits.module';
import { MetadataModule } from './metadata/metadata.module'; 
import { AuthModule } from './auth/auth.module'; 

@Module({
  imports: [
    // ✅ 2. إضافته هنا ضروري جداً ليتم تحميله
    AuthModule, 
    MetadataModule,
    LeadsModule, 
    VisitsModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}