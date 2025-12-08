import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";

const AdminLoginPage = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin, isAdminAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate("/admin");
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminLogin(password);
      toast.success("Admin access granted");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message || "Invalid password");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access</h1>
          <p className="text-muted-foreground">CyberScholar Administration Panel</p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-card border border-primary/10 rounded-lg p-6 space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <label className="text-sm font-medium text-foreground block mb-2">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-primary/50" />
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pl-10"
                autoFocus
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              {loading ? "Verifying..." : "Enter Admin Panel"}
            </Button>
          </motion.div>
        </motion.form>

        <motion.p
          className="text-center text-xs text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Secure admin-only access. Session expires after 24 hours.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
