import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subscriptionService, Subscription } from "@/services/subscriptionService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Calendar, CreditCard, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionDashboardPage = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tokens, setTokens] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const subChannel = supabase
      .channel(`subscriptions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('Subscription changed, reloading...');
          loadSubscriptionData();
        }
      )
      .subscribe((status) => {
        console.log('Subscription channel status:', status);
      });

    const profileChannel = supabase
      .channel(`profiles-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          console.log('Profile changed, reloading...');
          loadSubscriptionData();
        }
      )
      .subscribe((status) => {
        console.log('Profile channel status:', status);
      });

    return () => {
      supabase.removeChannel(subChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user?.id]);

  const loadSubscriptionData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      if (isRefresh) setRefreshing(true);
      const [subData, tokenData] = await Promise.all([
        subscriptionService.getUserSubscription().catch((error) => {
          console.error("Failed to load subscription:", error);
          return null;
        }),
        subscriptionService.getUserTokens().catch((error) => {
          console.error("Failed to load token balance:", error);
          return { total: 0, used: 0, available: 0 };
        }),
      ]);
      setSubscription(subData);
      setTokens(tokenData);
      if (isRefresh) toast.success("Subscription data updated");
    } catch (error: any) {
      console.error("Error loading subscription data:", error);
      if (isRefresh) toast.error("Failed to refresh subscription data");
    } finally {
      if (!isRefresh) setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const daysRemaining = subscription
    ? Math.max(
        0,
        Math.floor(
          (new Date(subscription.expires_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const tokenUsagePercentage = tokens
    ? (tokens.used / tokens.total) * 100
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Your Subscription
            </h1>
            <Button
              onClick={() => loadSubscriptionData(true)}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="gap-2"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {subscription ? (
            <div className="space-y-6">
              {/* Current Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 bg-card border-primary/10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-muted-foreground text-sm">Current Plan</p>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {subscription.plan_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Status</p>
                      <p className="text-lg font-semibold text-foreground mt-2 capitalize">
                        {subscription.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Billing Cycle</p>
                      <p className="text-lg font-semibold text-foreground mt-2 capitalize">
                        {subscription.billing_cycle}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Days Remaining</p>
                      <p className="text-2xl font-bold text-cyan-400 mt-2">
                        {daysRemaining}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Dates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-card border-primary/10">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Subscription Period
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-muted-foreground text-sm">Started</p>
                      <p className="text-foreground font-mono mt-1">
                        {new Date(subscription.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Expires</p>
                      <p className="text-foreground font-mono mt-1">
                        {new Date(subscription.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Token Usage */}
              {tokens && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-6 bg-card border-primary/10">
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Token Usage
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-foreground">
                            {tokens.used} / {tokens.total} tokens used
                          </span>
                          <span className="text-primary font-semibold">
                            {Math.round(tokenUsagePercentage)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-card border border-primary/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300"
                            style={{ width: `${tokenUsagePercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-muted-foreground text-sm">
                          {tokens.available} tokens available
                        </span>
                        <Button
                          onClick={() => navigate("/token-packs")}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Zap className="w-4 h-4" />
                          Buy More Tokens
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-card border-primary/10">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Manage Subscription
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => navigate("/pricing")}
                      variant="outline"
                      className="gap-2"
                    >
                      Change Plan
                    </Button>
                    <Button
                      onClick={() => navigate("/chat")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                    >
                      Go to AI Chat
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Free Tier Info */}
              <Card className="p-8 bg-green-400/5 border border-green-400/30">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    🎉 You're on the FREE Plan
                  </h2>
                  <p className="text-green-400 font-semibold mb-4">
                    Active & Ready to Use
                  </p>
                  <p className="text-muted-foreground mb-6">
                    You have access to 20 free AI chat tokens per month. Perfect for learning!
                  </p>
                  
                  {tokens && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-background/50 rounded-lg">
                        <p className="text-muted-foreground text-sm">Monthly Tokens</p>
                        <p className="text-2xl font-bold text-primary mt-2">{tokens.total}</p>
                      </div>
                      <div className="p-4 bg-background/50 rounded-lg">
                        <p className="text-muted-foreground text-sm">Tokens Used</p>
                        <p className="text-2xl font-bold text-red-400 mt-2">{tokens.used}</p>
                      </div>
                      <div className="p-4 bg-background/50 rounded-lg">
                        <p className="text-muted-foreground text-sm">Available</p>
                        <p className="text-2xl font-bold text-green-400 mt-2">{tokens.available}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => navigate("/chat")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      size="lg"
                    >
                      Start Chatting
                    </Button>
                    <Button
                      onClick={() => navigate("/pricing")}
                      variant="outline"
                      size="lg"
                    >
                      View Premium Plans
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Upgrade Benefits */}
              <Card className="p-6 bg-card border-primary/10">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Upgrade for More Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold text-foreground mb-2">Starter</p>
                    <p className="text-sm text-muted-foreground">80 tokens/month</p>
                    <p className="text-sm text-muted-foreground">$49/month</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Pro</p>
                    <p className="text-sm text-muted-foreground">500 tokens/month</p>
                    <p className="text-sm text-muted-foreground">$250/month</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">Pro Plus</p>
                    <p className="text-sm text-muted-foreground">1500 tokens/month</p>
                    <p className="text-sm text-muted-foreground">$499/month</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/pricing")}
                  variant="outline"
                  className="w-full mt-4"
                >
                  See All Plans
                </Button>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionDashboardPage;
