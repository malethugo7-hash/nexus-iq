import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cafiaqwrhamtwelpxwic.supabase.co";

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZmlhcXdyaGFtdHdlbHB4d2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTM2NTEsImV4cCI6MjA4ODM4OTY1MX0.PFg1leyFK4UkYdjH0ci3ww8jLlMwpvay_EeccH2v65M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);