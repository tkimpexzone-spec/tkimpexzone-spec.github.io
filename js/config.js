
export const SUPABASE_URL =
  "https://aofyxopehqjzxcszmabw.supabase.co";

export const SUPABASE_ANON_KEY =
  "YOUR_EXISTING_SB_PUBLISHABLE_KEY";

export const WHATSAPP_NUMBER = "917305570219";

export const isSupabaseConfigured = () =>
  SUPABASE_URL.includes(".supabase.co") &&
  !SUPABASE_URL.includes("YOUR-PROJECT") &&
  !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
