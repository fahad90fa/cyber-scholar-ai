import { useState, useMemo } from 'react';
import { useAdminLogs } from '@/hooks/useAdminLogs';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Radio, Code } from 'lucide-react';
import { motion } from 'framer-motion';

const timeRanges = [
  { label: 'Last 10 minutes', minutes: 10 },
  { label: 'Last 1 hour', minutes: 60 },
  { label: 'Last 24 hours', minutes: 1440 },
  { label: 'Last 7 days', minutes: 10080 },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'auth', label: 'Authentication' },
  { value: 'chat', label: 'Chat' },
  { value: 'training', label: 'Training' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'security', label: 'Security' },
];

const eventTypes = [
  { value: 'auth_login', label: 'Login' },
  { value: 'auth_logout', label: 'Logout' },
  { value: 'auth_signup', label: 'Signup' },
  { value: 'auth_password_change', label: 'Password Change' },
  { value: 'chat_message_sent', label: 'Chat Message' },
  { value: 'chat_session_created', label: 'Chat Session' },
  { value: 'training_document_uploaded', label: 'Document Uploaded' },
  { value: 'training_document_deleted', label: 'Document Deleted' },
  { value: 'subscription_activated', label: 'Subscription Activated' },
  { value: 'subscription_cancelled', label: 'Subscription Cancelled' },
  { value: 'payment_created', label: 'Payment Created' },
  { value: 'chat_password_set', label: 'Password Set' },
  { value: 'chat_password_failed', label: 'Password Failed' },
  { value: 'onboarding_completed', label: 'Onboarding Completed' },
  { value: 'profile_updated', label: 'Profile Updated' },
];

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    auth: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    chat: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    training: 'bg-green-500/20 text-green-400 border-green-500/30',
    subscription: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    security: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

const AdminLogsPage = () => {
  const [timeRange, setTimeRange] = useState<number>(1440);
  const [category, setCategory] = useState<string>('all');
  const [eventType, setEventType] = useState<string>('');
  const [emailSearch, setEmailSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [liveUpdates, setLiveUpdates] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fromDate = useMemo(() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - timeRange);
    return date.toISOString();
  }, [timeRange]);

  const { logs, total, totalPages, isLoading, isSubscribed, refetch } = useAdminLogs({
    category: category !== 'all' ? category : undefined,
    eventType: eventType || undefined,
    userId: emailSearch || undefined,
    fromDate,
    page,
    limit: 50,
    liveUpdates,
  });

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity Logs</h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              Real-time user activity monitoring
              {isSubscribed && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                  <Radio className="w-2 h-2 fill-green-400" />
                  Live
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-card border-primary/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time Range</label>
              <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(parseInt(v))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.minutes} value={range.minutes.toString()}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Event Type</label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All events</SelectItem>
                  {eventTypes.map((et) => (
                    <SelectItem key={et.value} value={et.value}>
                      {et.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Search Email/ID</label>
              <Input
                placeholder="user@example.com"
                value={emailSearch}
                onChange={(e) => {
                  setEmailSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Updates</label>
              <div className="flex gap-2 pt-1">
                <Button
                  variant={liveUpdates ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLiveUpdates(!liveUpdates)}
                  className="flex-1"
                >
                  {liveUpdates ? 'Live: ON' : 'Live: OFF'}
                </Button>
                <Button
                  variant={autoScroll ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAutoScroll(!autoScroll)}
                  className="flex-1"
                >
                  {autoScroll ? 'Auto: ON' : 'Auto: OFF'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Logs Table */}
        <Card className="bg-card border-primary/10 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[150px]">Time</TableHead>
                  <TableHead className="w-[150px]">User</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead className="w-[150px]">Event Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">IP</TableHead>
                  <TableHead className="w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && !logs.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border border-primary border-t-transparent" />
                        <p className="text-muted-foreground">Loading logs...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No logs found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{formatTime(log.created_at)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{log.email_snapshot || 'System'}</p>
                          {log.user_id && (
                            <p className="text-xs text-muted-foreground">{log.user_id.slice(0, 8)}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getCategoryColor(log.event_category)} border`}>
                          {log.event_category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{log.event_type}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate">
                          {log.description || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{log.ip_address}</p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="gap-1"
                        >
                          <Code className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total} logs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>Complete information for this audit log entry</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                  <p className="text-sm font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono">{selectedLog.user_id || 'System'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-mono">{selectedLog.email_snapshot || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                  <p className="text-sm font-mono">{selectedLog.ip_address}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Metadata (JSON)</p>
                <pre className="bg-background p-3 rounded border border-border text-xs overflow-auto max-h-48">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                <p className="text-xs font-mono break-all">{selectedLog.user_agent}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminLogsPage;
