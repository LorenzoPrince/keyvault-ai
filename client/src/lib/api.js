import { sessionId } from './session.js';

async function request(path, options) {
  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new Error('No pudimos conectar con el servidor. Probá de nuevo en unos segundos.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error ?? 'Ocurrió un error inesperado. Probá de nuevo.');
    error.status = response.status;
    throw error;
  }
  return data;
}

const postJson = (path, body) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, sessionId }),
  });

export const fetchProducts = () => request('/products');
export const fetchHardwareOptions = () => request('/hardware');
export const createOrder = (order) => postJson('/orders', order);
export const sendChatMessage = (chat) => postJson('/chat', chat);
export const checkCompatibility = (selection) => postJson('/compatibility', selection);
export const fetchAdminStats = (token) =>
  request('/admin/stats', { headers: token ? { 'x-admin-token': token } : {} });
