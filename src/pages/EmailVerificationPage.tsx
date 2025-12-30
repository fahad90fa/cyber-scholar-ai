import React, { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Mail, Terminal, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const EmailVerificationPage = () => {
  const { user, logout } = useAuthContext();
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    // Simulate API call for resending verification email
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-2xl bg-black border border-primary/30 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        {/* Terminal Header */}
        <div className="bg-muted px-4 py-2 border-b border-primary/30 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Lock className="w-3 h-3" />
            SECURE_SESSION: AUTH_REQUIRED
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex justify-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-full bg-primary/10 border border-primary/20 relative"
            >
              <Mail className="w-12 h-12 text-primary" />
              <motion.div 
                className="absolute -top-1 -right-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Shield className="w-5 h-5 text-primary" />
              </motion.div>
            </motion.div>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-primary tracking-tighter">
              &gt; IDENTITY_VERIFICATION_PENDING
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Access to CyberScholar modules is currently <span className="text-red-500">LOCKED</span>. 
              Please verify your email address to establish a secure connection.
            </p>
          </div>

          <div className="bg-muted/50 border border-primary/10 rounded p-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-primary font-bold">STATUS:</span>
              <span className="text-yellow-500 animate-pulse">Awaiting Verification Packet...</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-primary font-bold">TARGET:</span>
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleResend}
              disabled={isResending}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isResending ? 'TRANSMITTING...' : 'RESEND_VERIFICATION_PACKET'}
            </Button>
            <Button 
              variant="outline"
              onClick={logout}
              className="flex-1 border-primary/20 text-primary hover:bg-primary/10"
            >
              TERMINATE_SESSION
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              CyberScholar OS v2.0.4 // Security Protocol Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
