import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../webrtc/supabase.service';
import { JournalService } from '../webrtc/journal.service';
import { JournalDto } from '../journals/dto/journal.dto';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class InstructionsService {
  private openai: OpenAI;

  constructor(
    private supabaseService: SupabaseService,
    private journalService: JournalService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

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

  async updateInstructions(
    userId: string,
    data: { instruction: string; journals?: JournalDto[] },
  ): Promise<string> {
    // Update the instructions with the provided text
    await this.createInstructions(userId, data.instruction);

    // If journals are provided, use OpenAI to generate a new instruction based on them
    if (data.journals && data.journals.length > 0) {
      try {
        // Format journals for context
        const journalContext = data.journals
          .map((journal) => `- ${journal.title}: ${journal.content}`)
          .join('\n');

        // Call OpenAI to generate a new instruction
        const updatedInstruction = await this.generateInstructionsWithOpenAI(
          data.instruction,
          journalContext,
        );

        // Update the instructions with the newly generated one
        await this.createInstructions(userId, updatedInstruction);

        // Return the updated instruction
        return updatedInstruction;
      } catch (error) {
        console.error('Failed to generate instruction with OpenAI:', error);
        // Continue with the provided instruction if OpenAI fails
      }
    }

    // Return the updated instructions
    return data.instruction;
  }

  private async generateInstructionsWithOpenAI(
    currentInstructions: string,
    journalContext: string,
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'developer',
            content:
              'You are an AI assistant that analyzes journal entries and improves instruction prompts. ' +
              "Your task is to update the current instructions to better reflect the user's writing style, " +
              'interests, and emotional patterns based on their journal entries. ' +
              'Keep the new instructions concise but comprehensive.',
          },
          {
            role: 'user',
            content:
              `Current instructions: "${currentInstructions}"\n\n` +
              `Journal entries:\n${journalContext}\n\n` +
              "Please update the instructions to better reflect the user's writing style, " +
              'interests, and emotional patterns based on these journal entries. ' +
              'Return ONLY the updated instructions text, nothing else.',
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw new Error('Failed to generate instructions with OpenAI');
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
