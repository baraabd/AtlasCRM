import { Body, Controller, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SyncService } from './sync.service';

@Controller('sync')
@UseGuards(AuthGuard('jwt'))
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post('push')
  async push(@Request() req: any, @Body() body: any) {
    const data = body.events || body; 
    return this.sync.applyChanges(req.user.tenantId, data);
  }

  @Post('pull')
  async pull(@Request() req: any, @Query('last_pulled_at') lastPulledAt: string) {
    const changes = await this.sync.getChanges(req.user.tenantId, lastPulledAt);
    
    return {
      changes,
      timestamp: new Date().toISOString(),
    };
  }
}