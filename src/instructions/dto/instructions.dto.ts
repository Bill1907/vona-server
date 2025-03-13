import { IsNotEmpty, IsString } from 'class-validator';

export class InstructionsDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
