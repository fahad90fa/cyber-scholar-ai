import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { ArrowLeft, Edit2, Plus, Minus } from "lucide-react";

const AdminUserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [editingName, setEditingName] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [tokenAmount, setTokenAmount] = useState("");
  const [tokenReason, setTokenReason] = useState("bonus");
  const [isAddTokensDialogOpen, setIsAddTokensDialogOpen] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (!id) return;

      const userData = await adminService.getUser(id);
      setUser(userData);
      setEditingName(userData.full_name || "");
      setEditingEmail(userData.email || "");

      const subs = await adminService.getSubscriptions({
        limit: 100,
      });
      setSubscriptions(subs.filter((s: any) => s.user_id === id) || []);
    } catch (error: any) {
      toast.error("Failed to load user data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await adminService.updateUser(id!, {
        full_name: editingName,
        email: editingEmail,
      });
      setUser({ ...user, full_name: editingName, email: editingEmail });
      setIsEditDialogOpen(false);
      toast.success("User updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const handleAddTokens = async () => {
    try {
      const amount = parseInt(tokenAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Invalid token amount");
        return;
      }

      await adminService.addTokens(id!, amount, tokenReason);
      setTokenAmount("");
      setTokenReason("bonus");
      setIsAddTokensDialogOpen(false);
      toast.success("Tokens added successfully");
      loadUserData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add tokens");
    }
  };

  const handleBanUser = async () => {
    if (
      !window.confirm(
        user.is_banned
          ? "Are you sure you want to unban this user?"
          : "Are you sure you want to ban this user?"
      )
    ) {
      return;
    }

    try {
      if (user.is_banned) {
        await adminService.unbanUser(id!);
        setUser({ ...user, is_banned: false });
        toast.success("User unbanned");
      } else {
        await adminService.banUser(id!, "Manual ban by admin");
        setUser({ ...user, is_banned: true });
        toast.success("User banned");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">User not found</p>
            <Button onClick={() => navigate("/admin/users")} className="mt-4">
              Back to Users
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
        className={`px-3 py-1 rounded text-sm font-medium ${colors[tier] || "bg-gray-400/20 text-gray-400"}`}
      >
        {tier}
      </span>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status || status === "none") return null;
    const colors: { [key: string]: string } = {
      active: "bg-green-400/20 text-green-400",
      expired: "bg-red-400/20 text-red-400",
      cancelled: "bg-yellow-400/20 text-yellow-400",
    };
    return (
      <span
        className={`px-3 py-1 rounded text-sm font-medium ${colors[status] || "bg-gray-400/20 text-gray-400"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/admin/users")}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {user.full_name || "User"}
              </h1>
              <p className="text-muted-foreground mt-1">{user.email}</p>
            </div>
          </div>

          <Button
            onClick={handleBanUser}
            variant={user.is_banned ? "outline" : "destructive"}
            size="sm"
            className={user.is_banned ? "text-green-400" : ""}
          >
            {user.is_banned ? "Unban" : "Ban"}
          </Button>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card border-primary/10">
            <p className="text-muted-foreground text-sm">Subscription Tier</p>
            <p className="text-2xl font-bold mt-2">
              {getSubscriptionBadge(user.subscription_tier)}
            </p>
          </Card>

          <Card className="p-6 bg-card border-primary/10">
            <p className="text-muted-foreground text-sm">Subscription Status</p>
            <p className="text-2xl font-bold mt-2">
              {getStatusBadge(user.subscription_status)}
            </p>
          </Card>

          <Card className="p-6 bg-card border-primary/10">
            <p className="text-muted-foreground text-sm">Total Tokens</p>
            <p className="text-2xl font-bold text-primary mt-2">
              {user.tokens_total}
            </p>
          </Card>

          <Card className="p-6 bg-card border-primary/10">
            <p className="text-muted-foreground text-sm">Tokens Used</p>
            <p className="text-2xl font-bold text-red-400 mt-2">
              {user.tokens_used}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-card border border-primary/10">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6 bg-card border-primary/10 space-y-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Profile Information
                </h3>
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-primary/10">
                    <DialogHeader>
                      <DialogTitle>Edit User Profile</DialogTitle>
                      <DialogDescription>
                        Update user information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-foreground">
                          Full Name
                        </label>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-foreground">Email</label>
                        <Input
                          value={editingEmail}
                          onChange={(e) => setEditingEmail(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={handleUpdateUser}
                        className="w-full"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-sm">User ID</p>
                  <p className="font-mono text-foreground">{user.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="font-mono text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Full Name</p>
                  <p className="text-foreground">{user.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Joined</p>
                  <p className="text-foreground">
                    {new Date(user.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Last Active</p>
                  <p className="text-foreground">
                    {user.last_active
                      ? new Date(user.last_active).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Status</p>
                  <p className="text-foreground">
                    {user.is_banned ? (
                      <span className="text-red-400">Banned</span>
                    ) : (
                      <span className="text-green-400">Active</span>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card className="p-6 bg-card border-primary/10">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Subscription Information
              </h3>

              {user.subscription_status === "active" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Plan</p>
                      <p className="text-foreground font-medium">
                        {user.subscription_tier}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Status</p>
                      <p className="text-green-400 font-medium">
                        {user.subscription_status}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-primary/10">
                    <p className="text-sm text-muted-foreground mb-3">
                      Quick Actions
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Extend Subscription
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Change Plan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400"
                        disabled
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {user.subscription_status === "expired"
                      ? "Subscription has expired"
                      : "No active subscription"}
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens">
            <Card className="p-6 bg-card border-primary/10 space-y-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Token Management
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Available: {user.tokens_total - user.tokens_used} /{" "}
                    {user.tokens_total}
                  </p>
                </div>

                <Dialog
                  open={isAddTokensDialogOpen}
                  onOpenChange={setIsAddTokensDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Tokens
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-primary/10">
                    <DialogHeader>
                      <DialogTitle>Add Tokens</DialogTitle>
                      <DialogDescription>
                        Add tokens to user account
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-foreground">
                          Amount
                        </label>
                        <Input
                          type="number"
                          value={tokenAmount}
                          onChange={(e) => setTokenAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-foreground">
                          Reason
                        </label>
                        <Select
                          value={tokenReason}
                          onValueChange={setTokenReason}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bonus">Bonus</SelectItem>
                            <SelectItem value="promotion">Promotion</SelectItem>
                            <SelectItem value="compensation">
                              Compensation
                            </SelectItem>
                            <SelectItem value="refund">Refund</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleAddTokens}
                        className="w-full"
                      >
                        Add Tokens
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-muted-foreground text-sm mb-1">
                  Total Tokens
                </p>
                <p className="text-3xl font-bold text-primary">
                  {user.tokens_total}
                </p>
              </div>

              <div className="p-4 bg-red-400/10 rounded-lg">
                <p className="text-muted-foreground text-sm mb-1">
                  Tokens Used
                </p>
                <p className="text-3xl font-bold text-red-400">
                  {user.tokens_used}
                </p>
              </div>

              <div className="p-4 bg-green-400/10 rounded-lg">
                <p className="text-muted-foreground text-sm mb-1">
                  Available Tokens
                </p>
                <p className="text-3xl font-bold text-green-400">
                  {user.tokens_total - user.tokens_used}
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminUserDetailPage;
