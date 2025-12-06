import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BankSettings } from '@/types/subscription.types';

export const useBankSettings = () => {
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBankSettings();
  }, []);

  const fetchBankSettings = async () => {
    const { data } = await supabase
      .from('bank_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    setBankSettings(data);
    setLoading(false);
  };

  return { bankSettings, loading, refetch: fetchBankSettings };
};
