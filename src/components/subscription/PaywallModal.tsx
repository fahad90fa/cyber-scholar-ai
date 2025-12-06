import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: 'no-subscription' | 'out-of-tokens' | 'banned';
}

export function PaywallModal({ open, onOpenChange, reason = 'no-subscription' }: PaywallModalProps) {
  const navigate = useNavigate();

  const content = {
    'no-subscription': {
      icon: Lock,
      title: 'Subscription Required',
      description: 'You need an active subscription to use CyberSec AI. Choose a plan that fits your needs.',
      action: 'View Plans',
      path: '/pricing',
    },
    'out-of-tokens': {
      icon: Zap,
      title: 'Out of Tokens',
      description: 'You\'ve used all your tokens for this month. Purchase additional tokens or wait for your monthly reset.',
      action: 'Buy Tokens',
      path: '/buy-tokens',
    },
    'banned': {
      icon: Shield,
      title: 'Account Suspended',
      description: 'Your account has been suspended. Please contact support for more information.',
      action: 'Contact Support',
      path: '/settings',
    },
  };

  const { icon: Icon, title, description, action, path } = content[reason];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={() => { onOpenChange(false); navigate(path); }}>
            {action}
          </Button>
          {reason !== 'banned' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
