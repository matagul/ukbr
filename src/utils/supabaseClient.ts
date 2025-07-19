import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nkkpgdzknpuznqwxbvct.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra3BnZHprbnB1em5xd3hidmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzI0NDcsImV4cCI6MjA2ODUwODQ0N30.o1uwKXD-wQ_WiPtWXP_lHzICpxNTeFZtVXq7Q4iqJuI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 