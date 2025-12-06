import { useEffect, useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { adminAction } from '@/services/adminService';
import { formatCurrency } from '@/lib/formatCurrency';
import { toast } from 'sonner';
import type { TokenPack } from '@/types/subscription.types';

export default function AdminTokenPacks() {
  const [packs, setPacks] = useState<TokenPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPack, setEditPack] = useState<TokenPack | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tokens: '',
    price: '',
    is_active: true,
  });

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const data = await adminAction('get_token_packs');
      setPacks(data || []);
    } catch (error) {
      console.error('Failed to load token packs:', error);
      toast.error('Failed to load token packs');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (pack: TokenPack) => {
    setEditPack(pack);
    setFormData({
      name: pack.name,
      tokens: pack.tokens.toString(),
      price: (pack.price / 100).toString(),
      is_active: pack.is_active,
    });
  };

  const handleSave = async () => {
    if (!editPack) return;

    try {
      await adminAction('update_token_pack', {
        packId: editPack.id,
        updates: {
          name: formData.name,
          tokens: parseInt(formData.tokens),
          price: Math.round(parseFloat(formData.price) * 100),
          is_active: formData.is_active,
        },
      });
      toast.success('Token pack updated');
      setEditPack(null);
      loadPacks();
    } catch (error) {
      toast.error('Failed to update token pack');
    }
  };

  const toggleActive = async (pack: TokenPack) => {
    try {
      await adminAction('update_token_pack', {
        packId: pack.id,
        updates: { is_active: !pack.is_active },
      });
      toast.success(pack.is_active ? 'Pack deactivated' : 'Pack activated');
      loadPacks();
    } catch (error) {
      toast.error('Failed to update pack');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Token Packs</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Token Packs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packs.map((pack) => (
                  <TableRow key={pack.id}>
                    <TableCell className="font-medium">{pack.name}</TableCell>
                    <TableCell>{pack.tokens.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(pack.price)}</TableCell>
                    <TableCell>
                      <Badge variant={pack.is_active ? 'default' : 'secondary'}>
                        {pack.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(pack)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => toggleActive(pack)}
                          className={pack.is_active ? 'text-destructive' : 'text-green-500'}
                        >
                          {pack.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
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

      {/* Edit Modal */}
      <Dialog open={editPack !== null} onOpenChange={() => setEditPack(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Token Pack</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pack Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Tokens</Label>
              <Input
                type="number"
                value={formData.tokens}
                onChange={(e) => setFormData({ ...formData, tokens: e.target.value })}
              />
            </div>
            <div>
              <Label>Price ($)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPack(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
