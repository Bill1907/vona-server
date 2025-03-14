import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

@Injectable()
export class WebRTCService {
  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  async createWebRTCSession(
    userId: string,
    model: string,
    voice: string,
    instructions: string,
  ) {
    try {
      // Verify user exists
      await this.supabaseService.getUserById(userId);
      // Create an ephemeral API token for use in client-side applications with the Realtime API
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
