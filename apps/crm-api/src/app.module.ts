import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeadsModule } from './leads/leads.module';
import { VisitsModule } from './visits/visits.module';

@Module({
  imports: [LeadsModule, VisitsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


