import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ElectionStatus } from '../entities/election.entity';

export class CreateElectionDto {
  @IsString()
  @IsNotEmpty()
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
