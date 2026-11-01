// Motor de compatibilidad determinístico: el veredicto nunca depende del modelo de lenguaje.
// Los puntajes son relativos (basados en benchmarks públicos, aproximados), no medidas exactas.

const LIMIT_MARGIN = 0.9;
const LAPTOP_CPU_FACTOR = 0.65;

export const RAM_OPTIONS = [2, 4, 6, 8, 12, 16, 32];

export const CPU_OPTIONS = [
  { id: 'atom', label: 'Intel Atom / Celeron de bajo consumo', score: 8, cores: 2 },
  { id: 'core2', label: 'Intel Core 2 Duo', score: 12, cores: 2 },
  { id: 'pentium', label: 'Intel Pentium / Celeron (2 núcleos)', score: 18, cores: 2 },
  { id: 'i3-old', label: 'Intel Core i3 (2.ª a 7.ª gen, 2 núcleos)', score: 34, cores: 2 },
  { id: 'i5-2', label: 'Intel Core i5 (2.ª a 3.ª gen)', score: 45, cores: 4 },
  { id: 'i5-4', label: 'Intel Core i5 (4.ª a 5.ª gen)', score: 56, cores: 4 },
  { id: 'fx', label: 'AMD FX 6000 / 8000', score: 60, cores: 6 },
  { id: 'pentium-gold', label: 'Intel Pentium Gold (reciente)', score: 60, cores: 2 },
  { id: 'i5-6', label: 'Intel Core i5 (6.ª a 7.ª gen)', score: 62, cores: 4 },
  { id: 'r3-1', label: 'AMD Ryzen 3 serie 1000 / 2000', score: 65, cores: 4 },
  { id: 'i7-2', label: 'Intel Core i7 (2.ª a 3.ª gen)', score: 66, cores: 4 },
  { id: 'i7-4', label: 'Intel Core i7 (4.ª a 5.ª gen)', score: 78, cores: 4 },
  { id: 'i7-6', label: 'Intel Core i7 (6.ª a 7.ª gen)', score: 85, cores: 4 },
  { id: 'i3-new', label: 'Intel Core i3 (8.ª gen o superior)', score: 88, cores: 4 },
  { id: 'i5-8', label: 'Intel Core i5 (8.ª a 9.ª gen)', score: 92, cores: 6 },
  { id: 'r5-1', label: 'AMD Ryzen 5 serie 1000 / 2000', score: 120, cores: 6 },
  { id: 'i5-10', label: 'Intel Core i5 (10.ª a 11.ª gen)', score: 122, cores: 6 },
  { id: 'r3-3', label: 'AMD Ryzen 3 serie 3000 o superior', score: 130, cores: 4 },
  { id: 'i7-8', label: 'Intel Core i7 / i9 (8.ª gen o superior)', score: 140, cores: 6 },
  { id: 'r5-3', label: 'AMD Ryzen 5 serie 3000 o superior', score: 178, cores: 6 },
  { id: 'i5-12', label: 'Intel Core i5 (12.ª gen o superior)', score: 195, cores: 6 },
  { id: 'r7', label: 'AMD Ryzen 7 / Ryzen 9', score: 230, cores: 8 },
];

