import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Subscription {
  id: string;
  plan_name: string;
  billing_cycle: string;
  status: string;
  started_at: string;
  expires_at: string;
  tokens_used: number;
  tokens_total: number;
  price_paid: number;
  user_id: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

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
    Deno.env.get('ADMIN_PASSWORD'),
    'sbp_cd39323b2d417629762f7a2ce1969d0407f4fd7a',
    'fahad123@fa',
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
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const subscriptionId = pathSegments[pathSegments.length - 2];
    const action = pathSegments[pathSegments.length - 1];
    const isSubSpecific = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(subscriptionId);

    if (req.method === "GET") {
      // List subscriptions
      const plan = url.searchParams.get("plan");
      const status = url.searchParams.get("status");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("subscriptions")
        .select("id, plan_name, billing_cycle, status, started_at, expires_at, tokens_used, tokens_total, price_paid, user_id, created_at");

      if (plan && plan !== "all") {
        query = query.eq("plan_name", plan);
      }

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      query = query.order("created_at", { ascending: false });

      const { data: subscriptions, error } = await query.range(offset, offset + limit - 1);

      if (error) {
        console.error("Subscriptions query error:", error);
        throw error;
      }

      const userIds = [...new Set((subscriptions || []).map((s: Subscription) => s.user_id))];
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (profileError) {
        console.error("Profiles query error:", profileError);
        throw profileError;
      }

      const profileMap = Object.fromEntries(
        (profiles || []).map((p: Profile) => [p.id, p])
      );

      const formattedSubs = (subscriptions || []).map((sub: Subscription) => {
        const profile = profileMap[sub.user_id] as Profile | undefined;
        return {
          id: sub.id,
          plan_name: sub.plan_name,
          billing_cycle: sub.billing_cycle,
          status: sub.status,
          started_at: sub.started_at,
          expires_at: sub.expires_at,
          tokens_used: sub.tokens_used,
          tokens_total: sub.tokens_total,
          price_paid: sub.price_paid,
          user_id: sub.user_id,
          user_name: profile?.full_name || "N/A",
          user_email: profile?.email || "N/A",
        };
      });

      return new Response(JSON.stringify(formattedSubs), {
        status: 200,
        headers: corsHeaders,
      });
    } else if (req.method === "POST") {
      const body = await req.json();

      if (action === "activate") {
        const { user_id, plan_id, billing_cycle } = body;

        const { data: plan, error: planError } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", plan_id)
          .single();

        if (planError || !plan) throw new Error("Plan not found");

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (billing_cycle === "yearly" ? 12 : 1));

        const { data: subscription, error } = await supabase
          .from("subscriptions")
          .insert([{
            user_id,
            plan_id: plan.id,
            plan_name: plan.name,
            billing_cycle,
            price_paid: billing_cycle === "yearly" ? plan.yearly_price : plan.monthly_price,
            tokens_total: plan.tokens_per_month,
            status: "active",
            started_at: startDate.toISOString(),
            expires_at: endDate.toISOString(),
          }])
          .select();

        if (error) throw error;

        // Update user profile
        await supabase
          .from("profiles")
          .update({
            subscription_tier: plan.slug,
            subscription_status: "active",
            subscription_id: subscription?.[0]?.id,
          })
          .eq("id", user_id);

        return new Response(JSON.stringify(subscription?.[0]), {
          status: 201,
          headers: corsHeaders,
        });
      } else if (action === "extend" && isSubSpecific) {
        const { months } = body;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("id", subscriptionId)
          .single();

        if (!sub) throw new Error("Subscription not found");

        const newExpires = new Date(sub.expires_at);
        newExpires.setMonth(newExpires.getMonth() + months);

        const { data: updated, error } = await supabase
          .from("subscriptions")
          .update({ expires_at: newExpires.toISOString() })
          .eq("id", subscriptionId)
          .select();

        if (error) throw error;

        return new Response(JSON.stringify(updated?.[0]), {
          status: 200,
          headers: corsHeaders,
        });
      } else if (action === "change-plan" && isSubSpecific) {
        const { plan_id } = body;

        const { data: plan } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", plan_id)
          .single();

        if (!plan) throw new Error("Plan not found");

        const { data: updated, error } = await supabase
          .from("subscriptions")
          .update({
            plan_id,
            plan_name: plan.name,
            tokens_total: plan.tokens_per_month,
          })
          .eq("id", subscriptionId)
          .select();

        if (error) throw error;

        return new Response(JSON.stringify(updated?.[0]), {
          status: 200,
          headers: corsHeaders,
        });
      } else if (action === "cancel" && isSubSpecific) {
        const { reason } = body;

        const { data: updated, error } = await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            cancel_reason: reason,
          })
          .eq("id", subscriptionId)
          .select();

        if (error) throw error;

        return new Response(JSON.stringify(updated?.[0]), {
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
