import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Database } from '@/integrations/supabase/types';

type TokenPackRequest = Database['public']['Tables']['token_pack_requests']['Row'];

export default function TokenPackPending() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [requests, setRequests] = useState<TokenPackRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadRequests();
  }, [user, navigate]);

  const loadRequests = async () => {
    const { data } = await supabase
      .from('token_pack_requests')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
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

  const pendingRequest = requests.find(r => r.status === 'pending');
  const confirmedRequest = requests.find(r => r.status === 'confirmed');

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container max-w-2xl mx-auto px-4">
        {confirmedRequest ? (
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Payment Confirmed!</CardTitle>
              <CardDescription>
                Your tokens have been added to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="font-medium">{confirmedRequest.tokens?.toLocaleString()} Tokens</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(confirmedRequest.amount || 0)}
                </p>
              </div>
              <Button onClick={() => navigate('/token-packs')} className="w-full">
                Buy More Tokens <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : pendingRequest ? (
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
                <p className="font-medium">{pendingRequest.tokens?.toLocaleString()} Tokens</p>
                <p className="text-sm text-muted-foreground mb-2">
                  {formatCurrency(pendingRequest.amount || 0)}
                </p>
                {pendingRequest.transaction_reference && (
                  <p className="text-xs text-muted-foreground">
                    Reference: {pendingRequest.transaction_reference}
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                You'll receive an email once your payment is confirmed and tokens are added.
              </p>
              <Button variant="outline" onClick={() => navigate('/token-packs')}>
                Back to Token Packs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>No Pending Requests</CardTitle>
              <CardDescription>
                You don't have any pending token pack requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/token-packs')}>
                Buy Tokens
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Request History */}
        {requests.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Token Pack History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className="font-medium">{request.tokens?.toLocaleString()} Tokens</p>
                        <p className="text-sm text-muted-foreground">
                          {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(request.amount || 0)}</p>
                      {getStatusBadge(request.status)}
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
