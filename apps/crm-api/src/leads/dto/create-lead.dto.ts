import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateLeadDto {
  @ApiProperty({ example: 'Cafe Milano', minLength: 2 })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'Cafe' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '+963999999' })
  @IsOptional()
  @IsString()
  phone?: string;
}
