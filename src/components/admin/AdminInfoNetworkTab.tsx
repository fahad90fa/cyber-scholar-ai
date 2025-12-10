import { Globe, HardDrive } from 'lucide-react';

interface Device {
  ip_current: string | null;
  ip_last_seen_at: string | null;
  mac_address: string | null;
}

interface IPHistory {
  id: string;
  ip: string;
  ip_version: string;
  first_seen_at: string;
  last_seen_at: string;
  geo_country: string | null;
  geo_city: string | null;
}

interface Props {
  device: Device | undefined;
  ipHistory: IPHistory[];
}

export default function AdminInfoNetworkTab({ device, ipHistory }: Props) {
  return (
    <div className="space-y-6">
      {/* Current IP */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          Current IP Address
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">IP Address</p>
            <p className="font-mono text-sm text-blue-400">
              {device?.ip_current || 'N/A'}
            </p>
          </div>
          {device?.ip_last_seen_at && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Seen</p>
              <p className="text-sm text-foreground">
                {new Date(device.ip_last_seen_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MAC Address */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-amber-400" />
          MAC Address
        </h3>
        <div>
          {device?.mac_address ? (
            <p className="font-mono text-sm text-amber-400">{device.mac_address}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Not available in web browsers (native app only)
            </p>
          )}
        </div>
      </div>

      {/* IP History */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-4">IP History</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {ipHistory.length > 0 ? (
            ipHistory.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-background rounded border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-sm text-blue-400">{entry.ip}</p>
                  <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                    {entry.ip_version.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p className="text-xs opacity-70">First Seen</p>
                    <p>{new Date(entry.first_seen_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Last Seen</p>
                    <p>{new Date(entry.last_seen_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {(entry.geo_country || entry.geo_city) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>
                      {entry.geo_city && entry.geo_country
                        ? `${entry.geo_city}, ${entry.geo_country}`
                        : entry.geo_country || entry.geo_city || 'Unknown'}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No IP history available</p>
          )}
        </div>
      </div>
    </div>
  );
}
