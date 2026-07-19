import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This client only ever uses the public anon key, which is safe to ship to
// the browser - Row Level Security on the Supabase side restricts it to
// read-only access (see schema.sql in the scraper project).
export const supabase = createClient(url, anonKey, {
  realtime: { params: { eventsPerSecond: 5 } },
});

export type Company = {
  id: number;
  source_id: string;
  name: string | null;
  main_activity: string | null;
  keywords: string[];
  activities: string[];
  products_services: string[];
  prestations: string[];
  legal_form: string | null;
  capital: string | null;
  workforce: string | null;
  year_founded: string | null;
  rc_number: string | null;
  rc_city: string | null;
  ice: string | null;
  director: string | null;
  phones: string[];
  website: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  rating_avg: string | null;
  rating_count: string | null;
  source_url: string | null;
  scraped_at: string;
};

export type CrawlProgress = {
  id: number;
  status: string;
  current_keyword: string | null;
  keywords_total: number;
  keywords_done: number;
  companies_found: number;
  companies_fetched: number;
  keyword_merges: number;
  errors_count: number;
  updated_at: string;
};
