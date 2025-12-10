import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAdminStatsRealtime } from "@/hooks/useAdminStatsRealtime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  CreditCard,
  TrendingUp,
  LogOut,
  BarChart3,
  Zap,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { adminLogout } = useAdminAuth();
  const {
    totalUsers,
    activeSubscriptions,
    pendingPayments,
    monthlyRevenue,
    totalRevenue,
    todaySignups,
    tokenUsage,
    isSubscribed,
  } = useAdminStatsRealtime();

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const totalActiveSubscriptions =
    (activeSubscriptions?.starter || 0) +
    (activeSubscriptions?.pro || 0) +
    (activeSubscriptions?.pro_plus || 0) +
    (activeSubscriptions?.enterprise || 0);

  const statCards = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Active Subscriptions",
      value: totalActiveSubscriptions.toString(),
      icon: CreditCard,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "Pending Payments",
      value: pendingPayments.toString(),
      icon: TrendingUp,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      title: "Monthly Revenue",
      value: `$${(monthlyRevenue / 100).toFixed(2)}`,
      icon: BarChart3,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              Welcome back to CyberScholar Administration
              {isSubscribed && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Real-time
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 bg-card border-primary/10 hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground text-sm">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Revenue Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-card border-primary/10">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Revenue Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm">This Month</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  ${(monthlyRevenue / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">All Time</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  ${(totalRevenue / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Token Usage</p>
                <p className="text-2xl font-bold text-cyan-400 mt-2 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {tokenUsage.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Subscription Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-card border-primary/10">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Subscription Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Starter</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {activeSubscriptions?.starter || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Pro</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {activeSubscriptions?.pro || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Pro Plus</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {activeSubscriptions?.pro_plus || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Enterprise</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {activeSubscriptions?.enterprise || 0}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-card border-primary/10">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Button
                onClick={() => navigate("/admin/payments?status=pending")}
                variant="outline"
                className="gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Review Payments
              </Button>
              <Button
                onClick={() => navigate("/admin/users")}
                variant="outline"
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Manage Users
              </Button>
              <Button
                onClick={() => navigate("/admin/info")}
                variant="outline"
                className="gap-2"
              >
                <Globe className="w-4 h-4" />
                Device & Network
              </Button>
              <Button
                onClick={() => navigate("/admin/subscriptions")}
                variant="outline"
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Subscriptions
              </Button>
              <Button
                onClick={() => navigate("/admin/settings")}
                variant="outline"
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
