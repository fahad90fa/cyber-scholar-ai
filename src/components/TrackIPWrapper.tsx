import { ReactNode } from 'react';
import { useTrackIP } from '@/hooks/useTrackIP';

export function TrackIPWrapper({ children }: { children: ReactNode }) {
  useTrackIP();
  return <>{children}</>;
}
