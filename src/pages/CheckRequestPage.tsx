import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { subscriptionService, PaymentRequest } from "@/services/subscriptionService";
import { useAuthContext } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CheckRequestPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { hasActiveSubscription } = useSubscription();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoNavigateAttempts, setAutoNavigateAttempts] = useState(0);

  useEffect(() => {
    loadPaymentRequests();
    const interval = setInterval(loadPaymentRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasActiveSubscription && autoNavigateAttempts < 3) {
      const confirmedPayments = paymentRequests.filter(p => p.status === 'confirmed');
      if (confirmedPayments.length > 0) {
        setAutoNavigateAttempts(prev => prev + 1);
        setTimeout(() => {
          toast.success("Subscription activated! Redirecting to chat...");
          setTimeout(() => navigate("/chat"), 1500);
        }, 500);
      }
    }
  }, [hasActiveSubscription, paymentRequests]);

  const loadPaymentRequests = async () => {
    try {
      const requests = await subscriptionService.getUserPaymentRequests(user?.id);
      setPaymentRequests(requests);
    } catch (error: any) {
      toast.error("Failed to load payment requests");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["profile", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["subscriptions"],
        });
      }
      
      await loadPaymentRequests();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["profile", user.id],
        });
      }
      
      toast.success("Profile updated! Your subscription status has been refreshed. Try accessing chat now.");
    } catch (error: any) {
      toast.error("Failed to refresh profile");
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "rejected":
        return <XCircle className="w-6 h-6 text-red-400" />;
      case "pending":
        return <Clock className="w-6 h-6 text-yellow-400" />;
      case "expired":
        return <AlertCircle className="w-6 h-6 text-orange-400" />;
      default:
        return null;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Your payment has been confirmed. Your subscription is now active!";
      case "rejected":
        return "Your payment request was rejected. Please review the admin notes and try again.";
      case "pending":
        return "Your payment is under review. You'll be notified once it's processed.";
      case "expired":
        return "This payment request has expired. Please submit a new one.";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-400/10 border-green-400/30 text-green-400";
      case "rejected":
        return "bg-red-400/10 border-red-400/30 text-red-400";
      case "pending":
        return "bg-yellow-400/10 border-yellow-400/30 text-yellow-400";
      case "expired":
        return "bg-orange-400/10 border-orange-400/30 text-orange-400";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.button
          onClick={() => navigate("/subscriptions")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Subscriptions
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Payment Requests</h1>
              <p className="text-muted-foreground">
                Check the status of your subscription payment requests
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Status"}
            </Button>
          </div>

          {paymentRequests.length === 0 ? (
            <Card className="p-12 bg-card border-primary/10 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">No payment requests found</p>
              <Button onClick={() => navigate("/pricing")} className="bg-primary">
                Browse Plans
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {paymentRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-card border-primary/10 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          {getStatusIcon(request.status)}
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {request.plan_name}
                            </h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {request.billing_cycle} billing
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Amount</p>
                            <p className="text-foreground font-mono font-semibold">
                              ${(request.amount / 100).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Submitted
                            </p>
                            <p className="text-foreground text-sm">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Transaction Ref
                            </p>
                            <p className="text-foreground font-mono text-sm break-all">
                              {request.transaction_reference}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                request.status
                              )}`}
                            >
                              <span className="w-2 h-2 rounded-full bg-current" />
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Status Message */}
                        <div
                          className={`p-4 rounded-lg border ${getStatusColor(
                            request.status
                          )} bg-opacity-20`}
                        >
                          <p className="text-sm">{getStatusMessage(request.status)}</p>
                        </div>

                        {/* Payment Proof */}
                        {request.payment_screenshot_url && (
                          <div className="mt-4">
                            <a
                              href={request.payment_screenshot_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm inline-flex items-center gap-2"
                            >
                              View Payment Screenshot →
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Next Steps */}
                      <div className="hidden md:block min-w-max">
                        {request.status === "pending" && (
                          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 text-sm">
                            <p className="font-semibold text-yellow-400 mb-2">
                              Awaiting Review
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Our team reviews payments within 24 hours
                            </p>
                          </div>
                        )}
                        {request.status === "confirmed" && (
                          <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 text-sm">
                            <p className="font-semibold text-green-400 mb-2">
                              Active
                            </p>
                            <p className="text-muted-foreground text-xs mb-3">
                              Your subscription is now active
                            </p>
                            <Button
                              onClick={() => navigate("/chat")}
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700 text-xs"
                            >
                              Start Using Chat →
                            </Button>
                          </div>
                        )}
                        {request.status === "rejected" && (
                          <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 text-sm">
                            <p className="font-semibold text-red-400 mb-2">
                              Try Again
                            </p>
                            <Button
                              onClick={() => navigate("/pricing")}
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 text-xs"
                            >
                              Submit New Request
                            </Button>
                          </div>
                        )}
                        {request.status === "expired" && (
                          <div className="bg-orange-400/10 border border-orange-400/30 rounded-lg p-4 text-sm">
                            <p className="font-semibold text-orange-400 mb-2">
                              Expired
                            </p>
                            <Button
                              onClick={() => navigate("/pricing")}
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 text-xs"
                            >
                              New Request
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Help Section */}
          <Card className="mt-8 p-6 bg-secondary/20 border-primary/10">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Need Help?
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Pending Payment:</strong> Your
                request is being reviewed. Check back soon for updates.
              </p>
              <p>
                <strong className="text-foreground">Confirmed Payment:</strong> Your
                subscription is now active and you can start using your tokens!
              </p>
              <p>
                <strong className="text-foreground">Rejected Payment:</strong> Please
                review the rejection reason and submit a new payment request with
                correct details.
              </p>
              <p>
                <strong className="text-foreground">Expired Request:</strong> Your
                request has expired. Please submit a new one within 7 days of
                payment.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckRequestPage;
