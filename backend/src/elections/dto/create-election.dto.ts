import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, Matches } from 'class-validator';
import { ElectionStatus } from '../entities/election.entity';

export class CreateElectionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^General Elections \d{4}$/, {
    message: 'Election title must be in format: General Elections 2026',
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
