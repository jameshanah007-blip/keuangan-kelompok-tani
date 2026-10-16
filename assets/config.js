// Hanya gunakan Project URL dan publishable/anon key. Jangan pernah menaruh service_role/secret key di browser.
window.APP_CONFIG = {
  SUPABASE_URL: "https://kydvxnknbtbpjeuhbrus.supabase.co",
  SUPABASE_ANON_KEY: "ISI_PUBLISHABLE_ATAU_ANON_KEY"
};
window.isSupabaseConfigured = () =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(window.APP_CONFIG.SUPABASE_URL) &&
  !!window.APP_CONFIG.SUPABASE_ANON_KEY &&
  !window.APP_CONFIG.SUPABASE_ANON_KEY.startsWith("ISI_");