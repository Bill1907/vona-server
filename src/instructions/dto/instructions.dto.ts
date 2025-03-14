import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JournalDto } from '../../journals/dto/journal.dto';

export class InstructionsDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class UpdateInstructionsDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  instruction: string;

  @IsOptional()
  @IsArray()
  journals?: JournalDto[];
}
