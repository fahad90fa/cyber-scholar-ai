export const callAdminFunction = async (functionName: string, method: string = 'GET', body?: unknown) => {
  const adminToken = localStorage.getItem('admin_token');
  if (!adminToken) {
    throw new Error('Admin token not found');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${functionName}: ${response.statusText}`);
  }

  return response.json();
};
