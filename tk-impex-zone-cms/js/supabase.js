import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config.js";
export const supabaseReady = isSupabaseConfigured();
export const supabase = supabaseReady ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
export function requireSupabase() {
  if (!supabaseReady) throw new Error("Supabase is not configured. Update js/config.js with your project URL and anon key.");
  return supabase;
}
export function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
