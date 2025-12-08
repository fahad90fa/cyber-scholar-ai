import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { subscriptionService, PaymentRequest } from "@/services/subscriptionService";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CheckoutPage = () => {
  const { planSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [plan, setPlan] = useState<any>(null);
  const [bankSettings, setBankSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    transaction_reference: "",
    payment_date: "",
    screenshot_url: "",
  });

  const billingCycle = (searchParams.get("cycle") || "monthly") as "monthly" | "yearly";

  useEffect(() => {
    loadCheckoutData();
  }, [planSlug]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      const [planData, bankData] = await Promise.all([
        subscriptionService.getPlanBySlug(planSlug || ""),
        subscriptionService.getBankSettings(),
      ]);
      setPlan(planData);
      setBankSettings(bankData);
    } catch (error: any) {
      toast.error("Failed to load checkout information");
      navigate("/pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.transaction_reference?.trim()) {
      toast.error("Please enter a valid transaction reference");
      return;
    }

    if (!formData.payment_date) {
      toast.error("Please select a payment date");
      return;
    }

    try {
      setSubmitting(true);
      
      console.log("Creating payment request...");
      let paymentRequest: PaymentRequest;
      try {
        paymentRequest = await subscriptionService.createPaymentRequest(
          planSlug || "",
          billingCycle
        );
        console.log("Payment request created:", paymentRequest.id);
      } catch (error: any) {
        console.error("Create payment request error:", error);
        if (error.message.includes("not authenticated")) {
          toast.error("Your session has expired. Please refresh and try again.");
          window.location.reload();
          return;
        }
        throw error;
      }

      console.log("Submitting payment proof...");
      console.log("Form data:", formData);
      const proofData = {
        transaction_reference: formData.transaction_reference.trim(),
        payment_date: formData.payment_date,
        screenshot_url: formData.screenshot_url ? formData.screenshot_url.trim() : undefined,
      };
      console.log("Proof data to submit:", proofData);
      
      await subscriptionService.submitPaymentProof(paymentRequest.id, proofData);
      console.log("Payment proof submitted successfully");

      toast.success("Payment request submitted successfully!");
      
      // Wait a bit before navigating to ensure all data is saved
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Navigating to /check-request...");
      navigate("/check-request", { replace: true });
      
      // Fallback in case navigation fails
      setTimeout(() => {
        console.log("Navigation timeout - performing manual redirect");
        window.location.href = "/check-request";
      }, 3000);
    } catch (error: any) {
      console.error("Payment submission error:", error);
      toast.error(error.message || "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !plan || !bankSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const price =
    billingCycle === "monthly"
      ? plan.monthly_price / 100
      : plan.yearly_price / 100;

  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.button
          onClick={() => navigate("/pricing")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Pricing
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-card border-primary/10">
              <h1 className="text-2xl font-bold text-foreground mb-6">
                Complete Your Payment
              </h1>

              {/* Bank Details */}
              <div className="mb-8 p-6 bg-secondary/20 rounded-lg border border-primary/10">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Bank Account Details
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Bank Name</p>
                    <p className="text-foreground font-mono">{bankSettings.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Account Holder</p>
                    <p className="text-foreground font-mono">
                      {bankSettings.account_holder}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Account Number</p>
                    <p className="text-foreground font-mono">
                      {bankSettings.account_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">IBAN</p>
                    <p className="text-foreground font-mono">{bankSettings.iban}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">SWIFT/BIC</p>
                    <p className="text-foreground font-mono">{bankSettings.swift_bic}</p>
                  </div>
                </div>
                {bankSettings.additional_instructions && (
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <p className="text-muted-foreground text-sm mb-2">Instructions:</p>
                    <p className="text-foreground text-sm">
                      {bankSettings.additional_instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Transaction Reference/ID *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., TRF123456789"
                    value={formData.transaction_reference}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transaction_reference: e.target.value,
                      })
                    }
                    required
                    disabled={submitting}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    The reference number from your bank transfer
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Payment Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Screenshot/Proof URL (Optional)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={formData.screenshot_url}
                    onChange={(e) =>
                      setFormData({ ...formData, screenshot_url: e.target.value })
                    }
                    disabled={submitting}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload your payment proof screenshot
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  {submitting ? "Submitting... Please wait" : "Submit Payment Request"}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground mt-6 text-center">
                Your payment will be reviewed by our admin team within 24 hours
              </p>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-6 bg-card border-primary/10 sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-muted-foreground text-sm">Plan</p>
                  <p className="text-lg font-semibold text-foreground">{plan.name}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Monthly Tokens</p>
                  <p className="text-lg font-semibold text-primary">
                    {plan.tokens_per_month.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Billing Cycle</p>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {billingCycle}
                  </p>
                </div>

                <hr className="border-primary/10" />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-foreground font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">${price.toFixed(2)}</span>
                </div>
              </div>

              <Card className="p-4 bg-secondary/20 border-primary/10 mb-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  After you submit this form, our admin team will verify your payment
                  and activate your subscription within 24 hours.
                </p>
              </Card>

              {/* Features */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  What's Included:
                </p>
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((feature: string, index: number) => (
                    <li
                      key={index}
                      className="text-xs text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
