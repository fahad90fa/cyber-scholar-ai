import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const verifyAdminToken = (token: string | null): boolean => {
  if (!token) {
    return false;
  }
  const adminPassword = Deno.env.get('VITE_ADMIN_PASSWORD');
  const adminToken = Deno.env.get('VITE_ADMIN_TOKEN');
  const hardcodedToken = 'sbp_cd39323b2d417629762f7a2ce1969d0407f4fd7a';
  const validTokens = [adminPassword, adminToken, hardcodedToken].filter(Boolean);
  
  return validTokens.includes(token);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let adminToken = req.headers.get('x-admin-token');
    if (!adminToken) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        adminToken = authHeader.substring(7);
      }
    }

    if (!verifyAdminToken(adminToken)) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (userId) {
      // Get specific user's detailed info
      const { data: targetUser } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .eq('id', userId)
        .single();

      if (!targetUser) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: devices } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', userId);

      const { data: ipHistory } = await supabase
        .from('user_ip_history')
        .select('*')
        .eq('user_id', userId)
        .order('last_seen_at', { ascending: false });

      return new Response(
        JSON.stringify({
          user: targetUser,
          devices: devices || [],
          ipHistory: ipHistory || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Get list of all users with current IP
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      const userList = await Promise.all(
        (allUsers || []).map(async (user) => {
          const { data: device } = await supabase
            .from('user_devices')
            .select('ip_current, ip_last_seen_at, last_lat, last_lng, location_updated_at')
            .eq('user_id', user.id)
            .single();

          return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            current_ip: device?.ip_current || 'N/A',
            last_seen: device?.ip_last_seen_at || null,
            location: device ? { lat: device.last_lat, lng: device.last_lng } : null,
            location_updated_at: device?.location_updated_at || null
          };
        })
      );

      return new Response(
        JSON.stringify({ users: userList }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Admin info error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
