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
    // 403, o un 401 de Nginx (auth_basic responde HTML, no el JSON de la API): acceso restringido.
    error.isRestricted =
      response.status === 403 ||
      (response.status === 401 &&
        (/^basic/i.test(response.headers.get('www-authenticate') ?? '') || data === null));
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
export const parseInquiry = (text) => postJson('/ai/parse-inquiry', { text });
export const checkCompatibility = (selection) => postJson('/compatibility', selection);
export const fetchAdminStats = (token) =>
  request('/admin/stats', { headers: token ? { 'x-admin-token': token } : {} });
