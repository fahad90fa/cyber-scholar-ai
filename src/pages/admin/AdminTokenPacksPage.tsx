import { useState } from "react";
import { useAdminTokenPacksRealtime } from "@/hooks/useAdminTokenPacksRealtime";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Edit2, Trash2 } from "lucide-react";

const AdminTokenPacksPage = () => {
  const { tokenPacks, purchaseRequests, isLoading, isSubscribed } = useAdminTokenPacksRealtime();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    tokens: "",
    price: "",
    is_active: true,
    sort_order: "",
  });

  const handleOpenCreateDialog = () => {
    setFormData({
      name: "",
      tokens: "",
      price: "",
      is_active: true,
      sort_order: "",
    });
    setEditingPack(null);
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (pack: any) => {
    setFormData({
      name: pack.name,
      tokens: pack.tokens.toString(),
      price: pack.price.toString(),
      is_active: pack.is_active,
      sort_order: pack.sort_order.toString(),
    });
    setEditingPack(pack);
    setIsCreateDialogOpen(true);
  };

  const handleSavePack = async () => {
    try {
      if (!formData.name || !formData.tokens || !formData.price) {
        toast.error("Name, tokens, and price are required");
        return;
      }

      setIsSubmitting(true);

      const packData = {
        ...formData,
        tokens: parseInt(formData.tokens) || 0,
        price: parseInt(formData.price) || 0,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (editingPack) {
        await adminService.updateTokenPack(editingPack.id, packData);
        toast.success("Token pack updated successfully");
      } else {
        await adminService.createTokenPack(packData);
        toast.success("Token pack created successfully");
      }

      setIsCreateDialogOpen(false);
      loadTokenPacks();
    } catch (error: any) {
      toast.error(error.message || "Failed to save token pack");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePack = async (packId: string) => {
    if (!window.confirm("Are you sure you want to delete this token pack?"))
      return;

    try {
      await adminService.deleteTokenPack(packId);
      toast.success("Token pack deleted successfully");
      loadTokenPacks();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete token pack");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading token packs...</p>
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Token Packs Management
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              Manage token packages and purchase requests
              {isSubscribed && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Real-time
                </span>
              )}
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Pack
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/10 max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPack ? "Edit Token Pack" : "Create New Token Pack"}
                </DialogTitle>
                <DialogDescription>
                  {editingPack
                    ? "Update token pack details"
                    : "Create a new token package"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-foreground">Pack Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., 100 Tokens"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-foreground">Tokens</label>
                    <Input
                      type="number"
                      value={formData.tokens}
                      onChange={(e) =>
                        setFormData({ ...formData, tokens: e.target.value })
                      }
                      placeholder="100"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-foreground">Price ($)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked as boolean })
                    }
                    id="is_active"
                  />
                  <label htmlFor="is_active" className="text-sm text-foreground">
                    Active
                  </label>
                </div>

                <div>
                  <label className="text-sm text-foreground">Sort Order</label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_order: e.target.value })
                    }
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSavePack}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Saving..." : "Save Pack"}
                  </Button>
                  <Button
                    onClick={() => setIsCreateDialogOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="packs" className="space-y-4">
          <TabsList className="bg-card border border-primary/10">
            <TabsTrigger value="packs">Token Packs</TabsTrigger>
            <TabsTrigger value="requests">Purchase Requests</TabsTrigger>
          </TabsList>

          {/* Token Packs Tab */}
          <TabsContent value="packs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tokenPacks.map((pack) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 bg-card border-primary/10 space-y-4">
                    <h3 className="font-bold text-foreground text-lg">
                      {pack.name}
                    </h3>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Tokens</p>
                        <p className="text-2xl font-bold text-cyan-400">
                          {pack.tokens}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-2xl font-bold text-primary">
                          ${(pack.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenEditDialog(pack)}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeletePack(pack.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>

                    {pack.is_active && (
                      <span className="px-2 py-1 rounded text-xs bg-green-400/20 text-green-400 block text-center">
                        Active
                      </span>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>

            {tokenPacks.length === 0 && (
              <Card className="p-12 bg-card border-primary/10 text-center">
                <p className="text-muted-foreground">No token packs found</p>
                <Button
                  onClick={handleOpenCreateDialog}
                  className="mt-4"
                  variant="outline"
                >
                  Create First Pack
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Purchase Requests Tab */}
          <TabsContent value="requests">
            <Card className="p-6 bg-card border-primary/10">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No purchase requests at the moment
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminTokenPacksPage;
