import { IsUUID, IsNotEmpty } from 'class-validator';

export class CastVoteDto {
  @IsUUID()
  @IsNotEmpty()
  candidateId: string;

  @IsUUID()
  @IsNotEmpty()
  electionId: string;
}
