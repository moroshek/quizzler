import { useEffect, useState } from 'react';
import { trackProgress } from '../lib/progress';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [progress, setProgress] = useState(0);
  const user = supabase.auth.getUser();

  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        const total = await trackProgress(user.id);
        setProgress(total);
      }
    };
    loadProgress();
  }, [user]);

  return (
    <div className="dashboard">
      <h2>Your Learning Progress</h2>
      <div className="progress-circle">
        {progress}
        <span>questions answered</span>
      </div>
      
      {!user && (
        <div className="guest-warning">
          You're in guest mode (15 question limit). 
          <button>Sign up to play unlimited</button>
        </div>
      )}
    </div>
  );
}
