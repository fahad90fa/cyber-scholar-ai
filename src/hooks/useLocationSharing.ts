import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationSharingState {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export function useLocationSharing() {
  const [state, setState] = useState<LocationSharingState>({
    enabled: false,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const updateLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (!navigator.geolocation) {
        setState(prev => ({
          ...prev,
          error: 'Geolocation not supported in this browser',
          loading: false,
        }));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { session } = (await supabase.auth.getSession()).data;
            if (!session) {
              setState(prev => ({
                ...prev,
                error: 'Not authenticated',
                loading: false,
              }));
              return;
            }

            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user-location`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                }),
              }
            );

            if (!response.ok) {
              const error = await response.json();
              setState(prev => ({
                ...prev,
                error: error.error || 'Failed to update location',
                loading: false,
              }));
              return;
            }

            setState(prev => ({
              ...prev,
              enabled: true,
              lastUpdated: new Date().toISOString(),
              loading: false,
            }));
          } catch (err) {
            setState(prev => ({
              ...prev,
              error: err instanceof Error ? err.message : 'Unknown error',
              loading: false,
            }));
          }
        },
        (error) => {
          setState(prev => ({
            ...prev,
            error: error.message || 'Failed to get location',
            loading: false,
          }));
        }
      );
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false,
      }));
    }
  }, []);

  const toggleLocationSharing = useCallback(async (enable: boolean) => {
    if (enable) {
      await updateLocation();
    } else {
      setState(prev => ({
        ...prev,
        enabled: false,
      }));
    }
  }, [updateLocation]);

  return {
    ...state,
    updateLocation,
    toggleLocationSharing,
  };
}
