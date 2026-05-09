import { IsString, IsNotEmpty, IsUUID, Length, Matches, IsOptional } from 'class-validator';

export class CreateConstituencyDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 6, { message: 'Constituency name must follow NA-1 to NA-100 format' })
  @Matches(/^NA-(100|[1-9]\d?)$/, {
    message: 'Constituency name must be in format NA-1 to NA-100',
  })
  name: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsUUID()
  @IsNotEmpty()
  cityId: string;
}
