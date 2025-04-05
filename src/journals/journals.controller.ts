import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JournalsService } from './journals.service';
import { JournalCreationDto } from './dto/journal-creation.dto';
import { JournalResponseDto } from './dto/journal-response.dto';

@Controller('journals')
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createJournalFromConversation(
    @Body() journalCreationDto: JournalCreationDto,
  ): Promise<JournalResponseDto> {
    try {
      const { conversation, lang } = journalCreationDto;

      if (!conversation) {
        throw new HttpException(
          'Conversation not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate journal data from conversation
      const journalData =
        await this.journalsService.createJournalFromConversation(
          conversation,
          lang,
        );

      return journalData as JournalResponseDto;
    } catch (error) {
      console.error('Error creating journal:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to create journal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
