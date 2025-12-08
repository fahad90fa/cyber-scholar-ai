import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "./api";

async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.debug("Got user from Supabase auth:", user.id);
      return user;
    }
  } catch (error) {
    console.debug("Auth getUser error:", error);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.debug("Got user from Supabase session:", session.user.id);
      return session.user;
    }
  } catch (error) {
    console.debug("Session error:", error);
  }

  throw new Error("User not authenticated - Supabase session not found");
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  tokens_per_month: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: "monthly" | "yearly";
  price_paid: number;
  tokens_total: number;
  tokens_used: number;
  status: "active" | "expired" | "cancelled";
  started_at: string;
  expires_at: string;
  admin_notes?: string;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: "monthly" | "yearly";
  amount: number;
  transaction_reference: string;
  payment_date: string;
  payment_screenshot_url?: string;
  status: "pending" | "confirmed" | "rejected" | "expired";
  created_at: string;
}

export interface BankSettings {
  bank_name: string;
  account_holder: string;
  account_number: string;
  iban: string;
  swift_bic: string;
  branch: string;
  country: string;
  additional_instructions: string;
}

class SubscriptionService {
  // Plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return (data as SubscriptionPlan[]) || [];
  }

  async getPlanBySlug(slug: string): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Plan not found");
    return data as SubscriptionPlan;
  }

  // Subscriptions
  async getUserSubscription(): Promise<Subscription | null> {
    const response = await apiClient.get<Subscription | null>("/subscriptions/current");
    return response;
  }

  async getSubscriptionHistory(): Promise<Subscription[]> {
    const response = await apiClient.get<Subscription[]>("/subscriptions/history");
    return response;
  }

  // Payment Requests
  async createPaymentRequest(
    planSlug: string,
    billingCycle: "monthly" | "yearly",
    userId?: string
  ): Promise<PaymentRequest> {
    const plan = await this.getPlanBySlug(planSlug);
    
    const response = await apiClient.post<PaymentRequest>("/payment-requests", {
      plan_id: plan.id,
      billing_cycle: billingCycle,
    });
    
    return response;
  }

  async submitPaymentProof(
    paymentRequestId: string,
    data: {
      transaction_reference: string;
      payment_date: string;
      screenshot_url?: string;
    }
  ): Promise<PaymentRequest> {
    const submitData: any = {
      transaction_reference: data.transaction_reference,
      payment_date: data.payment_date,
    };

    if (data.screenshot_url && data.screenshot_url.trim()) {
      submitData.screenshot_url = data.screenshot_url;
    }

    console.log("Submitting payment proof with:", submitData);

    const response = await apiClient.post<PaymentRequest>(
      `/payment-requests/${paymentRequestId}/submit`,
      submitData
    );

    console.log("Payment request submitted successfully:", response.id);
    return response;
  }

  async getPaymentRequest(id: string): Promise<PaymentRequest> {
    const response = await apiClient.get<PaymentRequest>(`/payment-requests/${id}`);
    return response;
  }

  async getUserPaymentRequests(userId?: string): Promise<PaymentRequest[]> {
    const response = await apiClient.get<PaymentRequest[]>("/payment-requests/user");
    return response;
  }

  // Bank Settings
  async getBankSettings(): Promise<BankSettings> {
    const { data, error } = await supabase
      .from("bank_settings")
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return {
        bank_name: "N/A",
        account_holder: "N/A",
        account_number: "N/A",
        iban: "N/A",
        swift_bic: "N/A",
        branch: "N/A",
        country: "N/A",
        additional_instructions: "Please contact support for payment details",
      };
    }
    return {
      bank_name: data.bank_name,
      account_holder: data.account_holder,
      account_number: data.account_number,
      iban: data.iban,
      swift_bic: data.swift_code,
      branch: data.branch_name,
      country: data.country,
      additional_instructions: data.additional_instructions,
    };
  }

  // Tokens
  async getUserTokens(): Promise<{
    total: number;
    used: number;
    available: number;
  }> {
    const response = await apiClient.get<{
      total: number;
      used: number;
      available: number;
    }>("/tokens/balance");
    return response;
  }

  async getTokenTransactions(): Promise<
    Array<{
      id: string;
      amount: number;
      type: string;
      reason: string;
      created_at: string;
    }>
  > {
    const response = await apiClient.get<
      Array<{
        id: string;
        amount: number;
        type: string;
        reason: string;
        created_at: string;
      }>
    >("/tokens/transactions");
    return response;
  }

  // Token Packs
  async getTokenPacks() {
    const response = await apiClient.get("/token-packs");
    return response;
  }

  async purchaseTokenPack(packId: string): Promise<PaymentRequest> {
    const response = await apiClient.post<PaymentRequest>("/token-packs/purchase", {
      pack_id: packId,
    });
    return response;
  }
}

export const subscriptionService = new SubscriptionService();
