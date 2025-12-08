import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import { useAdminAuth } from "./context/AdminAuthContext";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import Index from "./pages/Index";
import ModulePage from "./pages/ModulePage";
import TrainingPage from "./pages/TrainingPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import PricingPage from "./pages/PricingPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckRequestPage from "./pages/CheckRequestPage";
import SubscriptionDashboardPage from "./pages/SubscriptionDashboardPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import { SubscriptionRequired } from "./components/auth/SubscriptionRequired";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminUserDetailPage from "./pages/admin/AdminUserDetailPage";
import AdminSubscriptionsPage from "./pages/admin/AdminSubscriptionsPage";
import AdminPlansPage from "./pages/admin/AdminPlansPage";
import AdminTokenPacksPage from "./pages/admin/AdminTokenPacksPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const AppRouter = () => {
  const { loading } = useAuthContext();
  const { adminLoading } = useAdminAuth();

  if (loading || adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><AuthPage initialMode="register" /></PublicRoute>} />
      <Route path="/pricing" element={<PricingPage />} />
      
      {/* Protected Subscription Routes */}
      <Route 
        path="/subscriptions" 
        element={
          <ProtectedRoute>
            <SubscriptionDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/checkout/:planSlug" 
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/check-request" 
        element={
          <ProtectedRoute>
            <CheckRequestPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected App Routes - Require Subscription */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <SubscriptionRequired showPaywall={false}>
              <Navigate to="/chat" replace />
            </SubscriptionRequired>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <SubscriptionRequired>
              <ProtectedLayout>
                <Index />
              </ProtectedLayout>
            </SubscriptionRequired>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/module/:moduleId" 
        element={
          <ProtectedRoute>
            <SubscriptionRequired>
              <ProtectedLayout>
                <ModulePage />
              </ProtectedLayout>
            </SubscriptionRequired>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/training" 
        element={
          <ProtectedRoute>
            <SubscriptionRequired>
              <ProtectedLayout>
                <TrainingPage />
              </ProtectedLayout>
            </SubscriptionRequired>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <SettingsPage />
            </ProtectedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/modules" 
        element={
          <ProtectedRoute>
            <SubscriptionRequired>
              <ProtectedLayout>
                <ModulePage />
              </ProtectedLayout>
            </SubscriptionRequired>
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route 
        path="/admin" 
        element={
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/payments" 
        element={
          <AdminProtectedRoute>
            <AdminPaymentsPage />
          </AdminProtectedRoute>
        } 
      />
      
      {/* Admin Pages */}
      <Route 
        path="/admin/users" 
        element={
          <AdminProtectedRoute>
            <AdminUsersPage />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users/:id" 
        element={
          <AdminProtectedRoute>
            <AdminUserDetailPage />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/subscriptions" 
        element={
          <AdminProtectedRoute>
            <AdminSubscriptionsPage />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/plans" 
        element={
          <AdminProtectedRoute>
            <AdminPlansPage />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/token-packs" 
        element={
          <AdminProtectedRoute>
            <AdminTokenPacksPage />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <AdminProtectedRoute>
            <AdminSettingsPage />
          </AdminProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
