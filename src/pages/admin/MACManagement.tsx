import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Trash2, RefreshCw, Lock } from 'lucide-react';

interface MACBinding {
  id: string;
  user_id: string;
  mac_address: string;
  mac_checksum: string;
  device_name: string;
  device_os: string;
  first_seen: string;
  last_seen: string;
  last_verified: string;
  is_active: boolean;
  verification_count: number;
  failed_verification_count: number;
  profiles: {
    email: string;
    username: string;
  };
}

interface MACStats {
  total_bindings: number;
  active_bindings: number;
  inactive_bindings: number;
  total_verifications: number;
  successful_verifications: number;
  failed_verifications: number;
  success_rate_percent: number;
}

interface VerificationLog {
  id: string;
  user_id: string;
  mac_address: string;
  expected_mac: string;
  verification_status: string;
  checksum_match: boolean;
  ip_address: string;
  user_agent: string;
  error_message: string;
  created_at: string;
}

export default function MACManagement() {
  const [bindings, setBindings] = useState<MACBinding[]>([]);
  const [stats, setStats] = useState<MACStats | null>(null);
  const [verificationLog, setVerificationLog] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBinding, setSelectedBinding] = useState<MACBinding | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bindingsData, statsData, logData] = await Promise.all([
        adminService.getMACBindings(100, 0),
        adminService.getMACStatistics(),
        adminService.getMACVerificationLog(undefined, 50, 0)
      ]) as [any, MACStats, any];
      
      setBindings(bindingsData?.bindings || []);
      setStats(statsData);
      setVerificationLog(logData?.logs || []);
    } catch (error) {
      console.error('Failed to load MAC data:', error);
      toast.error('Failed to load MAC management data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedBinding) return;

    try {
      await adminService.deactivateMACBinding(selectedBinding.id);
      toast.success('MAC binding deactivated. User will need to re-authenticate.');
      setDeactivateDialogOpen(false);
      setSelectedBinding(null);
      loadData();
    } catch (error) {
      toast.error('Failed to deactivate MAC binding');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">MAC Address Management</h1>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Bindings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_bindings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.active_bindings} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Bindings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active_bindings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.inactive_bindings} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_verifications}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Lifetime count
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.success_rate_percent}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.successful_verifications} successful
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="bindings" className="w-full">
        <TabsList>
          <TabsTrigger value="bindings">MAC Bindings</TabsTrigger>
          <TabsTrigger value="verification">Verification Log</TabsTrigger>
        </TabsList>

        <TabsContent value="bindings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All MAC Address Bindings</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Device identifiers bound to user accounts
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p>Loading MAC bindings...</p>
                </div>
              ) : bindings.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No MAC bindings found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Device OS</TableHead>
                        <TableHead>MAC Address</TableHead>
                        <TableHead>First Seen</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Verifications</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bindings.map((binding) => (
                        <TableRow key={binding.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{binding.profiles?.username || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{binding.profiles?.email || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{binding.device_os || 'Unknown'}</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {binding.mac_address}
                            </code>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(binding.first_seen)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(binding.last_seen)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="text-green-600">{binding.verification_count} ✓</p>
                              <p className="text-red-600">{binding.failed_verification_count} ✗</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {binding.is_active ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {binding.is_active && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedBinding(binding);
                                  setDeactivateDialogOpen(true);
                                }}
                              >
                                <Lock className="h-3 w-3 mr-1" />
                                Deactivate
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MAC Verification Log</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Recent verification attempts from all users
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p>Loading verification log...</p>
                </div>
              ) : verificationLog.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No verification logs found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current MAC</TableHead>
                        <TableHead>Expected MAC</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verificationLog.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {formatDate(log.created_at)}
                          </TableCell>
                          <TableCell>
                            {log.verification_status === 'success' ? (
                              <Badge className="bg-green-500 flex w-fit">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="flex w-fit">
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {log.mac_address ? log.mac_address : 'N/A'}
                            </code>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {log.expected_mac ? log.expected_mac : 'N/A'}
                            </code>
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.ip_address || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.error_message || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deactivate Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate MAC Binding</DialogTitle>
            <DialogDescription>
              This will force the user to re-authenticate from their device. They will need to log in again.
            </DialogDescription>
          </DialogHeader>
          {selectedBinding && (
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-medium">User:</span> {selectedBinding.profiles?.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Device:</span> {selectedBinding.device_name || selectedBinding.device_os}
              </p>
              <p className="text-sm">
                <span className="font-medium">MAC Address:</span>{' '}
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {selectedBinding.mac_address}
                </code>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivate}>
              Deactivate MAC Binding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
