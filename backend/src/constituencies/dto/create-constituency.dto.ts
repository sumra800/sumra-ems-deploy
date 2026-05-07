import { IsString, IsNotEmpty } from 'class-validator';

export class CreateConstituencyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  region: string;
}
