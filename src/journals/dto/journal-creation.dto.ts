import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class JournalCreationDto {
  @IsNotEmpty()
  @IsArray()
  conversation: any[];

  @IsNotEmpty()
  @IsString()
  lang: string;
}
