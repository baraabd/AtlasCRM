import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@Controller('/v1/leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  async list() {
    return this.leads.list();
  }

  @Post()
  async create(@Body() dto: CreateLeadDto) {
    return this.leads.create(dto);
  }
}
