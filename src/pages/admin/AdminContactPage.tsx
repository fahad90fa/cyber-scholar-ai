import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { Mail, MessageSquare, Building2, User, Clock, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import { format } from "date-fns";

const AdminContactPage = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getContacts();
      setContacts(data);
    } catch (error: any) {
      toast.error("Failed to load contact requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetails = (contact: any) => {
    setSelectedContact(contact);
    setAdminNotes(contact.admin_notes || "");
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedContact) return;
    
    setIsUpdating(true);
    try {
      await adminService.updateContact(selectedContact.id, {
        status,
        admin_notes: adminNotes,
      });
      toast.success(`Request marked as ${status}`);
      setIsDetailsOpen(false);
      loadContacts();
    } catch (error: any) {
      toast.error("Failed to update request");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "contacted": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "completed": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "rejected": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contact Requests</h1>
          <p className="text-muted-foreground mt-2">
            Manage inquiries from the enterprise contact form
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border border-primary border-t-transparent" />
            </div>
          ) : contacts.length === 0 ? (
            <Card className="p-12 text-center bg-card border-primary/10">
              <p className="text-muted-foreground">No contact requests found</p>
            </Card>
          ) : (
            contacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className="p-6 bg-card border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => handleOpenDetails(contact)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-foreground">{contact.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                        {contact.plan_slug && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                            {contact.plan_slug}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </div>
                        {contact.company && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {contact.company}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(contact.created_at), "MMM d, yyyy HH:mm")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-foreground truncate max-w-[300px]">
                          {contact.subject}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {contact.message}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="group-hover:bg-primary/10">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="bg-card border-primary/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Request Details</DialogTitle>
              <DialogDescription>
                Submitted on {selectedContact && format(new Date(selectedContact.created_at), "PPPP 'at' p")}
              </DialogDescription>
            </DialogHeader>

            {selectedContact && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">From</label>
                    <p className="text-foreground font-medium">{selectedContact.name}</p>
                    <p className="text-sm text-primary">{selectedContact.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Company</label>
                    <p className="text-foreground font-medium">{selectedContact.company || "N/A"}</p>
                    {selectedContact.plan_slug && (
                      <p className="text-sm text-blue-400">Plan: {selectedContact.plan_slug}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Subject</label>
                  <p className="text-foreground font-medium">{selectedContact.subject}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Message</label>
                  <div className="p-4 bg-secondary/20 rounded-lg border border-primary/5 text-sm whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    placeholder="Add internal notes about this request..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-secondary/20 border-primary/10 min-h-[100px]"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-primary/10">
                  <Button
                    onClick={() => handleUpdateStatus("contacted")}
                    variant="outline"
                    className="gap-2 border-blue-400/20 text-blue-400 hover:bg-blue-400/10"
                    disabled={isUpdating}
                  >
                    <Mail className="w-4 h-4" />
                    Mark Contacted
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus("completed")}
                    variant="outline"
                    className="gap-2 border-green-400/20 text-green-400 hover:bg-green-400/10"
                    disabled={isUpdating}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Completed
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus("rejected")}
                    variant="outline"
                    className="gap-2 border-red-400/20 text-red-400 hover:bg-red-400/10"
                    disabled={isUpdating}
                  >
                    <XCircle className="w-4 h-4" />
                    Archive
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    onClick={() => setIsDetailsOpen(false)}
                    disabled={isUpdating}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminContactPage;
