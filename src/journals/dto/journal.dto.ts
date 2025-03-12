export interface JournalDto {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  keywords?: string[] | null;
  emotion?: string;
}
