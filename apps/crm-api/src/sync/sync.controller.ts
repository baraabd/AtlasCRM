import { Body, Controller, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SyncService } from './sync.service';

@Controller('sync')
@UseGuards(AuthGuard('jwt'))
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  // Push: الموبايل يرسل بيانات
  @Post('push')
  async push(@Request() req: any, @Body() body: any) {
    // body.events هو ما يرسله WatermelonDB عادة، أو يمكن أن يكون body مباشرة
    // سنرسل الـ body كاملاً للسيرفس ليعالجه
    const data = body.events || body; 
    return this.sync.applyChanges(req.user.tenantId, data);
  }

  // Pull: الموبايل يطلب بيانات
  @Post('pull') // WatermelonDB يستخدم POST للـ Pull أحياناً مع query parameters
  async pull(@Request() req: any, @Query('last_pulled_at') lastPulledAt: string) {
    // lastPulledAt هو الـ cursor
    const changes = await this.sync.getChanges(req.user.tenantId, lastPulledAt);
    
    return {
      changes,
      timestamp: new Date().toISOString(),
    };
  }
}