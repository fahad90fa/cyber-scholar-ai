import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subscriptionService, SubscriptionPlan } from "@/services/subscriptionService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const PricingPage = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data.sort((a, b) => a.sort_order - b.sort_order));
    } catch (error: any) {
      toast.error("Failed to load pricing plans");
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    const price =
      billingCycle === "monthly" ? plan.monthly_price : plan.yearly_price;
    return (price / 100).toFixed(2);
  };

  const getSavings = (plan: SubscriptionPlan) => {
    if (plan.is_enterprise) return null;
    const monthlyCost = (plan.monthly_price / 100) * 12;
    const yearlyCost = plan.yearly_price / 100;
    return Math.round(monthlyCost - yearlyCost);
  };

  const handleSelectPlan = (planSlug: string) => {
    navigate(`/checkout/${planSlug}?cycle=${billingCycle}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your cybersecurity journey. All plans include
            access to our AI tutor and learning modules.
          </p>
          
          {/* Free Tier Banner */}
          <div className="mt-8 p-4 bg-green-400/10 border border-green-400/30 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-green-400">
              <strong>🎉 Everyone gets FREE access!</strong> Start with 20 free tokens per month - no credit card required.
              Upgrade anytime for more tokens and premium features.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                billingCycle === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              {billingCycle === "yearly" && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full whitespace-nowrap">
                  Save 2 months!
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {plans.map((plan, index) => {
            const savings = getSavings(plan);
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative rounded-2xl border transition-all duration-300 flex flex-col h-full ${
                    plan.is_popular
                      ? "border-primary/50 bg-card ring-2 ring-primary/20 md:scale-105 shadow-xl shadow-primary/10"
                      : "border-primary/10 bg-card hover:border-primary/30"
                  }`}
                >
                  {plan.is_popular && (
                    <motion.div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Most Popular
                    </motion.div>
                  )}

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      {plan.is_enterprise ? (
                        <div>
                          <p className="text-muted-foreground text-sm">Custom Pricing</p>
                          <p className="text-3xl font-bold text-foreground mt-2">
                            Contact Sales
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold text-foreground">
                            ${getPrice(plan)}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            /{billingCycle === "monthly" ? "month" : "year"}
                          </span>
                          {savings && billingCycle === "yearly" && (
                            <p className="text-xs text-primary mt-2">
                              Save ${savings}/year vs monthly
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tokens */}
                    <div className="mb-6 p-4 bg-secondary/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Monthly Tokens</p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {plan.tokens_per_month === 999999
                          ? "Unlimited"
                          : plan.tokens_per_month.toLocaleString()}
                      </p>
                    </div>

                    {/* CTA */}
                    {!plan.is_enterprise && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => handleSelectPlan(plan.slug)}
                          className="w-full mb-6"
                          variant={plan.is_popular ? "default" : "outline"}
                          size="lg"
                        >
                          Choose Plan
                        </Button>
                      </motion.div>
                    )}

                    {plan.is_enterprise && (
                      <Button
                        onClick={() => {
                          toast.success("Redirecting to contact form...");
                        }}
                        className="w-full mb-6"
                        variant="outline"
                        size="lg"
                      >
                        Contact Sales
                      </Button>
                    )}

                    {/* Features */}
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.05 }}
                        >
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground text-sm">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          className="mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card className="p-6 bg-card border-primary/10">
              <h3 className="font-semibold text-foreground mb-2">
                What is a token?
              </h3>
              <p className="text-muted-foreground text-sm">
                1 token = 1 AI interaction (your question + AI response). Tokens are
                allocated monthly and do not roll over to the next month.
              </p>
            </Card>
            <Card className="p-6 bg-card border-primary/10">
              <h3 className="font-semibold text-foreground mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can change your plan at any time. Changes take effect
                immediately.
              </p>
            </Card>
            <Card className="p-6 bg-card border-primary/10">
              <h3 className="font-semibold text-foreground mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground text-sm">
                We accept bank transfers. After selecting a plan, you'll receive
                detailed bank account information.
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
