import { supabase } from '@/integrations/supabase/client';

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface LogOptions {
  description?: string;
  metadata?: Record<string, unknown>;
}

const callLogActivity = async (
  eventType: string,
  eventCategory: string,
  options: LogOptions = {}
) => {
  try {
    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token;

    if (!token) {
      console.warn('No auth token available for logging');
      return;
    }

    const response = await fetch(`${VITE_SUPABASE_URL}/functions/v1/log-activity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        event_category: eventCategory,
        description: options.description,
        metadata: options.metadata || {},
      }),
    });

    if (!response.ok) {
      console.error('Failed to log activity:', response.statusText);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const logAuthEvent = (
  eventType: 'auth_login' | 'auth_logout' | 'auth_signup' | 'auth_password_change',
  options: LogOptions = {}
) => {
  return callLogActivity(eventType, 'auth', options);
};

export const logChatEvent = (
  eventType: 'chat_message_sent' | 'chat_session_created',
  options: LogOptions = {}
) => {
  return callLogActivity(eventType, 'chat', options);
};

export const logTrainingEvent = (
  eventType: 'training_document_uploaded' | 'training_document_deleted',
  options: LogOptions = {}
) => {
  return callLogActivity(eventType, 'training', options);
};

export const logSubscriptionEvent = (
  eventType: 'subscription_activated' | 'subscription_cancelled' | 'payment_created',
  options: LogOptions = {}
) => {
  return callLogActivity(eventType, 'subscription', options);
};

export const logSecurityEvent = (
  eventType: 'chat_password_set' | 'chat_password_failed' | 'onboarding_completed',
  options: LogOptions = {}
) => {
  return callLogActivity(eventType, 'security', options);
};

export const logProfileEvent = (
  eventType: 'profile_updated',
  options: LogOptions = {}
) => {
  return callLogActivity(eventType, 'security', options);
};
