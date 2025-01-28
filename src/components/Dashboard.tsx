import { useEffect, useState } from 'react';
import { trackProgress } from '../lib/progress';
import { supabase } from '../lib/supabase';
import { AuthForm } from './AuthForm';

export default function Dashboard() {
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState(supabase.auth.user());
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => authListener?.unsubscribe();
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const total = await trackProgress(user.id);
          setProgress(total);
        }
      } catch (err) {
        setError('Failed to load progress');
        console.error('Progress load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [user]);

  if (loading) return &lt;div className="loading"&gt;Loading...&lt;/div&gt;;

  return (
    &lt;div className="dashboard"&gt;
      {showAuth &amp;&amp; &lt;AuthForm onSuccessfulAuth={() => setShowAuth(false)} /&gt;}
      &lt;h2&gt;Your Learning Progress&lt;/h2&gt;
      {error &amp;&amp; &lt;div className="error-banner"&gt;{error}&lt;/div&gt;}
      
      &lt;div className="progress-circle"&gt;
        {progress}
        &lt;span&gt;questions answered&lt;/span&gt;
      &lt;/div&gt;

      {!user ? (
        &lt;div className="guest-warning"&gt;
          You're in guest mode (15 question limit). 
          &lt;button 
            onClick={() => setShowAuth(true)}
            aria-label="Sign up for unlimited access"
          &gt;
            Sign up to play unlimited
          &lt;/button&gt;
        &lt;/div&gt;
      ) : (
        &lt;div className="account-info"&gt;
          Logged in as: {user.email}
          &lt;button 
            onClick={() => supabase.auth.signOut()}
            className="sign-out"
          &gt;
            Sign Out
          &lt;/button&gt;
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  );
}