export const GPU_OPTIONS = [
  { id: 'igpu-legacy', label: 'Integrada antigua (Intel HD 2000 a 4000)', score: 5, pattern: /\bintel hd\b|\bhd graphics\b|\bintegrad[ao]s?\b|\bonboard\b|sin placa|no tengo placa/ },
  { id: 'igpu-haswell', label: 'Intel HD 4400 / 4600 / 530', score: 8, pattern: /\bhd(?: graphics)? ?(?:4[4-9]\d{2}|5\d{2})\b/ },
  { id: 'igpu-uhd', label: 'Intel HD 630 / UHD 620 a 770', score: 13, pattern: /\bu?hd(?: graphics)? ?[67]\d{2}\b/ },
  { id: 'igpu-modern', label: 'AMD Vega integrada / Intel Iris Xe', score: 25, pattern: /\bvega\b|\biris\b/ },
  { id: 'gt-1030', label: 'GeForce GT 1030', score: 27, pattern: /\bgt[ -]?1030\b/ },
  { id: 'gtx-750ti', label: 'GeForce GTX 750 Ti', score: 39, pattern: /\bgtx[ -]?750[ -]?ti\b/ },
  { id: 'gtx-1050', label: 'GeForce GTX 1050', score: 50, pattern: /\bgtx[ -]?1050(?![ -]?ti)\b/ },
  { id: 'gtx-960', label: 'GeForce GTX 950 / 960', score: 60, pattern: /\bgtx[ -]?9[56]0\b/ },
  { id: 'gtx-1050ti', label: 'GeForce GTX 1050 Ti', score: 63, pattern: /\bgtx[ -]?1050[ -]?ti\b/ },
  { id: 'rx-570', label: 'Radeon RX 470 / 570', score: 70, pattern: /\brx[ -]?[45]70\b/ },
  { id: 'gtx-1650', label: 'GeForce GTX 1650', score: 78, pattern: /\bgtx[ -]?1650\b/ },
  { id: 'rx-480', label: 'Radeon RX 480', score: 80, pattern: /\brx[ -]?480\b/ },
  { id: 'rx-580', label: 'Radeon RX 580', score: 85, pattern: /\brx[ -]?580\b/ },
  { id: 'gtx-1060-3', label: 'GeForce GTX 1060 3 GB', score: 90, pattern: /\bgtx[ -]?1060[ -]?3 ?gb\b/ },
  { id: 'gtx-970', label: 'GeForce GTX 970 / 980', score: 96, pattern: /\bgtx[ -]?9[78]0\b/ },
  { id: 'gtx-1060', label: 'GeForce GTX 1060 6 GB', score: 100, pattern: /\bgtx[ -]?1060(?![ -]?3 ?gb)\b/ },
  { id: 'gtx-1660', label: 'GeForce GTX 1660', score: 115, pattern: /\bgtx[ -]?1660\b/ },
  { id: 'rtx-gen', label: 'GeForce RTX / GTX 1070 o superior', score: 135, pattern: /\brtx[ -]?\d{4}\b|\bgtx[ -]?10[78]0\b/ },
  { id: 'radeon-new', label: 'Radeon RX 5000 o superior', score: 135, pattern: /\brx[ -]?[5-9]\d{3}\b/ },
];

// Se evalúan de más específico a más general: "Intel HD 630" no debe caer en "Intel HD".
const GPU_MATCH_ORDER = [...GPU_OPTIONS].reverse();

const ALIASES = {
  'cyberpunk-2077': ['cyberpunk'],
  'elden-ring': ['elden'],
  'baldurs-gate-3': ['baldur', 'bg3'],
  'ea-sports-fc-25': ['fc 25', 'fc25', 'fifa'],
  'helldivers-2': ['helldivers'],
  'hades-2': ['hades'],
  'stardew-valley': ['stardew'],
  'hollow-knight': ['hollow'],
  terraria: ['terraria'],
  celeste: ['celeste'],
};

export const normalize = (text) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export const findCpu = (id) => CPU_OPTIONS.find((cpu) => cpu.id === id);
export const findGpu = (id) => GPU_OPTIONS.find((gpu) => gpu.id === id);

const bySteps = (generation, steps) => steps.find(([limit]) => generation <= limit)[1];

function intelPreset(tier, generation) {
  if (tier === '3') return bySteps(generation, [[7, 'i3-old'], [Infinity, 'i3-new']]);
  if (tier === '5') {
    return bySteps(generation, [[3, 'i5-2'], [5, 'i5-4'], [7, 'i5-6'], [9, 'i5-8'], [11, 'i5-10'], [Infinity, 'i5-12']]);
  }
  return bySteps(generation, [[3, 'i7-2'], [5, 'i7-4'], [7, 'i7-6'], [Infinity, 'i7-8']]);
}

