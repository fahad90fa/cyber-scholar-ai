import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminUsersRealtime } from "@/hooks/useAdminUsersRealtime";
import { adminService } from "@/services/adminService";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  Shield,
} from "lucide-react";

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [isAddTokensOpen, setIsAddTokensOpen] = useState(false);
  const [isRemoveTokensOpen, setIsRemoveTokensOpen] = useState(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isRemovePlanOpen, setIsRemovePlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [planLoading, setPlanLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const adminToken = localStorage.getItem("admin_token");
        if (!adminToken) {
          console.warn("No admin token found");
          setPlansLoading(false);
          return;
        }
        
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        
        const response = await fetch(`${apiUrl}/api/v1/admin/plans`, {
          headers: {
            "Authorization": `Bearer ${adminToken}`,
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Plans fetch failed:", response.status, errorText);
          setPlansLoading(false);
          return;
        }
        
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const { users, total, totalPages, isLoading, invalidateUsers, isSubscribed } = useAdminUsersRealtime({
    search: search || undefined,
    tier: filterTier === "all" ? undefined : filterTier,
    status: filterStatus === "all" ? undefined : filterStatus,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const handleAddTokens = async () => {
    if (!selectedUserId || !tokenAmount) return;
    try {
      const amount = parseInt(tokenAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Invalid token amount");
        return;
      }
      await adminService.addTokens(selectedUserId, amount, "bonus", "Added via admin panel");
      queryClient.invalidateQueries({
        queryKey: ['profile', selectedUserId],
      });
      toast.success("Tokens added successfully");
      setTokenAmount("");
      setSelectedUserId(null);
      setIsAddTokensOpen(false);
      invalidateUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to add tokens");
    }
  };

  const handleRemoveTokens = async () => {
    if (!selectedUserId || !tokenAmount) return;
    try {
      const amount = parseInt(tokenAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Invalid token amount");
        return;
      }
      await adminService.removeTokens(selectedUserId, amount, "adjustment", "Removed via admin panel");
      queryClient.invalidateQueries({
        queryKey: ['profile', selectedUserId],
      });
      toast.success("Tokens removed successfully");
      setTokenAmount("");
      setSelectedUserId(null);
      setIsRemoveTokensOpen(false);
      invalidateUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove tokens");
    }
  };

  const handleAddPlan = async () => {
    if (!selectedUserId || !selectedPlan) return;
    try {
      setPlanLoading(true);
      await adminService.activateSubscription(selectedUserId, selectedPlan, selectedBillingCycle);
      queryClient.invalidateQueries({
        queryKey: ['profile', selectedUserId],
      });
      toast.success("Plan activated successfully");
      setSelectedPlan("");
      setSelectedUserId(null);
      setIsAddPlanOpen(false);
      invalidateUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to activate plan");
    } finally {
      setPlanLoading(false);
    }
  };

  const handleRemovePlan = async () => {
    if (!selectedUserId) return;
    if (!window.confirm("Are you sure you want to cancel this user's subscription?")) {
      return;
    }
    try {
      setPlanLoading(true);
      const user = users.find((u) => u.id === selectedUserId);
      if (!user) {
        toast.error("User not found");
        return;
      }
      await adminService.cancelSubscription(user.id, "Cancelled by admin");
      queryClient.invalidateQueries({
        queryKey: ['profile', selectedUserId],
      });
      toast.success("Subscription cancelled successfully");
      setSelectedUserId(null);
      setIsRemovePlanOpen(false);
      invalidateUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel subscription");
    } finally {
      setPlanLoading(false);
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    if (
      !window.confirm(
        isBanned
          ? "Are you sure you want to unban this user?"
          : "Are you sure you want to ban this user?"
      )
    ) {
      return;
    }

    try {
      toast.success(isBanned ? "User unbanned" : "User banned");
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const getSubscriptionBadge = (tier: string | null) => {
    if (!tier || tier === "none") return null;
    const colors: { [key: string]: string } = {
      starter: "bg-blue-400/20 text-blue-400",
      pro: "bg-purple-400/20 text-purple-400",
      pro_plus: "bg-cyan-400/20 text-cyan-400",
      enterprise: "bg-green-400/20 text-green-400",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${colors[tier] || "bg-gray-400/20 text-gray-400"}`}
      >
        {tier}
      </span>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status || status === "none")
      return <span className="text-xs text-muted-foreground">None</span>;
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

  if (isLoading && currentPage === 1) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            Manage all user accounts and subscriptions
            {isSubscribed && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Real-time
              </span>
            )}
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-card border-primary/10 space-y-4">
          <div className="flex gap-4 flex-col lg:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="pro_plus">Pro Plus</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="none">No Subscription</SelectItem>
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

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Join Date</SelectItem>
                <SelectItem value="last_active">Last Active</SelectItem>
                <SelectItem value="full_name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              }
              className="gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === "asc" ? "ASC" : "DESC"}
            </Button>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6 bg-card border-primary/10 overflow-x-auto">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Tier
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Tokens
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Joined
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {user.full_name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">
                          {user.full_name || "N/A"}
                        </span>
                        {user.is_banned && (
                          <Shield className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-muted-foreground">{user.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      {getSubscriptionBadge(user.subscription_tier)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(user.subscription_status)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">
                        {user.tokens_used}/{user.tokens_total}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            View
                          </Button>
                          <Button
                            onClick={() =>
                              handleBanUser(user.id, user.is_banned)
                            }
                            variant="outline"
                            size="sm"
                            className={`text-xs ${
                              user.is_banned
                                ? "text-green-400 hover:text-green-300"
                                : "text-red-400 hover:text-red-300"
                            }`}
                          >
                            {user.is_banned ? "Unban" : "Ban"}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={isAddPlanOpen && selectedUserId === user.id} onOpenChange={(open) => {
                            setIsAddPlanOpen(open);
                            if (open) setSelectedUserId(user.id);
                          }}>
                            <Button
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setIsAddPlanOpen(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-cyan-400 hover:text-cyan-300"
                            >
                              +Plan
                            </Button>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Plan</DialogTitle>
                                <DialogDescription>
                                  Assign a subscription plan to {user.full_name || user.email}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Plan</label>
                                  <Select value={selectedPlan} onValueChange={setSelectedPlan} disabled={plansLoading}>
                                    <SelectTrigger>
                                      <SelectValue placeholder={plansLoading ? "Loading plans..." : "Select a plan"} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                      {plans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                          {plan.name} ({plan.tokens_per_month} tokens/month)
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Billing Cycle</label>
                                  <Select value={selectedBillingCycle} onValueChange={(value) => setSelectedBillingCycle(value as "monthly" | "yearly")}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                      <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-6">
                                <Button onClick={handleAddPlan} disabled={planLoading || !selectedPlan} className="bg-cyan-600 hover:bg-cyan-700">
                                  {planLoading ? "Activating..." : "Activate"}
                                </Button>
                                <Button variant="outline" onClick={() => setIsAddPlanOpen(false)}>Cancel</Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {user.subscription_status === "active" && (
                            <Dialog open={isRemovePlanOpen && selectedUserId === user.id} onOpenChange={(open) => {
                              setIsRemovePlanOpen(open);
                              if (open) setSelectedUserId(user.id);
                            }}>
                              <Button
                                onClick={() => {
                                  setSelectedUserId(user.id);
                                  setIsRemovePlanOpen(true);
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                -Plan
                              </Button>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Cancel Subscription</DialogTitle>
                                  <DialogDescription>
                                    Cancel {user.subscription_tier} plan for {user.full_name || user.email}
                                  </DialogDescription>
                                </DialogHeader>
                                <p className="text-sm text-muted-foreground mt-4">
                                  This action will cancel the user's subscription immediately.
                                </p>
                                <div className="flex gap-2 mt-6">
                                  <Button onClick={handleRemovePlan} disabled={planLoading} className="bg-red-600 hover:bg-red-700">
                                    {planLoading ? "Cancelling..." : "Cancel Subscription"}
                                  </Button>
                                  <Button variant="outline" onClick={() => setIsRemovePlanOpen(false)}>Keep Subscription</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={isAddTokensOpen && selectedUserId === user.id} onOpenChange={(open) => {
                            setIsAddTokensOpen(open);
                            if (open) setSelectedUserId(user.id);
                          }}>
                            <Button
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setIsAddTokensOpen(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-green-400 hover:text-green-300"
                            >
                              +Tokens
                            </Button>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Tokens</DialogTitle>
                                <DialogDescription>
                                  Add tokens to {user.full_name || user.email}
                                </DialogDescription>
                              </DialogHeader>
                              <Input
                                type="number"
                                placeholder="Number of tokens"
                                value={tokenAmount}
                                onChange={(e) => setTokenAmount(e.target.value)}
                                className="mt-4"
                              />
                              <div className="flex gap-2 mt-4">
                                <Button onClick={handleAddTokens}>Add</Button>
                                <Button variant="outline" onClick={() => setIsAddTokensOpen(false)}>Cancel</Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isRemoveTokensOpen && selectedUserId === user.id} onOpenChange={(open) => {
                            setIsRemoveTokensOpen(open);
                            if (open) setSelectedUserId(user.id);
                          }}>
                            <Button
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setIsRemoveTokensOpen(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              -Tokens
                            </Button>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Remove Tokens</DialogTitle>
                                <DialogDescription>
                                  Remove tokens from {user.full_name || user.email}
                                </DialogDescription>
                              </DialogHeader>
                              <Input
                                type="number"
                                placeholder="Number of tokens"
                                value={tokenAmount}
                                onChange={(e) => setTokenAmount(e.target.value)}
                                className="mt-4"
                              />
                              <div className="flex gap-2 mt-4">
                                <Button onClick={handleRemoveTokens} className="bg-red-600 hover:bg-red-700">Remove</Button>
                                <Button variant="outline" onClick={() => setIsRemoveTokensOpen(false)}>Cancel</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
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

export default AdminUsersPage;
