import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EndVisitDto } from './dto/end-visit.dto';
import { StartVisitDto } from './dto/start-visit.dto';
import { VisitsService } from './visits.service';

@ApiTags('visits')
@Controller('/v1/visits')
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Post('start')
  async start(@Body() dto: StartVisitDto) {
    return this.visits.start(dto);
  }

  @Patch(':id/end')
  async end(@Param('id') id: string, @Body() dto: EndVisitDto) {
    return this.visits.end(id, dto);
  }
}
