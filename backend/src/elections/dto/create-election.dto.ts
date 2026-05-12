import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, Matches } from 'class-validator';
import { ElectionStatus } from '../entities/election.entity';

export const normalizeElectionTitle = (value: any): any => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim().replace(/\s+/g, ' ');
  const match = normalized.match(/^general\s+elections?\s+(\d{4})$/i);
  if (match) {
    return `General Elections ${match[1]}`;
  }
  return normalized;
};

export class CreateElectionDto {
  @Transform(({ value }) => normalizeElectionTitle(value))
  @IsString()
  @IsNotEmpty()
  @Matches(/^General Elections? \d{4}$/i, {
    message: 'Election title must be in format: General Elections 2026 or General Election 2026',
  })
  title: string;

  @IsEnum(ElectionStatus)
  @IsOptional()
  status?: ElectionStatus;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;
}