function ryzenPreset(tier, generation) {
  if (tier === '3') return generation <= 2 ? 'r3-1' : 'r3-3';
  if (tier === '5') return generation <= 2 ? 'r5-1' : 'r5-3';
  return 'r7';
}

function parseCpu(text) {
  const intel = text.match(/\bi([3579])[ -]?(\d{4,5})([a-z]*)\b/);
  if (intel) {
    const [, tier, model, suffix] = intel;
    const generation = Number(model.length === 5 ? model.slice(0, 2) : model[0]);
    const preset = findCpu(intelPreset(tier, generation));
    const isLaptop = /^[uy]/.test(suffix);
    return {
      ...preset,
      score: isLaptop ? Math.round(preset.score * LAPTOP_CPU_FACTOR) : preset.score,
      label: `Intel Core i${tier}-${model}${suffix.toUpperCase()}`,
    };
  }

  const ryzen = text.match(/\bryzen\s*([3579])\s*(\d)\d{3}/);
  if (ryzen) {
    const [match, tier, generation] = ryzen;
    const preset = findCpu(ryzenPreset(tier, Number(generation)));
    return { ...preset, label: `AMD ${match.replace('ryzen', 'Ryzen')}` };
  }

  if (/pentium gold/.test(text)) return findCpu('pentium-gold');
  if (/core ?2 ?(duo|quad)/.test(text)) return findCpu('core2');
  if (/\batom\b/.test(text)) return findCpu('atom');
  if (/\bfx[ -]?[68]\d{3}\b/.test(text)) return findCpu('fx');
  if (/\b(pentium|celeron|athlon)\b|\b(2|dos) nucleos\b|doble nucleo|dual[ -]?core/.test(text)) {
    return findCpu('pentium');
  }

  const generic = text.match(/\b(i[3579]|ryzen\s*[3579]?)\b/);
  return generic ? { unknown: true, label: generic[0].toUpperCase() } : null;
}

function parseGpu(text) {
  const preset = GPU_MATCH_ORDER.find(({ pattern }) => pattern.test(text));
  if (preset) {
    // Las familias amplias muestran el modelo que escribió el cliente.
    const isFamily = preset.id === 'rtx-gen' || preset.id === 'radeon-new';
    return isFamily ? { ...preset, label: text.match(preset.pattern)[0].toUpperCase() } : preset;
  }
  const generic = text.match(/\b(gtx|rtx|rx|gt|geforce|radeon)[ -]?\w*/);
  return generic ? { unknown: true, label: generic[0].toUpperCase() } : null;
}

function parseRam(text) {
  const match =
    text.match(/(\d{1,3}(?:[.,]\d)?) ?(?:gb|gigas?)(?: de)? (?:de )?(?:ram|memoria)/) ??
    text.match(/(?:ram|memoria)(?: de)? (\d{1,3}(?:[.,]\d)?) ?(?:gb|gigas?)/);
  return match ? Number(match[1].replace(',', '.')) : null;
}

// Recorre los mensajes del más nuevo al más viejo: el dato más reciente de cada componente manda.
export function parseHardware(messages) {
  const hardware = { cpu: null, gpu: null, ramGb: null };
  for (const message of [...messages].reverse()) {
    const text = normalize(message);
    hardware.cpu ??= parseCpu(text);
    hardware.gpu ??= parseGpu(text);
    hardware.ramGb ??= parseRam(text);
  }
  return hardware.cpu || hardware.gpu || hardware.ramGb ? hardware : null;
}

export function findMentionedProduct(message, products) {
  const text = normalize(message);
  return products.find(({ id }) => ALIASES[id]?.some((alias) => text.includes(alias))) ?? null;
}

function compareScore(score, minimum) {
  if (score >= minimum) return 'ok';
  return score >= minimum * LIMIT_MARGIN ? 'limit' : 'fail';
}

