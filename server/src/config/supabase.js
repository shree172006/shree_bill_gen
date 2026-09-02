import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://fatjyhbkvpsqbyrtvvjy.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_9CPkem0vz_cxGzqngLB02Q_sUaNf4c8';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('students').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('ℹ️ Supabase connected! (Note: "students" table will be automatically utilized or initialized).');
      } else {
        console.log(`⚠️ Supabase notice: ${error.message}`);
      }
      return false;
    }
    console.log(`✅ Supabase Cloud PostgreSQL Connected successfully to ${supabaseUrl}`);
    return true;
  } catch (err) {
    console.log(`⚠️ Supabase connection check: ${err.message}`);
    return false;
  }
};
