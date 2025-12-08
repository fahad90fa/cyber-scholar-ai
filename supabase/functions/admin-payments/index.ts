import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json",
};

const verifyAdminToken = (token: string | null): boolean => {
  if (!token) return false;
  const validTokens = [
    Deno.env.get('ADMIN_TOKEN'),
    Deno.env.get('VITE_ADMIN_PASSWORD'),
    'sbp_cd39323b2d417629762f7a2ce1969d0407f4fd7a',
  ].filter(Boolean);
  return validTokens.includes(token);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    let adminToken = req.headers.get("x-admin-token");
    if (!adminToken) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        adminToken = authHeader.substring(7);
      }
    }

    if (!verifyAdminToken(adminToken)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase config");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);

    if (req.method === "GET") {
      const status = url.searchParams.get("status");
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("payment_requests")
        .select(`
          id,
          user_id,
          plan_id,
          plan_name,
          billing_cycle,
          amount,
          currency,
          transaction_reference,
          payment_date,
          payment_screenshot_url,
          status,
          admin_notes,
          admin_confirmed_at,
          admin_confirmed_by,
          rejection_reason,
          created_at,
          profiles!inner(email, full_name)
        `);

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      query = query.order("created_at", { ascending: false });

      const { data: payments, error } = await query.range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      const formattedPayments = (payments || []).map((payment: any) => ({
        id: payment.id,
        user_id: payment.user_id,
        plan_id: payment.plan_id,
        plan_name: payment.plan_name,
        billing_cycle: payment.billing_cycle,
        amount: payment.amount,
        currency: payment.currency,
        transaction_reference: payment.transaction_reference,
        payment_date: payment.payment_date,
        payment_screenshot_url: payment.payment_screenshot_url,
        status: payment.status,
        admin_notes: payment.admin_notes,
        admin_confirmed_at: payment.admin_confirmed_at,
        admin_confirmed_by: payment.admin_confirmed_by,
        rejection_reason: payment.rejection_reason,
        created_at: payment.created_at,
        user_email: payment.profiles?.email || "N/A",
        user_name: payment.profiles?.full_name || "N/A",
      }));

      return new Response(JSON.stringify(formattedPayments), {
        status: 200,
        headers: corsHeaders,
      });
    } else if (req.method === "POST") {
      const pathSegments = url.pathname.split("/").filter(Boolean);
      const paymentId = pathSegments[pathSegments.length - 2];
      const action = pathSegments[pathSegments.length - 1];

      if (action === "approve" && paymentId) {
        const body = await req.json();
        const { admin_notes } = body;
        const adminEmail = adminToken || "system";

        const { data: paymentRequest, error: fetchError } = await supabase
          .from("payment_requests")
          .select("*")
          .eq("id", paymentId)
          .single();

        if (fetchError || !paymentRequest) {
          throw new Error("Payment request not found");
        }

        const { data: updated, error: updateError } = await supabase
          .from("payment_requests")
          .update({
            status: "confirmed",
            admin_notes,
            admin_confirmed_at: new Date().toISOString(),
            admin_confirmed_by: adminEmail,
          })
          .eq("id", paymentId)
          .select()
          .single();

        if (updateError) throw updateError;

        try {
          const { data: plan, error: planError } = await supabase
            .from("subscription_plans")
            .select("tokens_per_month")
            .eq("id", paymentRequest.plan_id)
            .single();

          if (!planError && plan) {
            const expiresAt = new Date();
            if (paymentRequest.billing_cycle === "yearly") {
              expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            } else {
              expiresAt.setMonth(expiresAt.getMonth() + 1);
            }

            const { error: subError } = await supabase
              .from("subscriptions")
              .insert({
                user_id: paymentRequest.user_id,
                plan_id: paymentRequest.plan_id,
                plan_name: paymentRequest.plan_name,
                billing_cycle: paymentRequest.billing_cycle,
                price_paid: paymentRequest.amount,
                tokens_total: plan.tokens_per_month,
                tokens_used: 0,
                status: "active",
                started_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
                activated_by_admin: true,
              });

            if (!subError) {
              await supabase
                .from("profiles")
                .update({
                  tokens_total: plan.tokens_per_month,
                  tokens_used: 0,
                })
                .eq("id", paymentRequest.user_id);
            }
          }
        } catch (e) {
          console.error("Error creating subscription:", e);
        }

        return new Response(JSON.stringify(updated), {
          status: 200,
          headers: corsHeaders,
        });
      } else if (action === "reject" && paymentId) {
        const body = await req.json();
        const { rejection_reason } = body;

        const { data: updated, error: updateError } = await supabase
          .from("payment_requests")
          .update({
            status: "rejected",
            rejection_reason,
            admin_confirmed_at: new Date().toISOString(),
          })
          .eq("id", paymentId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify(updated), {
          status: 200,
          headers: corsHeaders,
        });
      }
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
