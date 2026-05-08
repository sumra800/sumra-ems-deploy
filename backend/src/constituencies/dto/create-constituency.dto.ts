import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateConstituencyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsUUID()
  @IsNotEmpty()
  cityId: string;
}
