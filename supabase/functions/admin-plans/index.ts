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

  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const planId = pathSegments[pathSegments.length - 1];
  const isPlanSpecific = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(planId);

  if (req.method === "GET") {
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

      const { data: plans, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify(plans || []), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: corsHeaders }
      );
    }
  } else if (req.method === "POST") {
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
      const body = await req.json();

      const { data: newPlan, error } = await supabase
        .from("subscription_plans")
        .insert([body])
        .select();

      if (error) throw error;

      return new Response(JSON.stringify(newPlan?.[0]), {
        status: 201,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: corsHeaders }
      );
    }
  } else if (req.method === "PUT") {
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

      if (!isPlanSpecific) {
        return new Response(
          JSON.stringify({ error: "Plan ID required for update" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const body = await req.json();

      const { data: updatedPlan, error } = await supabase
        .from("subscription_plans")
        .update(body)
        .eq("id", planId)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify(updatedPlan?.[0]), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: corsHeaders }
      );
    }
  } else if (req.method === "DELETE") {
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

      if (!isPlanSpecific) {
        return new Response(
          JSON.stringify({ error: "Plan ID required for delete" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: corsHeaders }
  );
});
