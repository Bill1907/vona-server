import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

interface Journal {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
}

@Injectable()
export class JournalService {
  constructor(private supabaseService: SupabaseService) {}

  async getJournalsByUserId(userId: string): Promise<Journal[]> {
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
}
