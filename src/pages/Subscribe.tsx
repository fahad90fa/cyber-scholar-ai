import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Upload, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscription } from '@/hooks/useSubscription';
import { useBankSettings } from '@/hooks/useBankSettings';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatCurrency';
import { toast } from 'sonner';

export default function Subscribe() {
  const { planSlug } = useParams();
  const [searchParams] = useSearchParams();
  const billingCycle = (searchParams.get('cycle') || 'monthly') as 'monthly' | 'yearly';
  const navigate = useNavigate();
  
  const { user } = useAuthContext();
  const { plans } = useSubscription();
  const { bankSettings, loading: bankLoading } = useBankSettings();
  
  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const plan = plans.find(p => p.slug === planSlug);
  const price = plan ? (billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price) : 0;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Plan not found</p>
          <Button onClick={() => navigate('/pricing')}>View Plans</Button>
        </div>
      </div>
    );
  }

  const paymentReference = `CYBERSEC-${user?.id?.slice(0, 8).toUpperCase()}-${plan.slug.toUpperCase()}-${billingCycle.toUpperCase()}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async () => {
    if (!formData.transactionReference) {
      toast.error('Please enter the transaction reference');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('payment_requests').insert({
        user_id: user!.id,
        plan_id: plan.id,
        plan_name: plan.name,
        billing_cycle: billingCycle,
        amount: price,
        transaction_reference: formData.transactionReference,
        payment_date: formData.paymentDate,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Payment request submitted!');
      navigate('/payment-pending');
    } catch (error) {
      console.error('Failed to submit payment:', error);
      toast.error('Failed to submit payment request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate('/pricing')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Pricing
        </Button>

        {/* Plan Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{plan.name} Plan</p>
                <p className="text-sm text-muted-foreground capitalize">{billingCycle} billing</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(price)}</p>
                <p className="text-sm text-muted-foreground">
                  {plan.tokens_per_month.toLocaleString()} tokens/month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {step === 'details' && (
          <>
            {/* Bank Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Bank Transfer Details</CardTitle>
                <CardDescription>
                  Please transfer the exact amount to the following bank account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bankLoading ? (
                  <div className="text-muted-foreground">Loading bank details...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <BankField
                        label="Bank Name"
                        value={bankSettings?.bank_name || ''}
                        onCopy={copyToClipboard}
                        copied={copied}
                      />
                      <BankField
                        label="Account Holder"
                        value={bankSettings?.account_holder || ''}
                        onCopy={copyToClipboard}
                        copied={copied}
                      />
                      <BankField
                        label="Account Number"
                        value={bankSettings?.account_number || ''}
                        onCopy={copyToClipboard}
                        copied={copied}
                      />
                      <BankField
                        label="IBAN"
                        value={bankSettings?.iban || ''}
                        onCopy={copyToClipboard}
                        copied={copied}
                      />
                      <BankField
                        label="SWIFT/BIC"
                        value={bankSettings?.swift_code || ''}
                        onCopy={copyToClipboard}
                        copied={copied}
                      />
                      <BankField
                        label="Country"
                        value={bankSettings?.country || ''}
                        onCopy={copyToClipboard}
                        copied={copied}
                      />
                    </div>

                    <Alert className="bg-primary/10 border-primary/20">
                      <AlertDescription>
                        <strong>Payment Reference (IMPORTANT):</strong>
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
                        <p className="text-sm mt-2 text-muted-foreground">
                          Include this reference in your bank transfer description
                        </p>
                      </AlertDescription>
                    </Alert>

                    {bankSettings?.additional_instructions && (
                      <p className="text-sm text-muted-foreground">
                        {bankSettings.additional_instructions}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setStep('confirm')}>
                I've Made the Transfer
              </Button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Your Payment</CardTitle>
              <CardDescription>
                Please provide the details of your bank transfer
              </CardDescription>
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

              <div>
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information..."
                />
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your payment will be reviewed within 24-48 hours. Once confirmed, 
                  your subscription will be activated immediately.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep('details')}>
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

function BankField({ 
  label, 
  value, 
  onCopy, 
  copied 
}: { 
  label: string; 
  value: string; 
  onCopy: (text: string, field: string) => void;
  copied: string | null;
}) {
  if (!value) return null;
  
  return (
    <div>
      <Label className="text-muted-foreground text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}</span>
        <button
          onClick={() => onCopy(value, label)}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied === label ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}
