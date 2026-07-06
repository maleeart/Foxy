import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
