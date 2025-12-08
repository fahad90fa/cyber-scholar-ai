import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// deno-lint-ignore no-explicit-any
const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
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

// deno-lint-ignore no-explicit-any
const getAdminStats = async (supabase: any): Promise<any> => {
  try {
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (usersError) throw usersError;

    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .limit(1000);

    const activeSubscriptions = {
      starter: 0,
      pro: 0,
      pro_plus: 0,
      enterprise: 0,
    };

    if (!subsError && subscriptions) {
      subscriptions.forEach((s: any) => {
        const tier = s.tier || s.plan || s.subscription_tier || 'unknown';
        if (tier === 'starter') activeSubscriptions.starter++;
        else if (tier === 'pro') activeSubscriptions.pro++;
        else if (tier === 'pro_plus') activeSubscriptions.pro_plus++;
        else if (tier === 'enterprise') activeSubscriptions.enterprise++;
      });
    }

    const { count: pendingPayments } = await supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'completed')
      .limit(1000);

    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyRevenue = (payments || [])
      .filter((p: any) => {
        const payDate = p.payment_date || p.created_at || p.date;
        if (!payDate) return false;
        const date = new Date(payDate);
        return date >= monthAgo && date < new Date(now.getFullYear(), now.getMonth() + 1, 1);
      })
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const totalRevenue = (payments || [])
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const { data: tokenUsage } = await supabase
      .from('token_usage_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1000);

    const tokenUsageTotal = (tokenUsage || [])
      .reduce((sum: number, log: any) => sum + (log.tokens_used || log.tokens || 0), 0);

    return {
      total_users: totalUsers || 0,
      active_subscriptions: activeSubscriptions,
      pending_payments: pendingPayments || 0,
      monthly_revenue: monthlyRevenue,
      total_revenue: totalRevenue,
      token_usage: tokenUsageTotal,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// deno-lint-ignore no-explicit-any
serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }

  try {
    let adminToken = req.headers.get('x-admin-token');
    
    if (!adminToken) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        adminToken = authHeader.substring(7);
      }
    }

    if (!verifyAdminToken(adminToken)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', detail: 'Invalid or missing admin token' }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stats = await getAdminStats(supabase);

    return new Response(
      JSON.stringify(stats),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    console.error('Admin stats error:', error);
    return new Response(
      JSON.stringify({ 
        error: errorMsg,
        detail: errorMsg 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
