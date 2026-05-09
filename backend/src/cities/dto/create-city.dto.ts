import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100, { message: 'City name must be between 2 and 100 characters' })
  @Matches(/^[A-Z][a-z]+$/, {
    message: 'City name must contain letters only, with first letter capital',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100, { message: 'Province name must be between 2 and 100 characters' })
  @Matches(/^[A-Za-z][A-Za-z\s.'-]{0,98}[A-Za-z]$/, {
    message: 'Province name can contain letters, spaces, apostrophes, hyphens, and dots',
  })
  province: string;
}
