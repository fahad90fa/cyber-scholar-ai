import { apiClient } from "./api";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  total_users: number;
  active_subscriptions: {
    starter: number;
    pro: number;
    pro_plus: number;
    enterprise: number;
  };
  pending_payments: number;
  monthly_revenue: number;
  total_revenue: number;
  token_usage: number;
  today_signups: number;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  tokens_total: number;
  tokens_used: number;
  is_banned: boolean;
  created_at: string;
  last_active: string;
}

export interface AdminPayment {
  id: string;
  user_id: string;
  user_email: string;
  plan_name: string;
  amount: number;
  status: string;
  transaction_reference: string;
  payment_date: string;
  created_at: string;
  billing_cycle: string;
  currency: string;
  payment_screenshot_url?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export interface AdminSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: string;
  price_paid: number;
  tokens_total: number;
  tokens_used: number;
  status: string;
  started_at: string;
  expires_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

class AdminService {
  // Dashboard
  async getDashboardStats(): Promise<AdminStats> {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      throw new Error("Admin token not found. Please login first.");
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/v1/admin/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Failed to fetch stats",
      }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json() as Promise<AdminStats>;
  }

  // Users
  async getUsers(params?: {
    search?: string;
    tier?: string;
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ users: AdminUser[]; total: number; totalPages: number }> {
    const response = await apiClient.get<any>("/admin/users", true, params);
    
    // If backend doesn't return total/totalPages yet, we estimate or adapt
    // Assuming backend returns an array of users directly for now based on AdminQueries.get_all_users
    const users = Array.isArray(response) ? response : (response.users || []);
    const total = response.total || users.length;
    const limit = params?.limit || 10;
    
    return {
      users,
      total: total,
      totalPages: response.totalPages || Math.ceil(total / limit)
    };
  }

  async getUser(id: string) {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response;
  }

  async updateUser(id: string, data: any) {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response;
  }

  async banUser(id: string, reason: string) {
    const response = await apiClient.post(`/admin/users/${id}/ban`, { reason });
    return response;
  }

  async unbanUser(id: string) {
    const response = await apiClient.post(`/admin/users/${id}/unban`, {});
    return response;
  }

  async addTokens(
    userId: string,
    amount: number,
    reason: string,
    notes?: string
  ) {
    const response = await apiClient.post(`/admin/users/${userId}/tokens/add`, {
      amount,
      reason,
      notes,
    });
    return response;
  }

  async removeTokens(
    userId: string,
    amount: number,
    reason: string,
    notes?: string
  ) {
    const response = await apiClient.post(
      `/admin/users/${userId}/tokens/remove`,
      {
        amount,
        reason,
        notes,
      }
    );
    return response;
  }

  // Subscriptions
  async getSubscriptions(params?: {
    plan?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ subscriptions: AdminSubscription[]; total: number; totalPages: number }> {
    const response = await apiClient.get<any>("/admin/subscriptions", true, params);
    const subscriptions = Array.isArray(response) ? response : (response.subscriptions || []);
    const total = response.total || subscriptions.length;
    const limit = params?.limit || 10;
    
    return {
      subscriptions,
      total,
      totalPages: response.totalPages || Math.ceil(total / limit)
    };
  }

  async getSubscription(id: string) {
    const response = await apiClient.get(`/admin/subscriptions/${id}`);
    return response;
  }

  async activateSubscription(userId: string, planId: string, billingCycle: string) {
    const response = await apiClient.post(`/admin/subscriptions/activate`, {
      user_id: userId,
      plan_id: planId,
      billing_cycle: billingCycle,
    });
    return response;
  }

  async extendSubscription(subscriptionId: string, months: number) {
    const response = await apiClient.post(
      `/admin/subscriptions/${subscriptionId}/extend`,
      { months }
    );
    return response;
  }

  async changePlan(subscriptionId: string, planId: string) {
    const response = await apiClient.post(
      `/admin/subscriptions/${subscriptionId}/change-plan`,
      { plan_id: planId }
    );
    return response;
  }

  async cancelSubscription(subscriptionId: string, reason: string) {
    const response = await apiClient.post(
      `/admin/subscriptions/${subscriptionId}/cancel`,
      { reason }
    );
    return response;
  }

  // Payments
  async getPayments(params?: {
    status?: string;
    user_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ payments: AdminPayment[]; total: number; totalPages: number }> {
    const response = await apiClient.get<any>("/admin/payments", true, params);
    const payments = Array.isArray(response) ? response : (response.payments || []);
    const total = response.total || payments.length;
    const limit = params?.limit || 10;
    
    return {
      payments,
      total,
      totalPages: response.totalPages || Math.ceil(total / limit)
    };
  }

  async confirmPayment(paymentId: string, notes?: string) {
    const response = await apiClient.post(`/admin/payments/${paymentId}/confirm`, {
      notes,
    });
    return response;
  }

  async rejectPayment(paymentId: string, reason: string) {
    const response = await apiClient.post(`/admin/payments/${paymentId}/reject`, {
      reason,
    });
    return response;
  }

  // Plans
  async getPlans(params?: {
    limit?: number;
    offset?: number;
  }) {
    const response = await apiClient.get("/admin/plans", true, params);
    return response;
  }

  async createPlan(data: {
    name: string;
    slug: string;
    description?: string;
    monthly_price: number;
    yearly_price: number;
    tokens_per_month: number;
    features: string[];
    is_popular?: boolean;
    is_enterprise?: boolean;
  }) {
    const response = await apiClient.post("/admin/plans", data);
    return response;
  }

  async updatePlan(
    planId: string,
    data: {
      name?: string;
      description?: string;
      monthly_price?: number;
      yearly_price?: number;
      tokens_per_month?: number;
      features?: string[];
      is_popular?: boolean;
      is_active?: boolean;
    }
  ) {
    const response = await apiClient.put(`/admin/plans/${planId}`, data);
    return response;
  }

  async deletePlan(planId: string) {
    const response = await apiClient.delete(`/admin/plans/${planId}`);
    return response;
  }

  // Token Packs
  async getTokenPacks(params?: {
    limit?: number;
    offset?: number;
  }) {
    const response = await apiClient.get("/admin/token-packs", true, params);
    return response;
  }

  async createTokenPack(data: {
    name: string;
    slug: string;
    tokens: number;
    price: number;
    discount_percentage?: number;
    is_popular?: boolean;
  }) {
    const response = await apiClient.post("/admin/token-packs", data);
    return response;
  }

  async updateTokenPack(
    packId: string,
    data: {
      name?: string;
      tokens?: number;
      price?: number;
      discount_percentage?: number;
      is_popular?: boolean;
      is_active?: boolean;
    }
  ) {
    const response = await apiClient.put(
      `/admin/token-packs/${packId}`,
      data
    );
    return response;
  }

  async deleteTokenPack(packId: string) {
    const response = await apiClient.delete(`/admin/token-packs/${packId}`);
    return response;
  }

  async approveTokenPackRequest(requestId: string) {
    const { error } = await supabase
      .from('token_pack_requests')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', requestId);
    
    if (error) throw error;
  }

  async rejectTokenPackRequest(requestId: string, reason: string) {
    const { error } = await supabase
      .from('token_pack_requests')
      .update({ status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: reason })
      .eq('id', requestId);
    
    if (error) throw error;
  }

  // Settings
  async getSettings() {
    const response = await apiClient.get("/admin/settings");
    return response;
  }

  async updateSettings(data: {
    bank_name?: string;
    account_holder?: string;
    account_number?: string;
    iban?: string;
    swift_bic?: string;
    branch?: string;
    country?: string;
    additional_instructions?: string;
  }) {
    const response = await apiClient.put("/admin/settings", data);
    return response;
  }

  // MAC Address Management
  async getMACBindings(limit: number = 100, offset: number = 0) {
    const response = await apiClient.get("/admin/info/mac-bindings", true, { limit, offset });
    return response;
  }

  async getUserMACBindings(userId: string) {
    const response = await apiClient.get(`/admin/info/mac-bindings/${userId}`);
    return response;
  }

  async deactivateMACBinding(bindingId: string) {
    const response = await apiClient.post(`/admin/info/mac-bindings/${bindingId}/deactivate`, {});
    return response;
  }

  async getMACVerificationLog(statusFilter?: string, limit: number = 100, offset: number = 0) {
    const params: any = { limit, offset };
    if (statusFilter) {
      params.status_filter = statusFilter;
    }
    const response = await apiClient.get("/admin/info/mac-verification-log", true, params);
    return response;
  }

  async getMACStatistics() {
    const response = await apiClient.get("/admin/info/mac-stats");
    return response;
  }
}

export const adminService = new AdminService();

export function setAdminPassword(password: string): void {
  localStorage.setItem("admin_password", password);
}
