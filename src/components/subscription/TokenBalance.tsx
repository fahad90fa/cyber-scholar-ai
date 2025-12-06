import { Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TokenBalanceProps {
  used: number;
  total: number;
  showProgress?: boolean;
  className?: string;
}

export function TokenBalance({ used, total, showProgress = true, className }: TokenBalanceProps) {
  const remaining = Math.max(0, total - used);
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const isLow = percentage > 80;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Zap className={cn("h-4 w-4", isLow ? "text-destructive" : "text-primary")} />
          <span className="font-medium">
            {remaining.toLocaleString()} tokens remaining
          </span>
        </div>
        <span className="text-muted-foreground">
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      {showProgress && (
        <Progress 
          value={100 - percentage} 
          className={cn("h-2", isLow && "[&>div]:bg-destructive")}
        />
      )}
      {isLow && remaining > 0 && (
        <p className="text-xs text-destructive">
          Running low on tokens! Consider buying more.
        </p>
      )}
    </div>
  );
}
