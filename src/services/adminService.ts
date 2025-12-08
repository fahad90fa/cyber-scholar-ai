import { apiClient } from "./api";

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
  }) {
    const response = await apiClient.get("/admin/users", true, params);
    return response;
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
  }) {
    const response = await apiClient.get("/admin/subscriptions", true, params);
    return response;
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
  }): Promise<AdminPayment[]> {
    const response = await apiClient.get<AdminPayment[]>("/admin/payments", true, params);
    return response;
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
}

export const adminService = new AdminService();
