import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminAction } from '@/services/adminService';
import { formatCurrency } from '@/lib/formatCurrency';
import { toast } from 'sonner';
import type { PaymentRequest } from '@/types/subscription.types';

interface PaymentWithUser extends PaymentRequest {
  profiles: {
    email: string;
    full_name: string;
  } | null;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithUser | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'reject' | 'view' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await adminAction('get_payments');
      setPayments(data || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedPayment) return;

    try {
      await adminAction('confirm_payment', {
        paymentId: selectedPayment.id,
        adminNotes,
        userId: selectedPayment.user_id,
        planId: selectedPayment.plan_id,
        billingCycle: selectedPayment.billing_cycle,
        amount: selectedPayment.amount,
        tokens: selectedPayment.billing_cycle === 'yearly' ? 500 * 12 : 500, // Default to Pro tokens
      });
      toast.success('Payment confirmed and subscription activated');
      setActionType(null);
      setSelectedPayment(null);
      setAdminNotes('');
      loadPayments();
    } catch (error) {
      toast.error('Failed to confirm payment');
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await adminAction('reject_payment', {
        paymentId: selectedPayment.id,
        reason: rejectionReason,
      });
      toast.success('Payment rejected');
      setActionType(null);
      setSelectedPayment(null);
      setRejectionReason('');
      loadPayments();
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const otherPayments = payments.filter(p => p.status !== 'pending');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const PaymentTable = ({ paymentList, showActions = false }: { paymentList: PaymentWithUser[], showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymentList.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              <div>
                <div className="font-medium">{payment.profiles?.full_name || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">{payment.profiles?.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{payment.plan_name}</div>
                <div className="text-sm text-muted-foreground capitalize">{payment.billing_cycle}</div>
              </div>
            </TableCell>
            <TableCell>{formatCurrency(payment.amount)}</TableCell>
            <TableCell className="font-mono text-sm max-w-[150px] truncate">
              {payment.transaction_reference || '-'}
            </TableCell>
            <TableCell>{getStatusBadge(payment.status)}</TableCell>
            <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedPayment(payment);
                    setActionType('view');
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {showActions && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-500"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setActionType('confirm');
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setActionType('reject');
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {paymentList.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              No payments found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Payment Management</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Payments ({payments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payment Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <PaymentTable paymentList={pendingPayments} showActions />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <PaymentTable paymentList={otherPayments} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Payment Modal */}
      <Dialog open={actionType === 'view'} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p>{selectedPayment.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.profiles?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Plan</Label>
                  <p>{selectedPayment.plan_name} ({selectedPayment.billing_cycle})</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-bold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Transaction Reference</Label>
                  <p className="font-mono">{selectedPayment.transaction_reference || 'Not provided'}</p>
                </div>
                {selectedPayment.payment_date && (
                  <div>
                    <Label className="text-muted-foreground">Payment Date</Label>
                    <p>{new Date(selectedPayment.payment_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Payment Modal */}
      <Dialog open={actionType === 'confirm'} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              This will activate the subscription for the user.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p><strong>User:</strong> {selectedPayment.profiles?.email}</p>
                <p><strong>Plan:</strong> {selectedPayment.plan_name} ({selectedPayment.billing_cycle})</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</p>
              </div>
              <div>
                <Label>Admin Notes (Optional)</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button onClick={handleConfirm} className="bg-green-500 hover:bg-green-600">
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Payment Modal */}
      <Dialog open={actionType === 'reject'} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
