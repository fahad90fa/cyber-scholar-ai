import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface Device {
  last_lat: number | null;
  last_lng: number | null;
  location_updated_at: string | null;
}

interface Props {
  device: Device;
}

interface GoogleMapsWindow extends Window {
  google: {
    maps: {
      Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
      Marker: new (options: Record<string, unknown>) => GoogleMarker;
    };
  };
}

interface GoogleMap {
  setCenter: (location: Record<string, number>) => void;
}

interface GoogleMarker {
  setMap: (map: GoogleMap | null) => void;
}

export default function AdminInfoLocationTab({ device }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<GoogleMap | null>(null);

  useEffect(() => {
    if (!mapRef.current || !device.last_lat || !device.last_lng) return;

    const loadMap = async () => {
      const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!googleMapsApiKey) {
        console.warn('Google Maps API key not configured');
        return;
      }

      if (!(window as GoogleMapsWindow).google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
        script.async = true;
        document.head.appendChild(script);
        script.onload = initMap;
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapRef.current) return;

      const center = { lat: device.last_lat!, lng: device.last_lng! };
      const googleWindow = window as GoogleMapsWindow;

      mapInstance.current = new googleWindow.google.maps.Map(mapRef.current, {
        zoom: 12,
        center,
        mapTypeId: 'roadmap',
      });

      new googleWindow.google.maps.Marker({
        position: center,
        map: mapInstance.current,
        title: 'Last Known Location',
      });
    };

    loadMap();
  }, [device]);

  if (!device.last_lat || !device.last_lng) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-red-400" />
        Last Known Location
      </h3>

      <div className="space-y-4">
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-2">Coordinates</p>
          <p className="font-mono text-sm text-foreground">
            {device.last_lat.toFixed(6)}, {device.last_lng.toFixed(6)}
          </p>
        </div>

        {device.location_updated_at && (
          <div className="bg-background rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Last Updated</p>
            <p className="text-sm text-foreground">
              {new Date(device.location_updated_at).toLocaleString()}
            </p>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg bg-muted border border-border/50"
          style={{ minHeight: '300px' }}
        />
      </div>
    </div>
  );
}


