import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export enum VisitOutcomeDto {
  FOLLOW_UP = 'FOLLOW_UP',
  WON = 'WON',
  LOST = 'LOST',
  NO_ACTION = 'NO_ACTION',
}

// JSON type that works everywhere
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export class EndVisitDto {
  @IsOptional()
  @IsEnum(VisitOutcomeDto)
  outcome?: VisitOutcomeDto;

  // keep it flexible for now (we'll strict it later)
  @IsOptional()
  presented?: JsonValue;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  durationSec?: number;
}
