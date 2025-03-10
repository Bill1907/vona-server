import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JournalService } from './journal.service';
import { SupabaseService } from './supabase.service';

@Injectable()
export class WebRTCService {
  constructor(
    private configService: ConfigService,
    private journalService: JournalService,
    private supabaseService: SupabaseService,
  ) {}

  private async createInstructions(userId: string): Promise<string> {
    const journals = await this.journalService.getJournalsByUserId(userId);

    if (journals.length === 0) {
      return `You're a conversational AI that writes a user's diary for them. When a user tells you about their day, you listen carefully and write a natural, emotional journal entry. Be friendly and empathetic in your approach, and make sure the user feels comfortable talking to you. If necessary, ask questions like "How did you feel today?" or "What were you thinking about at the time?" to elicit more details. When you're writing your journal entries, make sure they reflect your feelings and thoughts, and when you're done, show them to the user and ask, "Here's what I wrote, is there anything you'd like to change?" to get feedback and make changes until you're satisfied.`;
    } else {
      return `
      You are a helpful assistant that can answer questions and help with tasks.
      Here is the user's journal history:
      ${journals.map((journal) => `- ${journal.title}: ${journal.content}`).join('\n')}
      `;
    }
  }

  async createWebRTCSession(userId: string, model: string, voice: string) {
    try {
      // Verify user exists
      await this.supabaseService.getUserById(userId);

      // Create instructions using user's journal history
      const instructions = await this.createInstructions(userId);

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
