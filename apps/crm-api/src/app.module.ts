import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { LeadsModule } from './leads/leads.module';
import { MetadataModule } from './metadata/metadata.module';
import { VisitsModule } from './visits/visits.module';

@Module({
  imports: [AuthModule, MetadataModule, LeadsModule, VisitsModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
