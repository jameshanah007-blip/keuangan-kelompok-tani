// Publishable key sama seperti yang dipakai situs Portal Betesda untuk proyek portal-betesda.
// Key publishable boleh digunakan di browser; jangan pernah gunakan service_role/secret key.
window.APP_CONFIG = {
  SUPABASE_URL: "https://kydvxnknbtbpjeuhbrus.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_f5Y5vorvPKuKgSxWfuHS2w_RK81oBm1"
};
window.isSupabaseConfigured = () =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(window.APP_CONFIG.SUPABASE_URL) &&
  !!window.APP_CONFIG.SUPABASE_ANON_KEY &&
  !window.APP_CONFIG.SUPABASE_ANON_KEY.startsWith("ISI_");