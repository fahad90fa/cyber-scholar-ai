import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// deno-lint-ignore no-explicit-any
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminToken = req.headers.get('x-admin-token');
    if (!verifyAdminToken(adminToken)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const params = {
      userId: url.searchParams.get('userId'),
      eventType: url.searchParams.get('eventType'),
      category: url.searchParams.get('category'),
      fromDate: url.searchParams.get('fromDate'),
      toDate: url.searchParams.get('toDate'),
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '50'),
    };

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // deno-lint-ignore no-explicit-any
    let query: any = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }
    if (params.eventType) {
      query = query.eq('event_type', params.eventType);
    }
    if (params.category && params.category !== 'all') {
      query = query.eq('event_category', params.category);
    }
    if (params.fromDate) {
      query = query.gte('created_at', new Date(params.fromDate).toISOString());
    }
    if (params.toDate) {
      const endDate = new Date(params.toDate);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDate.toISOString());
    }

    const offset = (params.page - 1) * params.limit;
    const { data, count, error } = await query
      .range(offset, offset + params.limit - 1);

    if (error) {
      console.error('Failed to fetch audit logs:', JSON.stringify(error));
      if (error.message && error.message.includes("Could not find the table")) {
        return new Response(
          JSON.stringify({
            data: [],
            total: 0,
            page: params.page,
            limit: params.limit,
            totalPages: 0,
            message: 'Audit logs table not yet created'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to fetch logs', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        data: data || [],
        total: count || 0,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil((count || 0) / params.limit),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get logs error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
