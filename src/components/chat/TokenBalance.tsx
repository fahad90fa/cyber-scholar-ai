import { useState, useEffect } from "react";
import { Zap, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function TokenBalance() {
  const { user } = useAuthContext();
  const [tokens, setTokens] = useState<{
    total: number;
    used: number;
    available: number;
    bonus: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const loadTokens = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("tokens_total, tokens_used, bonus_tokens")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setTokens({
          total: data?.tokens_total || 0,
          used: data?.tokens_used || 0,
          available: Math.max(
            0,
            (data?.tokens_total || 0) + (data?.bonus_tokens || 0) - (data?.tokens_used || 0)
          ),
          bonus: data?.bonus_tokens || 0,
        });
      } catch (err) {
        console.error("Failed to load token balance:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();

    const interval = setInterval(loadTokens, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (loading || !tokens) {
    return null;
  }

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

            {tokens.bonus > 0 && (
              <div className="pt-2 border-t border-primary/10">
                <p className="text-sm font-medium text-cyan-400">
                  Bonus Tokens: {tokens.bonus}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Purchased tokens that never expire
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-primary/10">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Free Tier:</strong> 20 tokens/month, resets on the 1st
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
