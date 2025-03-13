import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInstructionsDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  instructions: string;
}
