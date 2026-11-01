// Registro en memoria de ventas y consultas: se reinicia con cada arranque del servidor.
const MAX_SESSIONS = 5000;
const MAX_SESSION_ID_LENGTH = 64;
const LOW_STOCK_THRESHOLD = 5;
const TOP_GAMES_LIMIT = 5;

const orders = [];
const sessions = new Map();
const demandByProduct = new Map();
let consultationCount = 0;
let preventedPurchases = 0;

const toCents = (amount) => Math.round(amount * 100);

function getSession(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId || sessionId.length > MAX_SESSION_ID_LENGTH) {
    return null;
  }
  if (!sessions.has(sessionId)) {
    if (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
    sessions.set(sessionId, { recommended: new Set(), warned: new Set() });
  }
  return sessions.get(sessionId);
}

// recommended: juegos que el asesor avaló; warned: juegos que desaconsejó por hardware.
export function recordConsultation({ sessionId, recommended = [], warned = [], consulted = [] }) {
  consultationCount += 1;
  preventedPurchases += warned.length;
  consulted.forEach((id) => demandByProduct.set(id, (demandByProduct.get(id) ?? 0) + 1));

  const session = getSession(sessionId);
  if (!session) return;
  recommended.forEach((id) => session.recommended.add(id));
  warned.forEach((id) => session.warned.add(id));
}

// La atribución se calcula en el servidor con lo que el asesor respondió en esa sesión.
export function recordOrder(order, sessionId) {
  const session = getSession(sessionId);
  const boughtIds = order.items.map(({ productId }) => productId);
  const aiAssisted = Boolean(session) && boughtIds.some((id) => session.recommended.has(id));
  const savedByAdvice =
    aiAssisted &&
    session.warned.size > 0 &&
    boughtIds.some((id) => session.recommended.has(id) && !session.warned.has(id));

  orders.push({ ...order, aiAssisted, savedByAdvice });
}

export function getSalesHistory() {
  return orders
    .flatMap(({ orderId, customerEmail, createdAt, aiAssisted, savedByAdvice, items }) =>
      items.flatMap(({ name, platform, unitPrice, keys }) =>
        keys.map((key) => ({
          orderId,
          customerEmail,
          game: name,
          platform,
          date: createdAt,
          price: unitPrice,
          key,
          aiAssisted,
          savedByAdvice,
        })),
      ),
    )
    .reverse();
}

function stockStatus(stockKeys) {
  if (stockKeys === 0) return 'out';
  return stockKeys <= LOW_STOCK_THRESHOLD ? 'low' : 'ok';
}

function topDemandedGames(products) {
  const unitsByProduct = new Map();
  const revenueByProduct = new Map();
  for (const { items } of orders) {
    for (const { productId, quantity, unitPrice } of items) {
      unitsByProduct.set(productId, (unitsByProduct.get(productId) ?? 0) + quantity);
      revenueByProduct.set(
        productId,
        (revenueByProduct.get(productId) ?? 0) + toCents(unitPrice) * quantity,
      );
    }
  }

  return products
    .map(({ id, name }) => ({
      productId: id,
      name,
      unitsSold: unitsByProduct.get(id) ?? 0,
      consultations: demandByProduct.get(id) ?? 0,
      revenue: (revenueByProduct.get(id) ?? 0) / 100,
    }))
    .filter(({ unitsSold, consultations }) => unitsSold + consultations > 0)
    .sort((a, b) => b.unitsSold - a.unitsSold || b.consultations - a.consultations)
    .slice(0, TOP_GAMES_LIMIT);
}

export function getStats(products) {
  const sumRevenue = (list) => list.reduce((sum, { total }) => sum + toCents(total), 0) / 100;
  const assisted = orders.filter(({ aiAssisted }) => aiAssisted);
  const saved = orders.filter(({ savedByAdvice }) => savedByAdvice);

  return {
    totalRevenue: sumRevenue(orders),
    totalOrders: orders.length,
    aiAssistedCount: assisted.length,
    aiAssistedRevenue: sumRevenue(assisted),
    savedSalesCount: saved.length,
    savedSalesRevenue: sumRevenue(saved),
    consultationsAutomated: consultationCount,
    preventedPurchases,
    ordersList: getSalesHistory(),
    topDemandedGames: topDemandedGames(products),
    inventory: products.map(({ id, name, platform, stockKeys }) => ({
      productId: id,
      name,
      platform,
      stockKeys,
      status: stockStatus(stockKeys),
    })),
  };
}
