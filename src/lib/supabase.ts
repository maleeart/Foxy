import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
};
