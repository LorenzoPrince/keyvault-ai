async function request(path, options) {
  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new Error('No pudimos conectar con el servidor. Probá de nuevo en unos segundos.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? 'Ocurrió un error inesperado. Probá de nuevo.');
  }
  return data;
}

const postJson = (path, body) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const fetchProducts = () => request('/products');
export const createOrder = (order) => postJson('/orders', order);
export const sendChatMessage = (chat) => postJson('/chat', chat);