function checkCpu(cpu, product) {
  if (!cpu || cpu.unknown) return { status: 'unknown', detail: 'Falta el modelo exacto del procesador' };
  if (cpu.cores < product.minCores) {
    return {
      status: 'fail',
      detail: `${cpu.label}: tiene ${cpu.cores} núcleos y este juego necesita ${product.minCores}`,
    };
  }
  const status = compareScore(cpu.score, product.minCpuScore);
  const details = {
    ok: `${cpu.label}: cumple el mínimo`,
    limit: `${cpu.label}: justo por debajo del mínimo (${product.minCpu})`,
    fail: `${cpu.label}: por debajo del mínimo (${product.minCpu})`,
  };
  return { status, detail: details[status] };
}

function checkGpu(gpu, product) {
  if (!gpu || gpu.unknown) return { status: 'unknown', detail: 'Falta el modelo exacto de la placa de video' };
  const status = compareScore(gpu.score, product.minGpuScore);
  const details = {
    ok: `${gpu.label}: cumple el mínimo`,
    limit: `${gpu.label}: justo por debajo del mínimo (${product.minGpu})`,
    fail: `${gpu.label}: por debajo del mínimo (${product.minGpu})`,
  };
  return { status, detail: details[status] };
}

function checkRam(ramGb, product) {
  if (ramGb === null) return { status: 'unknown', detail: 'Falta saber cuánta RAM tenés' };
  return ramGb >= product.minRam
    ? { status: 'ok', detail: `${ramGb} GB de RAM: cumple el mínimo` }
    : { status: 'fail', detail: `${ramGb} GB de RAM: este juego necesita ${product.minRam} GB` };
}

export function analyzeProduct(product, hardware) {
  const base = { productId: product.id, name: product.name, price: product.price, platform: product.platform };

  if (product.platform === 'Xbox') {
    return {
      ...base,
      verdict: 'console',
      checks: [{ status: 'fail', detail: `Es una key de consola ${product.os}: no se activa en PC` }],
    };
  }

  const checks = [
    { component: 'cpu', ...checkCpu(hardware.cpu, product) },
    { component: 'gpu', ...checkGpu(hardware.gpu, product) },
    { component: 'ram', ...checkRam(hardware.ramGb, product) },
  ];
  const statuses = checks.map(({ status }) => status);
  const verdict = statuses.includes('fail')
    ? 'incompatible'
    : statuses.includes('limit')
      ? 'limit'
      : statuses.includes('unknown')
        ? 'partial'
        : 'compatible';

  return { ...base, verdict, checks };
}

const VERDICT_PRIORITY = { compatible: 0, limit: 1, partial: 2 };

export const isViable = ({ verdict }) => verdict in VERDICT_PRIORITY;

export function analyzeCatalog(products, hardware, targetId = null) {
  const results = products.map((product) => ({
    ...analyzeProduct(product, hardware),
    inStock: product.stockKeys > 0,
    minGpuScore: product.minGpuScore,
  }));

  // Primero lo más seguro y, a igual veredicto, el juego más ambicioso que soporte el equipo.
  const alternatives = results
    .filter((result) => isViable(result) && result.inStock && result.productId !== targetId)
    .sort(
      (a, b) =>
        VERDICT_PRIORITY[a.verdict] - VERDICT_PRIORITY[b.verdict] || b.minGpuScore - a.minGpuScore,
    );

  return {
    hardware: {
      cpu: hardware.cpu?.label ?? null,
      gpu: hardware.gpu?.label ?? null,
      ramGb: hardware.ramGb,
    },
    missing: [
      (!hardware.cpu || hardware.cpu.unknown) && 'el modelo exacto del procesador',
      (!hardware.gpu || hardware.gpu.unknown) && 'el modelo exacto de la placa de video',
      hardware.ramGb === null && 'la cantidad de RAM',
    ].filter(Boolean),
    target: results.find(({ productId }) => productId === targetId) ?? null,
    results,
    alternatives,
  };
}
