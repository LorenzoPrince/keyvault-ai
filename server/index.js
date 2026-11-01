import 'dotenv/config';
import { randomBytes, randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';

const PORT = process.env.PORT || 3001;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KEY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const coverUrl = (title) =>
  `https://placehold.co/600x800/0b0f1a/22d3ee?text=${encodeURIComponent(title)}`;

// Catálogo en memoria: el stock se reinicia con cada arranque del servidor.
const products = [
  {
    id: 'cyberpunk-2077',
    name: 'Cyberpunk 2077',
    platform: 'Steam',
    genre: 'RPG de acción',
    price: 29.99,
    stockKeys: 25,
    minSpecs: 'Intel Core i7-6700 / Ryzen 5 1600, 12 GB RAM, GTX 1060 6 GB, 70 GB SSD',
    description: 'RPG de mundo abierto en Night City, una megalópolis obsesionada con el poder y las modificaciones corporales.',
    coverImage: coverUrl('Cyberpunk 2077'),
  },
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    platform: 'Steam',
    genre: 'Soulslike',
    price: 39.99,
    stockKeys: 18,
    minSpecs: 'Intel Core i5-8400 / Ryzen 3 3300X, 12 GB RAM, GTX 1060 3 GB, 60 GB',
    description: 'Aventura de fantasía oscura en las Tierras Intermedias, con exploración abierta y combate exigente.',
    coverImage: coverUrl('Elden Ring'),
  },
  {
    id: 'baldurs-gate-3',
    name: "Baldur's Gate 3",
    platform: 'Steam',
    genre: 'RPG por turnos',
    price: 49.99,
    stockKeys: 12,
    minSpecs: 'Intel Core i5-4690 / AMD FX 8350, 8 GB RAM, GTX 970 / RX 480, 150 GB SSD',
    description: 'RPG basado en Dungeons & Dragons, con decisiones que moldean la historia y cooperativo para hasta cuatro jugadores.',
    coverImage: coverUrl("Baldur's Gate 3"),
  },
  {
    id: 'ea-sports-fc-25',
    name: 'EA Sports FC 25',
    platform: 'Epic',
    genre: 'Deportes',
    price: 34.99,
    stockKeys: 30,
    minSpecs: 'Intel Core i5-6600K / Ryzen 5 1600, 8 GB RAM, GTX 1050 Ti / RX 570, 100 GB',
    description: 'Fútbol con licencias oficiales de clubes y ligas, y los modos Ultimate Team, Carrera y Rush.',
    coverImage: coverUrl('EA Sports FC 25'),
  },
  {
    id: 'helldivers-2',
    name: 'Helldivers 2',
    platform: 'Xbox',
    genre: 'Shooter cooperativo',
    price: 39.99,
    stockKeys: 20,
    minSpecs: 'Consola Xbox Series X|S, 100 GB de almacenamiento',
    description: 'Shooter cooperativo en tercera persona para hasta cuatro jugadores en defensa de la Supertierra.',
    coverImage: coverUrl('Helldivers 2'),
  },
  {
    id: 'hades-2',
    name: 'Hades II',
    platform: 'Epic',
    genre: 'Roguelike',
    price: 24.99,
    stockKeys: 15,
    minSpecs: 'CPU de doble núcleo a 2.4 GHz, 8 GB RAM, GPU con 2 GB VRAM, 10 GB',
    description: 'Roguelike de acción en el que encarnas a Melinoë y combates contra el Titán del Tiempo en el inframundo.',
    coverImage: coverUrl('Hades II'),
  },
];

function generateActivationKey() {
  const groups = Array.from({ length: 4 }, () =>
    Array.from(randomBytes(4), (byte) => KEY_ALPHABET[byte % KEY_ALPHABET.length]).join(''),
  );
  return groups.join('-');
}

// Suma las líneas repetidas de un mismo producto para validar el stock total pedido.
function parseOrderItems(items) {
  const quantities = new Map();
  for (const item of items) {
    const quantity = item?.quantity ?? 1;
    if (typeof item?.productId !== 'string' || !Number.isInteger(quantity) || quantity < 1) {
      return null;
    }
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + quantity);
  }
  return quantities;
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'keyvault-api' });
});

app.get('/api/products', (_req, res) => {
  res.json(products);
});

app.post('/api/orders', (req, res) => {
  const { items, customerEmail } = req.body ?? {};

  if (typeof customerEmail !== 'string' || !EMAIL_PATTERN.test(customerEmail)) {
    return res.status(400).json({ error: 'customerEmail inválido' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items debe ser un arreglo con al menos un producto' });
  }

  const quantities = parseOrderItems(items);
  if (!quantities) {
    return res.status(400).json({
      error: 'Cada item requiere productId (string) y quantity (entero mayor que 0)',
    });
  }

  // Valida todas las líneas antes de tocar el stock para no dejar órdenes a medias.
  const lines = [];
  for (const [productId, quantity] of quantities) {
    const product = products.find(({ id }) => id === productId);
    if (!product) {
      return res.status(404).json({ error: `Producto no encontrado: ${productId}` });
    }
    if (product.stockKeys < quantity) {
      return res.status(409).json({
        error: `Stock insuficiente para ${product.name}`,
        productId,
        available: product.stockKeys,
      });
    }
    lines.push({ product, quantity });
  }

  const orderItems = lines.map(({ product, quantity }) => {
    product.stockKeys -= quantity;
    return {
      productId: product.id,
      name: product.name,
      platform: product.platform,
      quantity,
      unitPrice: product.price,
      keys: Array.from({ length: quantity }, generateActivationKey),
    };
  });

  const totalCents = orderItems.reduce(
    (sum, { quantity, unitPrice }) => sum + Math.round(unitPrice * 100) * quantity,
    0,
  );

  res.status(201).json({
    orderId: `KV-${randomUUID()}`,
    customerEmail,
    items: orderItems,
    total: totalCents / 100,
    createdAt: new Date().toISOString(),
  });
});

// Mantiene las respuestas de error en JSON (por ejemplo, ante un cuerpo mal formado).
app.use((err, _req, res, _next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Error interno del servidor' : err.message });
});

app.listen(PORT, () => {
  console.log(`keyvault-api escuchando en http://localhost:${PORT}`);
});
