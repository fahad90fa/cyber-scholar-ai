import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

interface AuthPageProps {
  initialMode?: "login" | "register";
}

const AuthPage: React.FC<AuthPageProps> = ({ initialMode = "login" }) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        if (!username) {
          toast.error('Username is required');
          setLoading(false);
          return;
        }
        await register(email, username, password);
        toast.success('Account created!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-mono font-bold text-primary">CyberScholar</h1>
          <p className="text-muted-foreground text-sm">Cybersecurity Education Platform</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <Input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            disabled={loading}
          />
          {!isLogin && (
            <Input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              disabled={loading}
            />
          )}
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            minLength={8}
            disabled={loading}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setEmail('');
              setPassword('');
              setUsername('');
            }} 
            className="w-full text-sm text-muted-foreground hover:text-primary"
            disabled={loading}
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
