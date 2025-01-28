import { supabase } from './supabase';

export const trackProgress = async (userId: string) => {
  const { data } = await supabase
    .from('user_progress')
    .upsert({ user_id: userId, last_active: new Date() })
    .select('total_questions');
  
  return data?.[0]?.total_questions || 0;
};
