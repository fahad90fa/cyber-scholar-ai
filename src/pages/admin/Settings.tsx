import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { adminAction } from '@/services/adminService';
import { toast } from 'sonner';
import type { BankSettings } from '@/types/subscription.types';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Partial<BankSettings>>({
    bank_name: '',
    account_holder: '',
    account_number: '',
    iban: '',
    swift_code: '',
    branch_name: '',
    country: '',
    additional_instructions: '',
    support_email: '',
    payment_timeout_hours: 48,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await adminAction('get_bank_settings');
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAction('update_bank_settings', { settings });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BankSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Bank Account Details</CardTitle>
          <CardDescription>
            These details will be shown to users on the payment page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Bank Name</Label>
              <Input
                value={settings.bank_name || ''}
                onChange={(e) => updateField('bank_name', e.target.value)}
                placeholder="e.g., Chase Bank"
              />
            </div>
            <div>
              <Label>Account Holder Name</Label>
              <Input
                value={settings.account_holder || ''}
                onChange={(e) => updateField('account_holder', e.target.value)}
                placeholder="Your name or company name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Account Number</Label>
              <Input
                value={settings.account_number || ''}
                onChange={(e) => updateField('account_number', e.target.value)}
                placeholder="Your account number"
              />
            </div>
            <div>
              <Label>IBAN</Label>
              <Input
                value={settings.iban || ''}
                onChange={(e) => updateField('iban', e.target.value)}
                placeholder="International bank account number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SWIFT/BIC Code</Label>
              <Input
                value={settings.swift_code || ''}
                onChange={(e) => updateField('swift_code', e.target.value)}
                placeholder="SWIFT code"
              />
            </div>
            <div>
              <Label>Branch Name</Label>
              <Input
                value={settings.branch_name || ''}
                onChange={(e) => updateField('branch_name', e.target.value)}
                placeholder="Branch name"
              />
            </div>
          </div>

          <div>
            <Label>Country</Label>
            <Input
              value={settings.country || ''}
              onChange={(e) => updateField('country', e.target.value)}
              placeholder="e.g., United States"
            />
          </div>

          <div>
            <Label>Additional Instructions</Label>
            <Textarea
              value={settings.additional_instructions || ''}
              onChange={(e) => updateField('additional_instructions', e.target.value)}
              placeholder="Any additional payment instructions for users..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Support Email</Label>
            <Input
              type="email"
              value={settings.support_email || ''}
              onChange={(e) => updateField('support_email', e.target.value)}
              placeholder="support@example.com"
            />
          </div>

          <div>
            <Label>Payment Timeout (hours)</Label>
            <Input
              type="number"
              value={settings.payment_timeout_hours || 48}
              onChange={(e) => updateField('payment_timeout_hours', parseInt(e.target.value))}
              placeholder="48"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Pending payment requests will expire after this time
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
