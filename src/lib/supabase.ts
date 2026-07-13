import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

// ponytail: strip non-ASCII (invisible chars from copy-paste into Vercel env break Headers)
const clean = (s: string | undefined) => (s ?? "").replace(/[^\x20-\x7E]/g, "").trim();

export function getSupabase() {
  if (!_client) {
    _client = createClient(
      clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    );
  }
  return _client;
}

export type GameState = {
  id: number;
  tree_level: number;
  house_level: number;
  dog_happiness: number;
  watered_by: string | null;
  fed_by: string | null;
  watered_at: string | null;
  fed_at: string | null;
  fed_at_1: string | null;
  fed_at_2: string | null;
  play_at_1: string | null;
  play_at_2: string | null;
};
