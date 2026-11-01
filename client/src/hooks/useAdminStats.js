import { useCallback, useEffect, useState } from 'react';
import { fetchAdminStats } from '../lib/api.js';

const REFRESH_INTERVAL_MS = 4000;
const TOKEN_STORAGE_KEY = 'keyvault-admin-token';

function readStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function storeToken(token) {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Sin almacenamiento disponible, el token dura lo que dure la pantalla.
  }
}

export function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [token, setToken] = useState(readStoredToken);

  const refresh = useCallback(
    () =>
      fetchAdminStats(token)
        .then((data) => {
          setStats(data);
          setStatus('ready');
          setUpdatedAt(new Date());
        })
        .catch((error) => setStatus(error.status === 401 ? 'locked' : 'error')),
    [token],
  );

  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      if (!document.hidden) refresh();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const unlock = (nextToken) => {
    storeToken(nextToken);
    setToken(nextToken);
  };

  return { stats, status, updatedAt, unlock, wasRejected: status === 'locked' && Boolean(token) };
}
