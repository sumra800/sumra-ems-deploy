import { IsString, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';

export class CreatePartyDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100, { message: 'Party name must be between 2 and 100 characters' })
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message: 'Party name must contain letters only',
  })
  name: string;

  @IsString()
  @IsOptional()
  @Length(2, 100, { message: 'Leader name must be between 2 and 100 characters' })
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message: 'Leader name must contain letters only',
  })
  leaderName?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
