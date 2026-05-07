import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCandidateDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  constituencyId: string;

  @IsUUID()
  @IsOptional()
  partyId?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
