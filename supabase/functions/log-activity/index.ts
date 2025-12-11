import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtDecode } from "https://esm.sh/jwt-decode@4";

// deno-lint-ignore no-explicit-any
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// deno-lint-ignore no-explicit-any
const getClientInfo = (req: any) => {
  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    // deno-lint-ignore no-explicit-any
    let userId: string | null = null;
    let emailSnapshot: string | null = null;

    try {
      const decoded = jwtDecode(token) as any;
      userId = decoded.sub || null;
      emailSnapshot = decoded.email || null;
    } catch {
      userId = null;
    }

    const { event_type, event_category, description, metadata } = await req.json();

    if (!event_type || !event_category) {
      return new Response(
        JSON.stringify({ error: 'event_type and event_category are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { ipAddress, userAgent } = getClientInfo(req);

    const { error } = await supabase.from('audit_log').insert({
      user_id: userId,
      email_snapshot: emailSnapshot,
      event_type,
      event_category,
      description: description || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to insert audit log:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to log activity' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Log activity error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
