const getAdminPassword = (): string => {
  return localStorage.getItem('cybersec_admin_session') 
    ? JSON.parse(localStorage.getItem('cybersec_admin_session')!).password || ''
    : '';
};

export const adminAction = async (action: string, data: any = {}) => {
  const session = localStorage.getItem('cybersec_admin_session');
  let adminPassword = '';
  
  if (session) {
    try {
      const parsed = JSON.parse(session);
      adminPassword = parsed.password || '';
    } catch {}
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-action`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ action, data, adminPassword }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Admin action failed');
  }

  return response.json();
};

export const setAdminPassword = (password: string) => {
  const session = localStorage.getItem('cybersec_admin_session');
  if (session) {
    const parsed = JSON.parse(session);
    parsed.password = password;
    localStorage.setItem('cybersec_admin_session', JSON.stringify(parsed));
  }
};
