// config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key missing in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
