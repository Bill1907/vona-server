import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../webrtc/supabase.service';
import { JournalDto } from './dto/journal.dto';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { JournalResponseDto } from './dto/journal-response.dto';

interface JournalCreationData {
  userId: string;
  title: string;
  content: string;
  keywords?: string[];
  emotion?: string;
}

@Injectable()
export class JournalsService {
  private openai: OpenAI;

  // Zod schema for journal structure
  private journalStructureSchema = z.object({
    keywords: z.array(z.string()),
    emotion: z.string(),
    title: z.string(),
    content: z.string(),
  });

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async getJournalsByUserId(userId: string): Promise<JournalDto[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch journals: ${error.message}`);
    }

    return data || [];
  }

  async createJournal(journalData: JournalCreationData): Promise<JournalDto> {
    const { userId, title, content, keywords, emotion } = journalData;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('journals')
      .insert({
        user_id: userId,
        title,
        content,
        keywords: keywords || null,
        emotion,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create journal: ${error.message}`);
    }

    return data;
  }

  // Method to convert conversation to journal entry
  async createJournalFromConversation(
    conversation: any[],
    lang: string,
  ): Promise<{
    keywords: string[];
    emotion: string;
    title: string;
    content: string;
  }> {
    try {
      const languageMap = {
        en: 'English',
        ko: 'Korean',
        ja: 'Japanese',
        es: 'Spanish',
        de: 'German',
        it: 'Italian',
        pt: 'Portuguese',
      };

      const response = await this.openai.beta.chat.completions.parse({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that analyzes conversations and extracts key information to create a journal entry. Please provide your response in ${languageMap[lang]} language.`,
          },
          {
            role: 'user',
            content: JSON.stringify(conversation),
          },
        ],
        response_format: zodResponseFormat(
          this.journalStructureSchema,
          'journal',
        ),
      });

      return response.choices[0].message.parsed as JournalResponseDto;
    } catch (error) {
      console.error('Error creating journal:', error);

      if (error instanceof z.ZodError) {
        throw new Error(`Invalid data format: ${JSON.stringify(error.errors)}`);
      }

      throw error;
    }
  }
}
