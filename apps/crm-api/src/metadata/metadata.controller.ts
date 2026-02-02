import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { MetadataService } from './metadata.service';

@ApiTags('metadata')
@Controller('v1/metadata')
@UseGuards(AuthGuard('jwt'))
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get()
  async getMetadata(@Request() req: any) {
    return this.metadataService.getAppMetadata(req.user.tenantId);
  }
}