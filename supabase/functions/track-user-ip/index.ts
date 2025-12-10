import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractIP(req: Request): string | null {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  
  try {
    const url = new URL(req.url);
    return url.hostname || null;
  } catch {
    return null;
  }
}

function detectIPVersion(ip: string): 'ipv4' | 'ipv6' {
  return ip.includes(':') ? 'ipv6' : 'ipv4';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
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
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ip = extractIP(req);
    if (!ip) {
      return new Response(
        JSON.stringify({ success: true, message: 'Could not extract IP' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ipVersion = detectIPVersion(ip);
    const now = new Date().toISOString();

    // Update or create user_devices record
    const { data: device } = await supabase
      .from('user_devices')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (device) {
      await supabase
        .from('user_devices')
        .update({
          ip_current: ip,
          ip_last_seen_at: now,
          updated_at: now
        })
        .eq('id', device.id);
    } else {
      await supabase
        .from('user_devices')
        .insert({
          user_id: user.id,
          ip_current: ip,
          ip_last_seen_at: now,
          device_label: 'Primary Device'
        });
    }

    // Check if IP exists in history
    const { data: existingIP } = await supabase
      .from('user_ip_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('ip', ip)
      .single();

    if (existingIP) {
      // Update last_seen_at
      await supabase
        .from('user_ip_history')
        .update({ last_seen_at: now })
        .eq('id', existingIP.id);
    } else {
      // Create new IP history entry
      await supabase
        .from('user_ip_history')
        .insert({
          user_id: user.id,
          ip,
          ip_version: ipVersion,
          first_seen_at: now,
          last_seen_at: now
        });
    }

    return new Response(
      JSON.stringify({ success: true, ip, ipVersion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('IP tracking error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
