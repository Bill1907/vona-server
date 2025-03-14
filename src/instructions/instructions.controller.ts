import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
  Put,
} from '@nestjs/common';
import { InstructionsService } from './instructions.service';
import { InstructionsDto, UpdateInstructionsDto } from './dto/instructions.dto';

@Controller('instructions')
export class InstructionsController {
  constructor(private readonly instructionsService: InstructionsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createInstructions(@Body() instructionsDto: InstructionsDto) {
    try {
      const { userId, instructions } = instructionsDto;

      // Use provided instructions or default
      const instructionsText =
        instructions ||
        "You're a conversational AI that writes a user's diary for them. Listen carefully and create a natural, emotional journal entry without repeating what the user said.";

      await this.instructionsService.createInstructions(
        userId,
        instructionsText,
      );

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

  @Put()
  @UsePipes(new ValidationPipe())
  async updateInstructions(@Body() updateDto: UpdateInstructionsDto) {
    try {
      const { userId, instruction, journals } = updateDto;

      const updatedInstruction =
        await this.instructionsService.updateInstructions(userId, {
          instruction,
          journals,
        });

      return {
        message: 'Instructions updated successfully',
        instructions: updatedInstruction,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to update instructions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
