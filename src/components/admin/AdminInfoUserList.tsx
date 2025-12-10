import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Globe } from 'lucide-react';

interface UserListItem {
  id: string;
  email: string;
  full_name: string | null;
  current_ip: string;
  last_seen: string | null;
}

interface Props {
  users: UserListItem[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

export default function AdminInfoUserList({ users, selectedUserId, onSelectUser }: Props) {
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-card/50 sticky top-0">
        <Input
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(user => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user.id)}
            className={`w-full text-left p-4 border-b border-border transition-colors ${
              selectedUserId === user.id
                ? 'bg-primary/10 border-primary/50'
                : 'hover:bg-card/80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <p className="text-xs font-mono text-blue-400">
                    {user.current_ip}
                  </p>
                </div>
                {user.last_seen && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(user.last_seen).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
