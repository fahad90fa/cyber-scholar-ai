import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTrackIP() {
  useEffect(() => {
    const trackIP = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) return;

        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-user-ip`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (err) {
        console.debug('IP tracking error:', err);
      }
    };

    trackIP();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      trackIP();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);
}
