import { IsNotEmpty, IsString } from 'class-validator';

export class WebRTCSessionDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  voice: string;

  @IsNotEmpty()
  @IsString()
  instructions: string;
}
