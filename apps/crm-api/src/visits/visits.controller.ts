import { Body, Controller, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // ✅ استيراد AuthGuard
import { ApiTags } from '@nestjs/swagger';

import { EndVisitDto } from './dto/end-visit.dto';
import { StartVisitDto } from './dto/start-visit.dto';
import { VisitsService } from './visits.service';

@ApiTags('visits')
@Controller('/v1/visits')
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Post('start')
  @UseGuards(AuthGuard('jwt')) // ✅ حماية المسار للحصول على المستخدم
  async start(@Body() dto: StartVisitDto, @Request() req: any) {
    // ✅ تمرير req.user.id (المندوب) إلى الدالة
    // ملاحظة: تأكد أن استراتيجية JWT تعيد id أو sub في كائن user
    return this.visits.start(dto, req.user.id || req.user.sub);
  }

  @Patch(':id/end')
  @UseGuards(AuthGuard('jwt')) // ✅ يفضل حماية هذا المسار أيضاً
  async end(@Param('id') id: string, @Body() dto: EndVisitDto) {
    return this.visits.end(id, dto);
  }
}