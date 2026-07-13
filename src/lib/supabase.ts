import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

// ponytail: anon key is public (shipped in client bundle, RLS off) — hardcoded to avoid
// broken Vercel env vars (invisible chars from paste kept corrupting the key).
const SUPABASE_URL = "https://wqpbwezorxetcupgtrau.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcGJ3ZXpvcnhldGN1cGd0cmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNTEwODYsImV4cCI6MjA5ODkyNzA4Nn0.g2fHeYE-jnxYu6nNBJjiIc6k_Al-wzepG4YdrCFaMRM";

export function getSupabase() {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
