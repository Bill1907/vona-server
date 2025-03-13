import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JournalService } from './journal.service';
import { SupabaseService } from './supabase.service';
import { InstructionsService } from '../instructions/instructions.service';

@Injectable()
export class WebRTCService {
  constructor(
    private configService: ConfigService,
    private journalService: JournalService,
    private supabaseService: SupabaseService,
    private instructionsService: InstructionsService,
  ) {}

  async createWebRTCSession(userId: string, model: string, voice: string) {
    try {
      // Verify user exists
      await this.supabaseService.getUserById(userId);

      // Get instructions from the Instructions service
      const instructions =
        await this.instructionsService.getInstructions(userId);

      // Create WebRTC session
      const response = await fetch(
        'https://api.openai.com/v1/realtime/sessions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            voice,
            instructions,
            input_audio_transcription: {
              model: 'whisper-1',
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}
