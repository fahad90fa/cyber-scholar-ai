import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, LogOut, ArrowLeft } from 'lucide-react';

const LogoutPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-mono font-bold text-primary">CyberScholar</h1>
          <p className="text-muted-foreground text-sm">Cybersecurity Education Platform</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <LogOut className="w-8 h-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Sign Out</h2>
            <p className="text-muted-foreground text-sm">
              Are you sure you want to log out of your account?
            </p>
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            <Button 
              variant="destructive" 
              onClick={handleLogout} 
              className="w-full h-11 text-base font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Yes, Logout
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              className="w-full h-11 text-base font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-xs text-muted-foreground font-mono">
          V1.0.0 • SESSION TERMINATION CONTROL
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;
