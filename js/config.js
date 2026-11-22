// Replace these with your Supabase project values.
// Supabase Dashboard > Project Settings > API > Project URL and anon/public key.
export const SUPABASE_URL = "https://aofyxopehqjzxcszmabw.supabase.co/rest/v1/";
export const SUPABASE_ANON_KEY = "sb_publishable_TlQ_lKkPrZkGn8jygB22SA_wJHxcKXp";
export const WHATSAPP_NUMBER = "917305570219"; // Country code + number, digits only
export const isSupabaseConfigured = () =>
  SUPABASE_URL.includes(".supabase.co") &&
  !SUPABASE_URL.includes("YOUR-PROJECT") &&
  !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
