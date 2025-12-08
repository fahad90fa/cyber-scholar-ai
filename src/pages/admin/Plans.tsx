import { useEffect, useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { adminService } from '@/services/adminService';
import { formatCurrency } from '@/lib/formatCurrency';
import { toast } from 'sonner';
import type { SubscriptionPlan } from '@/types/subscription.types';

export default function AdminPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_price: '',
    yearly_price: '',
    tokens_per_month: '',
    features: '',
    is_active: true,
    is_popular: false,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await adminService.getPlans();
      setPlans((data as SubscriptionPlan[]) || []);
    } catch (error) {
      console.error('Failed to load plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      monthly_price: (plan.monthly_price / 100).toString(),
      yearly_price: (plan.yearly_price / 100).toString(),
      tokens_per_month: plan.tokens_per_month.toString(),
      features: (plan.features || []).join('\n'),
      is_active: plan.is_active,
      is_popular: plan.is_popular,
    });
  };

  const handleSave = async () => {
    if (!editPlan) return;

    try {
      await adminService.updatePlan(editPlan.id, {
        name: formData.name,
        description: formData.description,
        monthly_price: Math.round(parseFloat(formData.monthly_price) * 100),
        yearly_price: Math.round(parseFloat(formData.yearly_price) * 100),
        tokens_per_month: parseInt(formData.tokens_per_month),
        features: formData.features.split('\n').filter(f => f.trim()),
        is_active: formData.is_active,
        is_popular: formData.is_popular,
      });
      toast.success('Plan updated');
      setEditPlan(null);
      loadPlans();
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  const toggleActive = async (plan: SubscriptionPlan) => {
    try {
      await adminService.updatePlan(plan.id, { is_active: !plan.is_active });
      toast.success(plan.is_active ? 'Plan deactivated' : 'Plan activated');
      loadPlans();
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Yearly</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{plan.name}</span>
                        {plan.is_popular && <Badge className="bg-primary">Popular</Badge>}
                        {plan.is_enterprise && <Badge variant="outline">Enterprise</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(plan.monthly_price)}</TableCell>
                    <TableCell>{formatCurrency(plan.yearly_price)}</TableCell>
                    <TableCell>{plan.tokens_per_month.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(plan)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => toggleActive(plan)}
                          className={plan.is_active ? 'text-destructive' : 'text-green-500'}
                        >
                          {plan.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Plan Modal */}
      <Dialog open={editPlan !== null} onOpenChange={() => setEditPlan(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Plan: {editPlan?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Plan Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monthly Price ($)</Label>
                <Input
                  type="number"
                  value={formData.monthly_price}
                  onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                />
              </div>
              <div>
                <Label>Yearly Price ($)</Label>
                <Input
                  type="number"
                  value={formData.yearly_price}
                  onChange={(e) => setFormData({ ...formData, yearly_price: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Tokens per Month</Label>
              <Input
                type="number"
                value={formData.tokens_per_month}
                onChange={(e) => setFormData({ ...formData, tokens_per_month: e.target.value })}
              />
            </div>
            <div>
              <Label>Features (one per line)</Label>
              <Textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={6}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mark as Popular</Label>
              <Switch
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlan(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
