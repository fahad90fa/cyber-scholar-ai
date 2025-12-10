import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Copy, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import { useBankSettings } from '@/hooks/useBankSettings';
import { formatCurrency } from '@/lib/formatCurrency';
import { toast } from 'sonner';
import type { TokenPack } from '@/types/subscription.types';

export default function BuyTokens() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { bankSettings } = useBankSettings();
  
  const [packs, setPacks] = useState<TokenPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<TokenPack | null>(null);
  const [step, setStep] = useState<'select' | 'payment' | 'confirm'>('select');
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadPacks();
  }, [user, navigate]);

  const loadPacks = async () => {
    const { data } = await supabase
      .from('token_packs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    setPacks(data || []);
    setLoading(false);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async () => {
    if (!selectedPack || !formData.transactionReference) {
      toast.error('Please enter the transaction reference');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('token_pack_requests').insert({
        user_id: user!.id,
        token_pack_id: selectedPack.id,
        amount: selectedPack.price,
        transaction_reference: formData.transactionReference,
        payment_date: formData.paymentDate,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Token pack request submitted!');
      navigate('/token-pack-pending');
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentReference = selectedPack 
    ? `CYBERSEC-${user?.id?.slice(0, 8).toUpperCase()}-TOKENS-${selectedPack.tokens}`
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="text-center mb-8">
          <Coins className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Buy Token Packs</h1>
          <p className="text-muted-foreground">
            Purchase additional tokens to use with CyberSec AI
          </p>
        </div>

        {step === 'select' && (
          <div className="grid gap-4">
            {packs.map((pack) => (
              <Card 
                key={pack.id}
                className={`cursor-pointer transition-all ${
                  selectedPack?.id === pack.id 
                    ? 'border-primary shadow-lg' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedPack(pack)}
              >
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coins className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{pack.name}</p>
                      <p className="text-muted-foreground">
                        {pack.tokens.toLocaleString()} tokens
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(pack.price)}</p>
                    <p className="text-sm text-muted-foreground">
                      ${((pack.price / 100) / pack.tokens).toFixed(2)}/token
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {selectedPack && (
              <Button onClick={() => setStep('payment')} className="mt-4">
                Continue with {selectedPack.name}
              </Button>
            )}
          </div>
        )}

        {step === 'payment' && selectedPack && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Bank Transfer Details</CardTitle>
                <CardDescription>
                  Transfer {formatCurrency(selectedPack.price)} for {selectedPack.tokens} tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {bankSettings?.bank_name && (
                    <div>
                      <Label className="text-muted-foreground">Bank Name</Label>
                      <p className="font-medium">{bankSettings.bank_name}</p>
                    </div>
                  )}
                  {bankSettings?.account_holder && (
                    <div>
                      <Label className="text-muted-foreground">Account Holder</Label>
                      <p className="font-medium">{bankSettings.account_holder}</p>
                    </div>
                  )}
                  {bankSettings?.account_number && (
                    <div>
                      <Label className="text-muted-foreground">Account Number</Label>
                      <p className="font-medium">{bankSettings.account_number}</p>
                    </div>
                  )}
                  {bankSettings?.iban && (
                    <div>
                      <Label className="text-muted-foreground">IBAN</Label>
                      <p className="font-medium">{bankSettings.iban}</p>
                    </div>
                  )}
                </div>

                <Alert className="bg-primary/10 border-primary/20">
                  <AlertDescription>
                    <strong>Payment Reference:</strong>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="bg-background px-2 py-1 rounded text-sm flex-1">
                        {paymentReference}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentReference, 'reference')}
                      >
                        {copied === 'reference' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button onClick={() => setStep('confirm')} className="flex-1">
                I've Made the Transfer
              </Button>
            </div>
          </>
        )}

        {step === 'confirm' && selectedPack && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Your Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Transaction Reference / ID *</Label>
                <Input
                  value={formData.transactionReference}
                  onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                  placeholder="Your bank transaction reference"
                />
              </div>

              <div>
                <Label>Payment Date *</Label>
                <Input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                />
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your payment will be reviewed within 24-48 hours. 
                  Tokens will be added to your account once confirmed.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep('payment')}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                  {submitting ? 'Submitting...' : 'Submit Payment Confirmation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
