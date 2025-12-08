import { useState } from "react";
import { useAdminSubscriptionsRealtime } from "@/hooks/useAdminSubscriptionsRealtime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const AdminSubscriptionsPage = () => {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { subscriptions, totalPages, isLoading, isSubscribed } = useAdminSubscriptionsRealtime({
    plan: filterPlan === "all" ? undefined : filterPlan,
    status: filterStatus === "all" ? undefined : filterStatus,
    page: currentPage,
    limit: itemsPerPage,
  });

  const getPlanBadge = (plan: string) => {
    const colors: { [key: string]: string } = {
      starter: "bg-blue-400/20 text-blue-400",
      pro: "bg-purple-400/20 text-purple-400",
      pro_plus: "bg-cyan-400/20 text-cyan-400",
      enterprise: "bg-green-400/20 text-green-400",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${colors[plan] || "bg-gray-400/20 text-gray-400"}`}
      >
        {plan}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      active: "bg-green-400/20 text-green-400",
      expired: "bg-red-400/20 text-red-400",
      cancelled: "bg-yellow-400/20 text-yellow-400",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || "bg-gray-400/20 text-gray-400"}`}
      >
        {status}
      </span>
    );
  };

  const daysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return Math.max(0, days);
  };

  if (isLoading && currentPage === 1) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading subscriptions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Subscriptions Management
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            View and manage all user subscriptions
            {isSubscribed && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Real-time
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-card border-primary/10 space-y-4">
          <div className="flex gap-4 flex-col lg:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="pro_plus">Pro Plus</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Subscriptions Table */}
        <Card className="p-6 bg-card border-primary/10 overflow-x-auto">
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No subscriptions found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Billing
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Period
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Days Left
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Tokens
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {sub.profiles?.full_name || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.profiles?.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getPlanBadge(sub.plan_name)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-foreground">
                        {sub.billing_cycle}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(sub.started_at).toLocaleDateString()} -{" "}
                      {new Date(sub.expires_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-foreground">
                        {daysRemaining(sub.expires_at)} days
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">
                        {sub.tokens_used}/{sub.tokens_total}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono">
                        ${(sub.price_paid / 100).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" className="text-xs">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSubscriptionsPage;
