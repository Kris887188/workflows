export type LifeEntry = {
  id: string;
  user_id: string;
  title: string;
  entry_date: string;
  people: string[];
  tags: string[];
  notes: string;
  book_fragment: string;
  text_content: string;
  audio_url: string | null;
  file_urls: string[];
  created_at: string;
  updated_at: string;
};
