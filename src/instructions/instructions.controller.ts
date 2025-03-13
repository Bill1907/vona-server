import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { InstructionsService } from './instructions.service';
import { CreateInstructionsDto } from './dto/create-instructions.dto';
import { InstructionsDto } from './dto/instructions.dto';

@Controller('instructions')
export class InstructionsController {
  constructor(private readonly instructionsService: InstructionsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createInstructions(
    @Body() createInstructionsDto: CreateInstructionsDto,
  ) {
    try {
      const { userId, instructions } = createInstructionsDto;

      await this.instructionsService.createInstructions(userId, instructions);

      return { message: 'Instructions created successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to create instructions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async getInstructions(@Body() instructionsDto: InstructionsDto) {
    try {
      const { userId } = instructionsDto;

      const instructions =
        await this.instructionsService.getInstructions(userId);

      return { instructions };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to get instructions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
