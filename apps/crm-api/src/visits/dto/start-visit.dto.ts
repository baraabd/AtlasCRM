import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StartVisitDto {
  @ApiProperty({ example: 'PUT_LEAD_ID_HERE' })
  @IsString()
  leadId!: string;
}
