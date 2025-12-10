import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAdminUserList, useAdminUserInfo } from '@/hooks/useAdminUserInfo';
import AdminInfoUserList from '@/components/admin/AdminInfoUserList';
import AdminInfoDetail from '@/components/admin/AdminInfoDetail';

export default function AdminInfoPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { users, loading, error, fetchUserList } = useAdminUserList();
  const userDetail = useAdminUserInfo(selectedUserId);

  useEffect(() => {
    fetchUserList();
  }, [fetchUserList]);

  useEffect(() => {
    if (selectedUserId) {
      userDetail.fetchUserInfo();
    }
  }, [selectedUserId, userDetail.fetchUserInfo]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="px-6 py-4 border-b border-border bg-card/30 backdrop-blur-sm">
        <h1 className="text-lg font-semibold text-foreground">User Device & Network Info</h1>
        <p className="text-sm text-muted-foreground">
          View IP addresses, device info, and location history for all users
        </p>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* User List */}
        <div className="w-1/3 border-r border-border overflow-y-auto bg-card/50">
          {error && (
            <div className="p-4 m-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <AdminInfoUserList
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
            />
          )}
        </div>

        {/* Detail Panel */}
        <div className="w-2/3 overflow-y-auto">
          {selectedUserId ? (
            <AdminInfoDetail userDetail={userDetail} />
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-muted-foreground mb-2">Select a user to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
