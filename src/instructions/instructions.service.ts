import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../webrtc/supabase.service';
import { JournalService } from '../webrtc/journal.service';

@Injectable()
export class InstructionsService {
  constructor(
    private supabaseService: SupabaseService,
    private journalService: JournalService,
  ) {}

  async createInstructions(
    userId: string,
    instructionsText: string,
  ): Promise<void> {
    // Check if instructions already exist for this user
    const { data: existingInstructions, error: fetchError } =
      await this.supabaseService
        .getClient()
        .from('user_instructions')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 means no rows returned
      throw new Error(
        `Failed to check existing instructions: ${fetchError.message}`,
      );
    }

    // If instructions exist, update them
    if (existingInstructions) {
      const { error: updateError } = await this.supabaseService
        .getClient()
        .from('user_instructions')
        .update({
          instructions: instructionsText,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(
          `Failed to update instructions: ${updateError.message}`,
        );
      }
    } else {
      // Otherwise, insert new instructions
      const { error: insertError } = await this.supabaseService
        .getClient()
        .from('user_instructions')
        .insert({
          user_id: userId,
          instructions: instructionsText,
        });

      if (insertError) {
        throw new Error(
          `Failed to create instructions: ${insertError.message}`,
        );
      }
    }
  }

  async getInstructions(userId: string): Promise<string | null> {
    // First try to get custom instructions
    const { data, error } = await this.supabaseService
      .getClient()
      .from('user_instructions')
      .select('instructions')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned
      throw new Error(`Failed to fetch instructions: ${error.message}`);
    }

    // If we have custom instructions, return them
    if (data?.instructions) {
      return data.instructions;
    }

    // Otherwise generate default instructions based on journal history
    const journals = await this.journalService.getJournalsByUserId(userId);

    if (journals.length === 0) {
      return `You're a conversational AI that writes a user's diary for them. Listen carefully and create a natural, emotional journal entry without repeating what the user said. Be friendly and empathetic. Ask brief questions like "How did you feel?" or "What went through your mind?" if needed for more details. When finished, simply ask "Is there anything you'd like to change?" to gather feedback.`;
    } else {
      return `
      You are a helpful assistant that can answer questions and help with tasks.
      Here is the user's journal history:
      ${journals.map((journal) => `- ${journal.title}: ${journal.content}`).join('\n')}
      `;
    }
  }
}
