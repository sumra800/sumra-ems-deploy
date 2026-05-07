import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePartyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  leaderName?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
