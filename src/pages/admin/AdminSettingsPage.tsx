import { useState, useEffect } from "react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";

const defaultBankSettings = {
  bank_name: "",
  account_holder: "",
  account_number: "",
  iban: "",
  swift_bic: "",
  branch: "",
  country: "",
  currency: "USD",
  additional_instructions: "",
};

const defaultGeneralSettings = {
  support_email: "",
  payment_confirmation_timeout_hours: 48,
  auto_expire_pending_payments: false,
  token_rollover_enabled: false,
  maintenance_mode: false,
};

const sanitizeStringFields = (obj: Record<string, unknown>, defaults: Record<string, string | number | boolean>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      result[key] = defaults[key] ?? "";
    } else {
      result[key] = value;
    }
  }
  return result;
};

const AdminSettingsPage = () => {
  const { bankSettings: initialBankSettings, isLoading, invalidateSettings } = useAdminSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [bankSettings, setBankSettings] = useState(defaultBankSettings);
  const [generalSettings, setGeneralSettings] = useState(defaultGeneralSettings);

  useEffect(() => {
    if (initialBankSettings && Object.keys(initialBankSettings).length > 0) {
      const settings = initialBankSettings as Record<string, unknown>;
      
      if (settings.bank_settings) {
        const sanitizedBankSettings = sanitizeStringFields(
          settings.bank_settings as Record<string, unknown>,
          defaultBankSettings
        );
        setBankSettings((prev) => ({
          ...prev,
          ...(sanitizedBankSettings as typeof defaultBankSettings),
        }));
      } else {
        const sanitizedSettings = sanitizeStringFields(
          initialBankSettings as Record<string, unknown>,
          defaultBankSettings
        );
        setBankSettings((prev) => ({
          ...prev,
          ...(sanitizedSettings as typeof defaultBankSettings),
        }));
      }
      
      if (settings.general_settings) {
        const sanitizedGeneralSettings = sanitizeStringFields(
          settings.general_settings as Record<string, unknown>,
          defaultGeneralSettings
        );
        setGeneralSettings((prev) => ({
          ...prev,
          ...(sanitizedGeneralSettings as typeof defaultGeneralSettings),
        }));
      }
    }
  }, [initialBankSettings]);

  const handleSaveBankSettings = async () => {
    try {
      setIsSaving(true);
      await adminService.updateSettings({
        bank_settings: bankSettings,
      });
      toast.success("Bank settings saved successfully");
      invalidateSettings();
    } catch (error: Error | unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save bank settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    try {
      setIsSaving(true);
      await adminService.updateSettings({
        general_settings: generalSettings,
      });
      toast.success("General settings saved successfully");
      invalidateSettings();
    } catch (error: Error | unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save general settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading settings...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage system configuration and settings
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bank" className="space-y-4">
          <TabsList className="bg-card border border-primary/10">
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          {/* Bank Details Tab */}
          <TabsContent value="bank">
            <Card className="p-6 bg-card border-primary/10 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Bank Account Information
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  This information will be displayed to users for manual payment
                  transfers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground">Bank Name</label>
                  <Input
                    value={bankSettings.bank_name}
                    onChange={(e) =>
                      setBankSettings({
                        ...bankSettings,
                        bank_name: e.target.value,
                      })
                    }
                    placeholder="e.g., State Bank of Pakistan"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm text-foreground">
                    Account Holder Name
                  </label>
                  <Input
                    value={bankSettings.account_holder}
                    onChange={(e) =>
                      setBankSettings({
                        ...bankSettings,
                        account_holder: e.target.value,
                      })
                    }
                    placeholder="Full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm text-foreground">
                    Account Number
                  </label>
                  <Input
                    value={bankSettings.account_number}
                    onChange={(e) =>
                      setBankSettings({
                        ...bankSettings,
                        account_number: e.target.value,
                      })
                    }
                    placeholder="Account number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm text-foreground">IBAN</label>
                  <Input
                    value={bankSettings.iban}
                    onChange={(e) =>
                      setBankSettings({ ...bankSettings, iban: e.target.value })
                    }
                    placeholder="International Bank Account Number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm text-foreground">
                    SWIFT/BIC Code
                  </label>
                  <Input
                    value={bankSettings.swift_bic}
                    onChange={(e) =>
                      setBankSettings({
                        ...bankSettings,
                        swift_bic: e.target.value,
                      })
                    }
                    placeholder="SWIFT code"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm text-foreground">Branch</label>
                  <Input
                    value={bankSettings.branch}
                    onChange={(e) =>
                      setBankSettings({
                        ...bankSettings,
                        branch: e.target.value,
                      })
                    }
                    placeholder="Branch name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm text-foreground">Country</label>
                  <Input
                    value={bankSettings.country}
                    onChange={(e) =>
                      setBankSettings({
                        ...bankSettings,
                        country: e.target.value,
                      })
                    }
                    placeholder="Country"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm text-foreground">Currency</label>
                  <Select
                    value={bankSettings.currency}
                    onValueChange={(value) =>
                      setBankSettings({
                        ...bankSettings,
                        currency: value,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="PKR">PKR</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm text-foreground">
                  Additional Instructions
                </label>
                <Textarea
                  value={bankSettings.additional_instructions}
                  onChange={(e) =>
                    setBankSettings({
                      ...bankSettings,
                      additional_instructions: e.target.value,
                    })
                  }
                  placeholder="Any additional payment instructions for users..."
                  className="mt-1 min-h-24"
                />
              </div>

              <Button
                onClick={handleSaveBankSettings}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? "Saving..." : "Save Bank Settings"}
              </Button>
            </Card>
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general">
            <Card className="p-6 bg-card border-primary/10 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">
                  General Settings
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Configure system-wide settings
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-foreground">
                    Support Email
                  </label>
                  <Input
                    type="email"
                    value={generalSettings.support_email}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        support_email: e.target.value,
                      })
                    }
                    placeholder="support@example.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm text-foreground">
                    Payment Confirmation Timeout (hours)
                  </label>
                  <Input
                    type="number"
                    value={generalSettings.payment_confirmation_timeout_hours}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        payment_confirmation_timeout_hours:
                          parseInt(e.target.value) || 48,
                      })
                    }
                    placeholder="48"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How long before unconfirmed payments expire
                  </p>
                </div>

                <div className="space-y-3 p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        generalSettings.auto_expire_pending_payments
                      }
                      onCheckedChange={(checked) =>
                        setGeneralSettings({
                          ...generalSettings,
                          auto_expire_pending_payments: checked as boolean,
                        })
                      }
                      id="auto_expire"
                    />
                    <label
                      htmlFor="auto_expire"
                      className="text-sm text-foreground flex-1"
                    >
                      Auto-expire pending payments
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={generalSettings.token_rollover_enabled}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({
                          ...generalSettings,
                          token_rollover_enabled: checked as boolean,
                        })
                      }
                      id="token_rollover"
                    />
                    <label
                      htmlFor="token_rollover"
                      className="text-sm text-foreground flex-1"
                    >
                      Enable token rollover to next month
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={generalSettings.maintenance_mode}
                      onCheckedChange={(checked) =>
                        setGeneralSettings({
                          ...generalSettings,
                          maintenance_mode: checked as boolean,
                        })
                      }
                      id="maintenance_mode"
                    />
                    <label
                      htmlFor="maintenance_mode"
                      className="text-sm text-foreground flex-1"
                    >
                      Enable maintenance mode
                    </label>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveGeneralSettings}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? "Saving..." : "Save General Settings"}
              </Button>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card className="p-6 bg-card border-primary/10">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Activity log coming soon</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
