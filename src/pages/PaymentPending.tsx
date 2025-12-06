import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatCurrency';
import type { PaymentRequest } from '@/types/subscription.types';

export default function PaymentPending() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadPayments();
  }, [user, navigate]);

  const loadPayments = async () => {
    const { data } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    // @ts-ignore - billing_cycle type
    setPayments(data || []);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  const pendingPayment = payments.find(p => p.status === 'pending');
  const confirmedPayment = payments.find(p => p.status === 'confirmed');

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container max-w-2xl mx-auto px-4">
        {confirmedPayment ? (
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Payment Confirmed!</CardTitle>
              <CardDescription>
                Your subscription is now active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="font-medium">{confirmedPayment.plan_name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(confirmedPayment.amount)} - {confirmedPayment.billing_cycle}
                </p>
              </div>
              <Button onClick={() => navigate('/')} className="w-full">
                Start Using CyberSec AI <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : pendingPayment ? (
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
              <CardTitle className="text-2xl">Payment Under Review</CardTitle>
              <CardDescription>
                We're verifying your payment. This usually takes 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="font-medium">{pendingPayment.plan_name}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  {formatCurrency(pendingPayment.amount)} - {pendingPayment.billing_cycle}
                </p>
                <p className="text-xs text-muted-foreground">
                  Reference: {pendingPayment.transaction_reference}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                You'll receive an email once your subscription is activated.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>No Pending Payments</CardTitle>
              <CardDescription>
                You don't have any pending payment requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/pricing')}>
                View Plans
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium">{payment.plan_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
