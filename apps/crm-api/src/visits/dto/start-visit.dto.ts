import { IsString } from 'class-validator';

export class StartVisitDto {
  @IsString()
  leadId!: string;
}
