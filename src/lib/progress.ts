import { supabase } from './supabase';

interface UserProgress {
  user_id: string;
  total_questions: number;
  last_active: Date;
}

export const trackProgress = async (userId: string): Promise&lt;number&gt; => {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({ 
      user_id: userId,
      last_active: new Date().toISOString()
    })
    .select('total_questions')
    .single();

  if (error || !data) {
    console.error('Progress tracking error:', error);
    return 0;
  }

  return data.total_questions ?? 0;
};

export const incrementProgress = async (userId: string): Promise&lt;void&gt; => {
  const { error } = await supabase.rpc('increment_questions_answered', {
    user_id: userId
  });

  if (error) {
    console.error('Progress increment error:', error);
  }
};
