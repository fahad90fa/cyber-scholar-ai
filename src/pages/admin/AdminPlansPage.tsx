import { useState } from "react";
import { useAdminPlansRealtime } from "@/hooks/useAdminPlansRealtime";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Edit2, Trash2, Star } from "lucide-react";

const AdminPlansPage = () => {
  const { plans, isLoading, isSubscribed } = useAdminPlansRealtime();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    monthly_price: "",
    yearly_price: "",
    tokens_per_month: "",
    features: [] as string[],
    is_active: true,
    is_popular: false,
    is_enterprise: false,
    sort_order: "",
  });

  const [newFeature, setNewFeature] = useState("");

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      monthly_price: "",
      yearly_price: "",
      tokens_per_month: "",
      features: [],
      is_active: true,
      is_popular: false,
      is_enterprise: false,
      sort_order: "",
    });
    setEditingPlan(null);
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (plan: any) => {
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || "",
      monthly_price: plan.monthly_price.toString(),
      yearly_price: plan.yearly_price.toString(),
      tokens_per_month: plan.tokens_per_month.toString(),
      features: plan.features || [],
      is_active: plan.is_active,
      is_popular: plan.is_popular,
      is_enterprise: plan.is_enterprise,
      sort_order: plan.sort_order.toString(),
    });
    setEditingPlan(plan);
    setIsCreateDialogOpen(true);
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFormData({
      ...formData,
      features: [...formData.features, newFeature],
    });
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSavePlan = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error("Name and slug are required");
        return;
      }

      setIsSubmitting(true);

      const planData = {
        ...formData,
        monthly_price: parseInt(formData.monthly_price) || 0,
        yearly_price: parseInt(formData.yearly_price) || 0,
        tokens_per_month: parseInt(formData.tokens_per_month) || 0,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (editingPlan) {
        await adminService.updatePlan(editingPlan.id, planData);
        toast.success("Plan updated successfully");
      } else {
        await adminService.createPlan(planData);
        toast.success("Plan created successfully");
      }

      setIsCreateDialogOpen(false);
      loadPlans();
    } catch (error: any) {
      toast.error(error.message || "Failed to save plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      await adminService.deletePlan(planId);
      toast.success("Plan deleted successfully");
      loadPlans();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete plan");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading plans...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Plans Management</h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              Manage subscription plans and features
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
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/10 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? "Edit Plan" : "Create New Plan"}
                </DialogTitle>
                <DialogDescription>
                  {editingPlan
                    ? "Update plan details"
                    : "Create a new subscription plan"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-foreground">Plan Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        });
                      }}
                      placeholder="e.g., Pro Plan"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-foreground">Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="e.g., pro"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-foreground">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Plan description..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-foreground">
                      Monthly Price ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.monthly_price}
                      onChange={(e) =>
                        setFormData({ ...formData, monthly_price: e.target.value })
                      }
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-foreground">
                      Yearly Price ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.yearly_price}
                      onChange={(e) =>
                        setFormData({ ...formData, yearly_price: e.target.value })
                      }
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-foreground">
                      Tokens/Month
                    </label>
                    <Input
                      type="number"
                      value={formData.tokens_per_month}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tokens_per_month: e.target.value,
                        })
                      }
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-foreground mb-2 block">
                    Features
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddFeature();
                        }
                      }}
                      placeholder="Add a feature..."
                    />
                    <Button
                      onClick={handleAddFeature}
                      variant="outline"
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-primary/5 rounded"
                      >
                        <span className="text-sm text-foreground">{feature}</span>
                        <Button
                          onClick={() => handleRemoveFeature(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.is_popular}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_popular: checked as boolean })
                      }
                      id="is_popular"
                    />
                    <label htmlFor="is_popular" className="text-sm text-foreground">
                      Popular
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.is_enterprise}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          is_enterprise: checked as boolean,
                        })
                      }
                      id="is_enterprise"
                    />
                    <label htmlFor="is_enterprise" className="text-sm text-foreground">
                      Enterprise
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
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSavePlan}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Saving..." : "Save Plan"}
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

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-card border-primary/10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.slug}
                    </p>
                  </div>
                  {plan.is_popular && (
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  )}
                </div>

                {!plan.is_enterprise && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      ${(plan.monthly_price / 100).toFixed(2)}/mo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${(plan.yearly_price / 100).toFixed(2)}/yr
                    </p>
                  </div>
                )}

                {plan.is_enterprise && (
                  <p className="text-sm text-green-400 font-medium">
                    Contact Sales
                  </p>
                )}

                <div className="py-2 border-t border-primary/10">
                  <p className="text-sm font-medium text-foreground">
                    {plan.tokens_per_month} tokens/mo
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenEditDialog(plan)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeletePlan(plan.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {plan.is_active && (
                    <span className="px-2 py-1 rounded text-xs bg-green-400/20 text-green-400">
                      Active
                    </span>
                  )}
                  {!plan.is_active && (
                    <span className="px-2 py-1 rounded text-xs bg-red-400/20 text-red-400">
                      Inactive
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {plans.length === 0 && (
          <Card className="p-12 bg-card border-primary/10 text-center">
            <p className="text-muted-foreground">No plans found</p>
            <Button onClick={handleOpenCreateDialog} className="mt-4" variant="outline">
              Create First Plan
            </Button>
          </Card>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminPlansPage;
