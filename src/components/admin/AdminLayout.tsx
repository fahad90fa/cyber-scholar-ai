import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Zap,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { adminLogout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: CreditCard, label: "Subscriptions", href: "/admin/subscriptions" },
    { icon: Zap, label: "Payments", href: "/admin/payments" },
    { icon: Shield, label: "Plans", href: "/admin/plans" },
    { icon: Zap, label: "Token Packs", href: "/admin/token-packs" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-primary/10 transform transition-transform duration-300 z-40 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <p className="font-bold text-foreground">CyberScholar</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary/10">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-primary/10 px-6 py-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-muted-foreground hover:text-primary"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
