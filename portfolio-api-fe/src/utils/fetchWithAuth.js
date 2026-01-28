// fetchWithAuth.js
// Helper per fetch autenticata con gestione automatica del logout su 401

export async function fetchWithAuth(url, options = {}, onLogout) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`,
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    throw new Error('Sessione scaduta, effettua di nuovo il login.');
  }
  return response;
}
