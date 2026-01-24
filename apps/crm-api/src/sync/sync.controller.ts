import { Body, Controller, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SyncService } from './sync.service';

// ✅ كتابة المسار كاملاً وواضحاً
@UseGuards(AuthGuard('jwt'))
@Controller('v1/sync')
export class SyncController {
  constructor(private sync: SyncService) {}

  @Post('push')
  async push(@Request() req: any, @Body() body: { events: any[] }) {
    return this.sync.applyChanges(req.user.tenantId, body.events);
  }

  @Post('pull')
  async pull(@Request() req: any, @Query('cursor') cursor?: string) {
    return this.sync.getChanges(req.user.tenantId, cursor);
  }
}