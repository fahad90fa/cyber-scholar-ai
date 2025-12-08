import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminPaymentsRealtime } from "@/hooks/useAdminPaymentsRealtime";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const AdminPaymentsPage = () => {
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get("status") || "pending");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { payments, isLoading, mutate: refreshPayments, isSubscribed } = useAdminPaymentsRealtime({
    status: filter === "all" ? undefined : filter,
    page: currentPage,
    limit: 10,
  });

  useEffect(() => {
    refreshPayments();
  }, [filter, currentPage]);

  const handleConfirmPayment = async (paymentId: string) => {
    if (!paymentId) return;
    
    try {
      setConfirmLoading(true);
      await adminService.confirmPayment(paymentId, adminNotes);
      
      if (selectedPayment?.user_id && selectedPayment?.plan_id) {
        await adminService.activateSubscription(
          selectedPayment.user_id,
          selectedPayment.plan_id,
          selectedPayment.billing_cycle
        );
        
        queryClient.invalidateQueries({
          queryKey: ['profile', selectedPayment.user_id],
        });
      }
      
      toast.success("Payment confirmed and subscription activated!");
      setSelectedPayment(null);
      setAdminNotes("");
      refreshPayments();
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm payment");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!paymentId || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    
    try {
      setConfirmLoading(true);
      await adminService.rejectPayment(paymentId, rejectReason);
      toast.success("Payment rejected!");
      setSelectedPayment(null);
      setRejectReason("");
      refreshPayments();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject payment");
    } finally {
      setConfirmLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  if (isLoading && currentPage === 1) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payments...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Payment Requests</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            Manage payment submissions from users
            {isSubscribed && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Real-time
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-card border-primary/10">
          <div className="flex gap-2 flex-wrap">
            {["pending", "confirmed", "rejected", "all"].map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status)}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </Card>

        {/* Payments Table */}
        <Card className="p-6 bg-card border-primary/10 overflow-x-auto">
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left py-3 px-4 text-muted-foreground text-sm">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground text-sm">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground text-sm">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground text-sm">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm text-foreground">
                        {payment.profiles?.email || payment.user_email}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-foreground">{payment.plan_name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-primary">
                        ${(payment.amount / 100).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className="text-sm capitalize">{payment.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {payment.status === "pending" && (
                        <Button
                          onClick={() => setSelectedPayment(payment)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Review
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Review Modal */}
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPayment(null)}
          >
            <Card
              className="w-full max-w-2xl bg-card border-primary/10 p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-foreground mb-4">
                Review Payment
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-muted-foreground text-sm">User Email</p>
                  <p className="text-foreground font-mono">{selectedPayment.user_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Plan</p>
                  <p className="text-foreground">{selectedPayment.plan_name} ({selectedPayment.billing_cycle})</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Amount</p>
                  <p className="text-foreground font-mono">
                    ${(selectedPayment.amount / 100).toFixed(2)} {selectedPayment.currency}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Transaction Reference</p>
                  <p className="text-foreground font-mono">
                    {selectedPayment.transaction_reference}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Payment Date</p>
                  <p className="text-foreground">
                    {new Date(selectedPayment.payment_date).toLocaleDateString()}
                  </p>
                </div>
                {selectedPayment.payment_screenshot_url && (
                  <div>
                    <p className="text-muted-foreground text-sm">Screenshot URL</p>
                    <a 
                      href={selectedPayment.payment_screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm break-all"
                    >
                      View screenshot
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Admin Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add notes for this payment..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    disabled={confirmLoading}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <Textarea
                    placeholder="Why are you rejecting this payment? (required if rejecting)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    disabled={confirmLoading}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => {
                    setSelectedPayment(null);
                    setAdminNotes("");
                    setRejectReason("");
                  }}
                  disabled={confirmLoading}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRejectPayment(selectedPayment.id)}
                  disabled={confirmLoading || !rejectReason.trim()}
                  variant="destructive"
                >
                  {confirmLoading ? "Rejecting..." : "Reject"}
                </Button>
                <Button
                  onClick={() => handleConfirmPayment(selectedPayment.id)}
                  disabled={confirmLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {confirmLoading ? "Confirming..." : "Confirm"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminPaymentsPage;
