import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dklufabbfuczxqmhqoqp.supabase.co";

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbHVmYWJiZnVjenhxbWhxb3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzE5MTAsImV4cCI6MjA3ODMwNzkxMH0.j9aGBB5KvnxHysN2Ejn_mhY44zq3ZZMsMuCzJ71DsP0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
