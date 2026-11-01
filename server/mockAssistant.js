// Asesor por reglas: responde cuando no hay OPENAI_API_KEY o cuando OpenAI falla.
import { findMentionedProduct, isViable, normalize } from './hardware.js';

const MAX_ALTERNATIVES = 3;

const RECOMMENDATIONS = [
  { pattern: /\b(rol|rpg)\b/, ids: ['baldurs-gate-3', 'cyberpunk-2077', 'elden-ring'], title: 'Para rol, estas son mis tres fijas' },
  { pattern: /\b(liviano|livianos|bajos requisitos|indie|notebook vieja|pc vieja)\b/, ids: ['stardew-valley', 'terraria', 'celeste'], title: 'Livianos y buenísimos' },
  { pattern: /\b(coop|cooperativo|amigos|multijugador)\b/, ids: ['helldivers-2', 'baldurs-gate-3', 'terraria'], title: 'Para jugar con amigos, andá a lo seguro' },
  { pattern: /\b(futbol|deportes?)\b/, ids: ['ea-sports-fc-25'], title: 'Para fútbol no hay discusión' },
  { pattern: /\b(accion|roguelike|rapido)\b/, ids: ['hades-2', 'hollow-knight', 'helldivers-2'], title: 'Si buscás acción pura' },
];

const formatPrice = (price) => `USD ${price.toFixed(2)}`;

const describeHardware = ({ cpu, gpu, ramGb }) =>
  [cpu, gpu, ramGb !== null ? `${ramGb} GB de RAM` : null].filter(Boolean).join(', ');

const problemLines = ({ checks }) =>
  checks.filter(({ status }) => status === 'fail').map(({ detail }) => `• ${detail}`);

const alternativeLines = (alternatives) =>
  alternatives
    .slice(0, MAX_ALTERNATIVES)
    .map(({ name, platform, price }) => `• ${name} (${platform}): ${formatPrice(price)}`);

const missingDataNote = ({ missing }) =>
  missing.length > 0 ? `\nPara confirmarlo, pasame ${missing.join(', ')}.` : '';

function replyForIncompatibleTarget(analysis) {
  const { target, alternatives } = analysis;
  const header =
    target.verdict === 'console'
      ? `⛔ Frená antes de comprar: nuestra key de ${target.name} es para Xbox, no para PC.`
      : `⛔ Frená antes de comprar: ${target.name} NO te va a correr en tu equipo.`;
  const lines = [header, ...(target.verdict === 'console' ? [] : problemLines(target))];

  if (alternatives.length > 0) {
    const confirmed = alternatives.every(({ verdict }) => verdict === 'compatible');
    lines.push(
      confirmed ? '✅ En cambio, estos sí te andan:' : '✅ Con lo que me contaste, estos deberían andarte:',
      ...alternativeLines(alternatives),
    );
    if (!confirmed) lines.push(missingDataNote(analysis).trim());
  } else {
    lines.push('Con ese hardware no tengo ningún juego del catálogo que pueda recomendarte sin riesgo.');
  }
  return lines.join('\n');
}

function replyForViableTarget(analysis) {
  const { target } = analysis;
  const header = {
    compatible: `✅ ¡Sí! ${target.name} te corre bien con ese equipo. Sale ${formatPrice(target.price)}.`,
    limit: `⚠️ ${target.name} te corre justo: estás en el límite del mínimo. Esperá calidad baja. Sale ${formatPrice(target.price)}.`,
    partial: target.checks.some(({ status }) => status === 'ok')
      ? `Vamos bien con ${target.name}: lo que me contaste cumple el mínimo, pero todavía no te lo puedo asegurar.`
      : `Todavía no te puedo asegurar que ${target.name} te corra: no reconozco ese hardware.`,
  };
  return `${header[target.verdict]}${missingDataNote(analysis)}`;
}

function replyForWholeCatalog(analysis) {
  const viable = analysis.results.filter(isViable);
  const blocked = analysis.results.filter(({ verdict }) => verdict === 'incompatible');
  const lines = [`Analicé tu equipo (${describeHardware(analysis.hardware)}):`];

  if (viable.length > 0 && viable.every(({ verdict }) => verdict === 'partial')) {
    lines.push('Con esos datos todavía no descarto ni confirmo ningún juego.');
  } else if (viable.length > 0) {
    lines.push(`✅ Te andan: ${viable.map(({ name }) => name).join(', ')}.`);
  } else {
    lines.push('⛔ Con ese hardware no llega a ningún juego de PC del catálogo.');
  }
  if (blocked.length > 0) {
    lines.push(`⛔ No te corren: ${blocked.map(({ name }) => name).join(', ')}.`);
  }
  return `${lines.join('\n')}${missingDataNote(analysis)}`;
}

export function buildCompatibilityReply(analysis) {
  const { target, alternatives } = analysis;
  const viableIds = alternatives.map(({ productId }) => productId);

  if (!target) return { reply: replyForWholeCatalog(analysis), suggestedProducts: viableIds };
  if (isViable(target)) {
    return {
      reply: replyForViableTarget(analysis),
      suggestedProducts: target.inStock ? [target.productId] : viableIds,
    };
  }
  return { reply: replyForIncompatibleTarget(analysis), suggestedProducts: viableIds };
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
      reply: `Requisitos de ${name} (${platform}): ${minSpecs}.\nHay ${stockKeys} keys a ${formatPrice(price)}. Decime tu procesador, placa y RAM y te confirmo si te corre.`,
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

export function getMockReply(message, products, analysis) {
  if (analysis) return buildCompatibilityReply(analysis);

  const text = normalize(message);
  const available = products.filter(({ stockKeys }) => stockKeys > 0);

  const product = findMentionedProduct(message, products);
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
      '¡Buenas, gamer! 🎮 Te ayudo a elegir: decime tu procesador, placa de video y RAM, qué plataforma usás (Steam, Epic o Xbox) o qué género te gusta, y te digo qué llevarte.',
    suggestedProducts: [],
  };
}
