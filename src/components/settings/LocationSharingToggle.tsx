import { useEffect, useState } from 'react';
import { MapPin, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocationSharing } from '@/hooks/useLocationSharing';

export default function LocationSharingToggle() {
  const { enabled, loading, error, lastUpdated, toggleLocationSharing } = useLocationSharing();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasGeolocation = typeof navigator !== 'undefined' && !!navigator.geolocation;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground">Share Location for Security</h3>
            <p className="text-sm text-muted-foreground">
              Help us secure your account by sharing your device location
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!hasGeolocation && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-600">
            Geolocation is not supported in this browser
          </p>
        </div>
      )}

      {lastUpdated && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex gap-2">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-600">
            Location updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant={enabled ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleLocationSharing(!enabled)}
          disabled={!hasGeolocation || loading}
          className={enabled ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              {enabled ? 'Updating...' : 'Enabling...'}
            </>
          ) : enabled ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Enabled
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Enable
            </>
          )}
        </Button>

        {enabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleLocationSharing(false)}
            disabled={loading}
          >
            Disable
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Your location will be encrypted and used only for security verification.
        You can disable this anytime.
      </p>
    </div>
  );
}
