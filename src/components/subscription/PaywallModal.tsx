import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, Shield, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  canClose?: boolean;
  title?: string;
  message?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  open,
  onClose,
  canClose = true,
  title = 'Subscription Required',
  message = 'You need an active subscription to access AI features. Choose a plan to get started.',
}) => {
  const navigate = useNavigate();

  const handlePricingClick = () => {
    navigate('/pricing');
    onClose();
  };

  const handleSubscriptionClick = () => {
    navigate('/subscriptions');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={canClose ? onClose : undefined}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={e => !canClose && e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-destructive/10 mx-auto mb-4">
            <Lock className="w-6 h-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 rounded-lg bg-card border border-border/50">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Starter Plan</p>
                  <p className="text-xs text-muted-foreground">80 tokens/month - $49</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-card border border-primary/30 border-2">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Pro Plan (Popular)</p>
                  <p className="text-xs text-muted-foreground">500 tokens/month - $250</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border/50">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Pro Plus Plan</p>
                  <p className="text-xs text-muted-foreground">1500 tokens/month - $499</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Button
              onClick={handlePricingClick}
              className="w-full"
              variant="default"
            >
              View All Plans & Pricing
            </Button>
            {canClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Already have a subscription?{' '}
            <button
              onClick={handleSubscriptionClick}
              className="text-primary hover:underline font-semibold"
            >
              View your subscription
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
