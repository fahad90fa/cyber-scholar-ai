import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data, adminPassword } = await req.json();

    // Verify admin password
    if (adminPassword !== Deno.env.get('ADMIN_PASSWORD')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin action: ${action}`, data);

    let result;

    switch (action) {
      case 'get_stats': {
        const [users, subscriptions, payments] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('subscriptions').select('*').eq('status', 'active'),
          supabase.from('payment_requests').select('*').eq('status', 'pending'),
        ]);

        const confirmedPayments = await supabase
          .from('payment_requests')
          .select('amount')
          .eq('status', 'confirmed');

        const totalRevenue = (confirmedPayments.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);

        result = {
          totalUsers: users.count || 0,
          activeSubscriptions: subscriptions.data?.length || 0,
          pendingPayments: payments.data?.length || 0,
          totalRevenue,
        };
        break;
      }

      case 'get_users': {
        const { data: users, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        result = users;
        break;
      }

      case 'get_user': {
        const { userId } = data;
        const [profile, subscription, payments, transactions] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
          supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('payment_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('token_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        ]);
        result = {
          profile: profile.data,
          subscriptions: subscription.data,
          payments: payments.data,
          transactions: transactions.data,
        };
        break;
      }

      case 'get_payments': {
        const { data: payments, error } = await supabase
          .from('payment_requests')
          .select('*, profiles(email, full_name)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        result = payments;
        break;
      }

      case 'confirm_payment': {
        const { paymentId, adminNotes, userId, planId, billingCycle, amount, tokens } = data;
        
        const now = new Date();
        const expiresAt = billingCycle === 'yearly' 
          ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
          : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

        // Update payment request
        await supabase
          .from('payment_requests')
          .update({ 
            status: 'confirmed', 
            confirmed_at: now.toISOString(),
            admin_notes: adminNotes 
          })
          .eq('id', paymentId);

        // Get plan details
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();

        // Create subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_id: planId,
            plan_name: plan?.name,
            billing_cycle: billingCycle,
            price_paid: amount,
            tokens_total: tokens,
            tokens_used: 0,
            status: 'active',
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            activated_by_admin: true,
            admin_notes: adminNotes,
          })
          .select()
          .single();

        if (subError) throw subError;

        // Update profile
        await supabase
          .from('profiles')
          .update({
            subscription_tier: plan?.slug,
            subscription_status: 'active',
            subscription_id: subscription.id,
            tokens_total: tokens,
            tokens_used: 0,
            tokens_reset_date: expiresAt.toISOString().split('T')[0],
          })
          .eq('id', userId);

        // Log token transaction
        await supabase.from('token_transactions').insert({
          user_id: userId,
          type: 'subscription_reset',
          amount: tokens,
          balance_before: 0,
          balance_after: tokens,
          reason: `Subscription activated: ${plan?.name} (${billingCycle})`,
          admin_action: true,
        });

        result = { success: true, subscription };
        break;
      }

      case 'reject_payment': {
        const { paymentId, reason } = data;
        await supabase
          .from('payment_requests')
          .update({ 
            status: 'rejected', 
            rejected_at: new Date().toISOString(),
            rejection_reason: reason 
          })
          .eq('id', paymentId);
        result = { success: true };
        break;
      }

      case 'add_tokens': {
        const { userId, amount, reason, note } = data;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('tokens_total, tokens_used')
          .eq('id', userId)
          .single();

        const currentBalance = (profile?.tokens_total || 0) - (profile?.tokens_used || 0);
        const newTotal = (profile?.tokens_total || 0) + amount;

        await supabase
          .from('profiles')
          .update({ tokens_total: newTotal })
          .eq('id', userId);

        await supabase.from('token_transactions').insert({
          user_id: userId,
          type: 'admin_add',
          amount: amount,
          balance_before: currentBalance,
          balance_after: currentBalance + amount,
          reason,
          note,
          admin_action: true,
        });

        result = { success: true };
        break;
      }

      case 'remove_tokens': {
        const { userId, amount, reason, note } = data;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('tokens_total, tokens_used')
          .eq('id', userId)
          .single();

        const currentBalance = (profile?.tokens_total || 0) - (profile?.tokens_used || 0);
        const newUsed = (profile?.tokens_used || 0) + amount;

        await supabase
          .from('profiles')
          .update({ tokens_used: newUsed })
          .eq('id', userId);

        await supabase.from('token_transactions').insert({
          user_id: userId,
          type: 'admin_remove',
          amount: -amount,
          balance_before: currentBalance,
          balance_after: currentBalance - amount,
          reason,
          note,
          admin_action: true,
        });

        result = { success: true };
        break;
      }

      case 'get_plans': {
        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('sort_order');
        result = plans;
        break;
      }

      case 'update_plan': {
        const { planId, updates } = data;
        await supabase
          .from('subscription_plans')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', planId);
        result = { success: true };
        break;
      }

      case 'get_token_packs': {
        const { data: packs } = await supabase
          .from('token_packs')
          .select('*')
          .order('sort_order');
        result = packs;
        break;
      }

      case 'update_token_pack': {
        const { packId, updates } = data;
        await supabase
          .from('token_packs')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', packId);
        result = { success: true };
        break;
      }

      case 'get_bank_settings': {
        const { data: settings } = await supabase
          .from('bank_settings')
          .select('*')
          .limit(1)
          .single();
        result = settings;
        break;
      }

      case 'update_bank_settings': {
        const { settings } = data;
        const { data: existing } = await supabase
          .from('bank_settings')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('bank_settings')
            .update({ ...settings, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else {
          await supabase.from('bank_settings').insert(settings);
        }
        result = { success: true };
        break;
      }

      case 'ban_user': {
        const { userId, reason } = data;
        await supabase
          .from('profiles')
          .update({ 
            is_banned: true, 
            banned_at: new Date().toISOString(),
            ban_reason: reason 
          })
          .eq('id', userId);
        result = { success: true };
        break;
      }

      case 'unban_user': {
        const { userId } = data;
        await supabase
          .from('profiles')
          .update({ 
            is_banned: false, 
            banned_at: null,
            ban_reason: null 
          })
          .eq('id', userId);
        result = { success: true };
        break;
      }

      case 'cancel_subscription': {
        const { subscriptionId, userId, reason } = data;
        await supabase
          .from('subscriptions')
          .update({ 
            status: 'cancelled', 
            cancelled_at: new Date().toISOString(),
            cancel_reason: reason 
          })
          .eq('id', subscriptionId);

        await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'cancelled',
            subscription_tier: null 
          })
          .eq('id', userId);
        result = { success: true };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Admin action error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
