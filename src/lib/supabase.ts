import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Session validation middleware
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session) {
    const { error } = await supabase
      .from('sessions')
      .upsert({ 
        user_id: session.user.id, 
        refreshed_at: new Date().toISOString() 
      });
      
    if (error) {
      console.error('Session tracking error:', error);
      supabase.auth.signOut();
    }
  }
});
