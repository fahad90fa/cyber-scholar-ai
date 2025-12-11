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
  if (!token) {
    console.log('No token provided');
    return false;
  }
  const envToken = Deno.env.get('ADMIN_TOKEN');
  const adminPassword = Deno.env.get('ADMIN_PASSWORD');
  const hardcodedToken = 'sbp_cd39323b2d417629762f7a2ce1969d0407f4fd7a';
  const plainPassword = 'fahad123@fa';
  const validTokens = [envToken, adminPassword, hardcodedToken, plainPassword].filter(Boolean);
  
  console.log('Token check - env token:', !!envToken, 'admin password:', !!adminPassword, 'hardcoded token:', !!hardcodedToken);
  console.log('Received token:', token);
  console.log('Valid tokens:', validTokens);
  
  const isValid = validTokens.includes(token);
  console.log('Token valid:', isValid);
  return isValid;
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

    console.log('=== ADMIN USERS FUNCTION ===');
    console.log('Request method:', req.method);
    console.log('Admin token received:', adminToken);
    
    if (!verifyAdminToken(adminToken)) {
      console.log('Token verification failed!');
      return new Response(
        JSON.stringify({ error: "Unauthorized", receivedToken: adminToken }),
        { status: 401, headers: corsHeaders }
      );
    }
    
    console.log('Token verification passed!');

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase config");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    let userId: string | null = null;
    let action: string | null = null;
    
    for (let i = 0; i < pathSegments.length; i++) {
      if (uuidRegex.test(pathSegments[i])) {
        userId = pathSegments[i];
        action = pathSegments[i + 1] || null;
        break;
      }
    }
    
    const isUserSpecific = !!userId;

    if (req.method === "GET") {
      // Get single user by ID
      if (isUserSpecific && userId) {
        console.log('Fetching single user:', userId);
        const { data: user, error } = await supabase
          .from("profiles")
          .select("id, email, full_name, subscription_tier, subscription_status, tokens_total, tokens_used, is_banned, bonus_tokens, created_at, banned_at, ban_reason")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Query error:", error);
          throw error;
        }

        return new Response(JSON.stringify(user || {}), {
          status: 200,
          headers: corsHeaders,
        });
      }

      // List users
      const search = url.searchParams.get("search");
      const tier = url.searchParams.get("tier");
      const status = url.searchParams.get("status");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const sortBy = url.searchParams.get("sortBy") || "created_at";
      const sortOrder = url.searchParams.get("sortOrder") || "desc";

      let query = supabase
        .from("profiles")
        .select("id, email, full_name, subscription_tier, subscription_status, tokens_total, tokens_used, is_banned, created_at");

      if (search) {
        query = query.or(
          `email.ilike.%${search}%,full_name.ilike.%${search}%`
        );
      }

      if (tier && tier !== "all") {
        query = query.eq("subscription_tier", tier);
      }

      if (status && status !== "all") {
        query = query.eq("subscription_status", status);
      }

      const orderDirection = sortOrder === "asc" ? true : false;
      query = query.order(sortBy, { ascending: orderDirection });

      const { data: users, error } = await query.range(offset, offset + limit - 1);

      if (error) {
        console.error("Query error:", error);
        throw error;
      }

      console.log("Fetched users:", users?.length || 0);
      return new Response(JSON.stringify(users || []), {
        status: 200,
        headers: corsHeaders,
      });
    } else if (req.method === "PUT") {
      // Update user
      if (!isUserSpecific) {
        return new Response(
          JSON.stringify({ error: "User ID required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const body = await req.json();
      const { data: updatedUser, error } = await supabase
        .from("profiles")
        .update(body)
        .eq("id", userId)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify(updatedUser?.[0]), {
        status: 200,
        headers: corsHeaders,
      });
    } else if (req.method === "POST") {
      // Handle action-based endpoints
      const body = await req.json();

      if (action === "ban") {
        const { data: updatedUser, error } = await supabase
          .from("profiles")
          .update({
            is_banned: true,
            ban_reason: body.reason || null,
            banned_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select();

        if (error) throw error;
        return new Response(JSON.stringify(updatedUser?.[0]), {
          status: 200,
          headers: corsHeaders,
        });
      } else if (action === "unban") {
        const { data: updatedUser, error } = await supabase
          .from("profiles")
          .update({
            is_banned: false,
            ban_reason: null,
            banned_at: null,
          })
          .eq("id", userId)
          .select();

        if (error) throw error;
        return new Response(JSON.stringify(updatedUser?.[0]), {
          status: 200,
          headers: corsHeaders,
        });
      } else if (action === "tokens") {
        const tokensIdx = pathSegments.indexOf("tokens");
        const subaction = tokensIdx !== -1 ? pathSegments[tokensIdx + 1] : null;
        
        if (subaction === "add") {
          // Add tokens
          const { amount, reason, notes } = body;
          
          const { data: profile, error: getError } = await supabase
            .from("profiles")
            .select("tokens_total, tokens_used, bonus_tokens")
            .eq("id", userId)
            .maybeSingle();

          if (getError) throw getError;
          
          if (!profile) throw new Error("User profile not found");

          const newTokensTotal = (profile.tokens_total || 0) + amount;

          // Update profile
          const { data: updatedUser, error: updateError } = await supabase
            .from("profiles")
            .update({ tokens_total: newTokensTotal })
            .eq("id", userId)
            .select();

          if (updateError) throw updateError;

          // Log transaction
          await supabase.from("token_transactions").insert([{
            user_id: userId,
            amount,
            transaction_type: reason || "bonus",
            reason,
            admin_notes: notes,
          }]);

          return new Response(JSON.stringify(updatedUser?.[0]), {
            status: 200,
            headers: corsHeaders,
          });
        } else if (subaction === "remove") {
          // Remove tokens
          const { amount, reason, notes } = body;

          const { data: profile, error: getError } = await supabase
            .from("profiles")
            .select("tokens_total, tokens_used, bonus_tokens")
            .eq("id", userId)
            .maybeSingle();

          if (getError) throw getError;
          
          if (!profile) throw new Error("User profile not found");

          const newTokensTotal = Math.max(0, (profile.tokens_total || 0) - amount);

          // Update profile
          const { data: updatedUser, error: updateError } = await supabase
            .from("profiles")
            .update({ tokens_total: newTokensTotal })
            .eq("id", userId)
            .select();

          if (updateError) throw updateError;

          // Log transaction
          await supabase.from("token_transactions").insert([{
            user_id: userId,
            amount: -amount,
            transaction_type: reason || "adjustment",
            reason,
            admin_notes: notes,
          }]);

          return new Response(JSON.stringify(updatedUser?.[0]), {
            status: 200,
            headers: corsHeaders,
          });
        }
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
