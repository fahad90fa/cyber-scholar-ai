import { useState } from "react";
import { Zap, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

export function TokenBalance() {
  const { 
    subscription, 
    tokensRemaining, 
    isLoading, 
    hasActiveSubscription,
    profile
  } = useSubscription();
  const [showDetails, setShowDetails] = useState(false);



  if (isLoading) {
    return null;
  }

  // Use profile data for real-time updates, fallback to subscription
  const tokens = {
    total: profile?.tokens_total || subscription?.tokens_total || 0,
    used: profile?.tokens_used || subscription?.tokens_used || 0,
    available: tokensRemaining || 0,
  };

  const percentageUsed = tokens.total > 0 ? (tokens.used / tokens.total) * 100 : 0;
  const isLowTokens = tokens.available < 5;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className={`gap-2 ${isLowTokens ? "border-red-400/50 text-red-400" : ""}`}
      >
        <Zap className={`w-4 h-4 ${isLowTokens ? "fill-red-400" : ""}`} />
        <span className="font-mono text-sm">
          {tokens.available}/{tokens.total} Tokens
        </span>
        <ChevronDown className="w-3 h-3" />
      </Button>

      {showDetails && (
        <Card className="absolute right-0 top-full mt-2 p-4 w-72 bg-card border-primary/20 z-50">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-foreground">Monthly Tokens</p>
                <span className="text-xs text-muted-foreground">{tokens.total} total</span>
              </div>
              <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${percentageUsed}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-green-400">{tokens.available} available</span>
                <span className="text-xs text-red-400">{tokens.used} used</span>
              </div>
            </div>

            {hasActiveSubscription && (
              <div className="pt-2 border-t border-primary/10">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Active Subscription:</strong> You have an active subscription with monthly token allocation.
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-primary/10">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Subscription:</strong> {subscription ? `${subscription.plan_name} (${subscription.billing_cycle})` : 'Free Tier'}
              </p>
              <p className="text-xs text-muted-foreground">
                Each AI message uses 1 token. Upgrade your plan for more tokens!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
