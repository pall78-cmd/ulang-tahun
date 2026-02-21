const SUPABASE_URL = 'https://urcxbufxcebfgrsfvmsj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY3hidWZ4Y2ViZmdyc2Z2bXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzExMTYsImV4cCI6MjA4NzI0NzExNn0.CoWpvdB4v27SAWEni48Wu0JQcSMebRoZCPppnJNlLmQ';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE_NAME = 'messages';
