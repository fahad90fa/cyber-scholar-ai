import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Ban, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { adminAction } from '@/services/adminService';
import { formatCurrency } from '@/lib/formatCurrency';
import { toast } from 'sonner';
import type { Profile, Subscription, PaymentRequest, TokenTransaction } from '@/types/subscription.types';

interface UserData {
  profile: Profile;
  subscriptions: Subscription[];
  payments: PaymentRequest[];
  transactions: TokenTransaction[];
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenModal, setTokenModal] = useState<'add' | 'remove' | null>(null);
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenReason, setTokenReason] = useState('');

  useEffect(() => {
    if (id) loadUserData();
  }, [id]);

  const loadUserData = async () => {
    try {
      const data = await adminAction('get_user', { userId: id });
      setUserData(data);
    } catch (error) {
      console.error('Failed to load user:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenAction = async () => {
    if (!tokenAmount || !tokenReason) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await adminAction(tokenModal === 'add' ? 'add_tokens' : 'remove_tokens', {
        userId: id,
        amount: parseInt(tokenAmount),
        reason: tokenReason,
      });
      toast.success(`Tokens ${tokenModal === 'add' ? 'added' : 'removed'} successfully`);
      setTokenModal(null);
      setTokenAmount('');
      setTokenReason('');
      loadUserData();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleBanToggle = async () => {
    if (!userData) return;
    try {
      if (userData.profile.is_banned) {
        await adminAction('unban_user', { userId: id });
        toast.success('User unbanned');
      } else {
        await adminAction('ban_user', { userId: id, reason: 'Banned by admin' });
        toast.success('User banned');
      }
      loadUserData();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!userData) {
    return <div className="p-8 text-center">User not found</div>;
  }

  const { profile, subscriptions, payments, transactions } = userData;
  const tokensRemaining = profile.tokens_total - profile.tokens_used;

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{profile.full_name || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Joined</Label>
              <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                {profile.is_banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge className="bg-green-500">Active</Badge>
                )}
              </div>
            </div>
            <Button
              variant={profile.is_banned ? 'default' : 'destructive'}
              onClick={handleBanToggle}
              className="w-full"
            >
              {profile.is_banned ? (
                <><CheckCircle className="h-4 w-4 mr-2" /> Unban User</>
              ) : (
                <><Ban className="h-4 w-4 mr-2" /> Ban User</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Plan</Label>
              <p className="font-medium capitalize">{profile.subscription_tier || 'None'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge variant="outline" className="capitalize">
                  {profile.subscription_status || 'No subscription'}
                </Badge>
              </div>
            </div>
            {subscriptions[0] && (
              <>
                <div>
                  <Label className="text-muted-foreground">Expires</Label>
                  <p className="font-medium">
                    {subscriptions[0].expires_at 
                      ? new Date(subscriptions[0].expires_at).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tokens Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{tokensRemaining}</div>
              <div className="text-muted-foreground">of {profile.tokens_total} remaining</div>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={() => setTokenModal('add')}
              >
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setTokenModal('remove')}
              >
                <Minus className="h-4 w-4 mr-2" /> Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Transactions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Token Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <Badge variant={tx.amount > 0 ? 'default' : 'secondary'}>
                      {tx.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className={tx.amount > 0 ? 'text-green-500' : 'text-red-500'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </TableCell>
                  <TableCell>{tx.balance_after}</TableCell>
                  <TableCell>{tx.reason || '-'}</TableCell>
                  <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No transactions yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.plan_name}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      payment.status === 'confirmed' ? 'default' :
                      payment.status === 'pending' ? 'secondary' :
                      'destructive'
                    }>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {payment.transaction_reference || '-'}
                  </TableCell>
                  <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No payments yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Token Modal */}
      <Dialog open={tokenModal !== null} onOpenChange={() => setTokenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tokenModal === 'add' ? 'Add Tokens' : 'Remove Tokens'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min="1"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="Number of tokens"
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                value={tokenReason}
                onChange={(e) => setTokenReason(e.target.value)}
                placeholder="Reason for this action..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTokenModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleTokenAction}>
              {tokenModal === 'add' ? 'Add Tokens' : 'Remove Tokens'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
