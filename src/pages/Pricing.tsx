import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { plans, loading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planSlug: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/subscribe/${planSlug}?cycle=${billingCycle}`);
  };

  const getYearlySavings = (monthly: number, yearly: number) => {
    const yearlySavings = (monthly * 12) - yearly;
    return yearlySavings;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Zap className="h-3 w-3 mr-1" /> Paid AI Platform
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Get access to advanced cybersecurity AI education with custom training capabilities
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Label className={cn(billingCycle === 'monthly' && 'text-primary font-medium')}>
              Monthly
            </Label>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <Label className={cn(billingCycle === 'yearly' && 'text-primary font-medium')}>
              Yearly
              <Badge className="ml-2 bg-green-500/10 text-green-500 border-green-500/20">
                Save 2 months
              </Badge>
            </Label>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
            const savings = getYearlySavings(plan.monthly_price, plan.yearly_price);
            const features = plan.features || [];

            return (
              <Card 
                key={plan.id}
                className={cn(
                  "relative flex flex-col",
                  plan.is_popular && "border-primary shadow-lg shadow-primary/10 scale-105"
                )}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">
                      <Star className="h-3 w-3 mr-1" /> Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-6">
                    {plan.is_enterprise ? (
                      <div className="text-3xl font-bold">Contact Sales</div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold">
                          {formatCurrency(price)}
                          <span className="text-lg font-normal text-muted-foreground">
                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && savings > 0 && (
                          <p className="text-sm text-green-500 mt-1">
                            Save {formatCurrency(savings)}/year
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">
                    <Zap className="inline h-4 w-4 text-primary mr-1" />
                    {plan.tokens_per_month.toLocaleString()} tokens/month
                  </div>

                  <ul className="space-y-3">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.is_popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.slug)}
                  >
                    {plan.is_enterprise ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Token Packs Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Tokens?</h2>
          <p className="text-muted-foreground mb-6">
            Purchase additional token packs anytime
          </p>
          <Button variant="outline" onClick={() => navigate('/buy-tokens')}>
            View Token Packs
          </Button>
        </div>
      </div>
    </div>
  );
}
