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

    if (req.method === "GET") {
      const { data: bankSettings, error: bankError } = await supabase
        .from("bank_settings")
        .select("*")
        .single();

      if (bankError && bankError.code !== "PGRST116") {
        throw bankError;
      }

      const { data: generalSettings, error: generalError } = await supabase
        .from("general_settings")
        .select("*")
        .single();

      if (generalError && generalError.code !== "PGRST116") {
        throw generalError;
      }

      return new Response(JSON.stringify({
        bank_settings: bankSettings || {},
        general_settings: generalSettings || {},
      }), {
        status: 200,
        headers: corsHeaders,
      });
    } else if (req.method === "PUT" || req.method === "POST") {
      const body = await req.json();
      const bankSettingsData = body.bank_settings;
      const generalSettingsData = body.general_settings;

      if (bankSettingsData) {
        const { data: existing } = await supabase
          .from("bank_settings")
          .select("id")
          .single();

        if (existing) {
          const { data, error } = await supabase
            .from("bank_settings")
            .update(bankSettingsData)
            .eq("id", existing.id)
            .select()
            .single();

          if (error) {
            console.error("Bank settings update error:", error);
            throw error;
          }
        } else {
          const { data, error } = await supabase
            .from("bank_settings")
            .insert([bankSettingsData])
            .select()
            .single();

          if (error) {
            console.error("Bank settings insert error:", error);
            throw error;
          }
        }
      }

      if (generalSettingsData) {
        const { data: existing } = await supabase
          .from("general_settings")
          .select("id")
          .single();

        if (existing) {
          const { data, error } = await supabase
            .from("general_settings")
            .update(generalSettingsData)
            .eq("id", existing.id)
            .select()
            .single();

          if (error) {
            console.error("General settings update error:", error);
            throw error;
          }
        } else {
          const { data, error } = await supabase
            .from("general_settings")
            .insert([generalSettingsData])
            .select()
            .single();

          if (error) {
            console.error("General settings insert error:", error);
            throw error;
          }
        }
      }

      const { data: bankSettings } = await supabase
        .from("bank_settings")
        .select("*")
        .single();

      const { data: generalSettings } = await supabase
        .from("general_settings")
        .select("*")
        .single();

      return new Response(JSON.stringify({
        bank_settings: bankSettings || {},
        general_settings: generalSettings || {},
      }), {
        status: 200,
        headers: corsHeaders,
      });
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
