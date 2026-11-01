// Asesor por reglas: responde cuando no hay OPENAI_API_KEY o cuando OpenAI falla.

// GPUs de escritorio ordenadas de menor a mayor rendimiento aproximado.
const GPU_RANK = [
  'gtx 750 ti',
  'gtx 960',
  'gtx 1050',
  'gtx 1050 ti',
  'gtx 970',
  'gtx 1650',
  'gtx 1060',
  'gtx 1660',
  'gtx 1070',
  'gtx 1080',
];

const MIN_GPU = {
  'cyberpunk-2077': 'gtx 1060',
  'elden-ring': 'gtx 1060',
  'baldurs-gate-3': 'gtx 970',
  'ea-sports-fc-25': 'gtx 1050 ti',
  'hades-2': 'gtx 750 ti',
};

const ALIASES = {
  'cyberpunk-2077': ['cyberpunk'],
  'elden-ring': ['elden'],
  'baldurs-gate-3': ['baldur', 'bg3'],
  'ea-sports-fc-25': ['fc 25', 'fc25', 'fifa'],
  'helldivers-2': ['helldivers'],
  'hades-2': ['hades'],
};

const RECOMMENDATIONS = [
  { pattern: /\b(rol|rpg)\b/, ids: ['baldurs-gate-3', 'cyberpunk-2077', 'elden-ring'], title: 'Para rol, estas son mis tres fijas' },
  { pattern: /\b(coop|cooperativo|amigos|multijugador)\b/, ids: ['helldivers-2', 'baldurs-gate-3'], title: 'Para jugar con amigos, andá a lo seguro' },
  { pattern: /\b(futbol|deportes?)\b/, ids: ['ea-sports-fc-25'], title: 'Para fútbol no hay discusión' },
  { pattern: /\b(accion|roguelike|rapido)\b/, ids: ['hades-2', 'helldivers-2'], title: 'Si buscás acción pura' },
];

const normalize = (text) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const formatPrice = (price) => `USD ${price.toFixed(2)}`;

function findGpu(text) {
  const match = text.match(/\b(gtx|rtx)[\s-]*(\d{3,4})(?:\s*(ti))?\b/);
  if (!match) return null;
  const [, family, model, suffix] = match;
  return { family, model, name: `${family} ${model}${suffix ? ' ti' : ''}`.toUpperCase(), suffix };
}

function gpuRank({ family, model, suffix }) {
  if (family === 'rtx') return Infinity;
  const exact = GPU_RANK.indexOf(`gtx ${model}${suffix ? ' ti' : ''}`);
  return exact !== -1 ? exact : GPU_RANK.indexOf(`gtx ${model}`);
}

function replyForGpu(gpu, products) {
  const rank = gpuRank(gpu);
  const pcGames = products.filter(({ id }) => MIN_GPU[id]);

  if (rank === -1) {
    const specs = pcGames.map(({ name, minSpecs }) => `• ${name}: ${minSpecs}`).join('\n');
    return {
      reply: `No tengo la ${gpu.name} en mi tabla, así que comparala con estos mínimos:\n${specs}`,
      suggestedProducts: [],
    };
  }

  const runs = pcGames.filter(({ id }) => rank >= GPU_RANK.indexOf(MIN_GPU[id]));
  const below = pcGames.filter((product) => !runs.includes(product));
  const lines = [`Con tu ${gpu.name}, calculando solo la placa de video:`];

  if (runs.length > 0) {
    lines.push(`✅ Cumplís el mínimo: ${runs.map(({ name }) => name).join(', ')}.`);
  }
  if (below.length > 0) {
    lines.push(`⚠️ Por debajo del mínimo: ${below.map(({ name }) => name).join(', ')}.`);
  }
  lines.push('Helldivers 2 lo tenemos en key de Xbox, así que no depende de tu PC.');
  lines.push('Fijate también RAM y disco en cada ficha. ¿Cuál te llevás?');

  return {
    reply: lines.join('\n'),
    suggestedProducts: runs.filter(({ stockKeys }) => stockKeys > 0).map(({ id }) => id),
  };
}

function replyForProduct(product, text) {
  const { id, name, platform, genre, price, stockKeys, minSpecs, description } = product;

  if (stockKeys === 0) {
    return {
      reply: `${name} se quedó sin keys por ahora 😢. Mirá el catálogo, que hay otros títulos listos para activar.`,
      suggestedProducts: [],
    };
  }
  if (/\b(requisitos?|specs?|corre|correr|pc|compatible)\b/.test(text)) {
    return {
      reply: `Requisitos de ${name} (${platform}): ${minSpecs}.\nHay ${stockKeys} keys a ${formatPrice(price)}. ¿Lo sumás al carrito?`,
      suggestedProducts: [id],
    };
  }
  if (/\b(comprar?|compro|quiero|agrega|agregar|llevo|sumar?)\b/.test(text)) {
    return {
      reply: `¡Excelente elección! 🔥 ${name} para ${platform} a ${formatPrice(price)}. Agregalo al carrito acá abajo y recibís la key al instante.`,
      suggestedProducts: [id],
    };
  }
  return {
    reply: `${name} · ${genre} en ${platform}.\n${description}\nSale ${formatPrice(price)} y quedan ${stockKeys} keys. ¿Lo agregás al carrito?`,
    suggestedProducts: [id],
  };
}

function listProducts(items, title) {
  const lines = items.map(
    ({ name, platform, price }) => `• ${name} (${platform}): ${formatPrice(price)}`,
  );
  return {
    reply: `${title}:\n${lines.join('\n')}\nAgregá el tuyo al carrito y lo activás en minutos.`,
    suggestedProducts: items.map(({ id }) => id),
  };
}

export function getMockReply(message, products) {
  const text = normalize(message);
  const available = products.filter(({ stockKeys }) => stockKeys > 0);

  const gpu = findGpu(text);
  if (gpu) return replyForGpu(gpu, products);

  const product = products.find(({ id }) => ALIASES[id].some((alias) => text.includes(alias)));
  if (product) return replyForProduct(product, text);

  const platform = ['Steam', 'Epic', 'Xbox'].find((name) => text.includes(name.toLowerCase()));
  if (platform) {
    const items = available.filter((item) => item.platform === platform);
    if (items.length === 0) {
      return {
        reply: `Ahora no quedan keys para ${platform}, pero hay stock en otras plataformas.`,
        suggestedProducts: [],
      };
    }
    return listProducts(items, `¡Sí! Tenemos estas keys para ${platform}`);
  }

  for (const { pattern, ids, title } of RECOMMENDATIONS) {
    if (pattern.test(text)) {
      const items = available.filter(({ id }) => ids.includes(id));
      if (items.length > 0) return listProducts(items, title);
    }
  }

  return {
    reply:
      '¡Buenas, gamer! 🎮 Te ayudo a elegir: decime qué placa de video tenés, qué plataforma usás (Steam, Epic o Xbox) o qué género te gusta, y te digo qué llevarte.',
    suggestedProducts: [],
  };
}
