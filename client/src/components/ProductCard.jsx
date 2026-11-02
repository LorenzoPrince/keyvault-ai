import { useEffect, useState } from 'react';
import { Bot, Check, ChevronDown, Cpu, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../lib/format.js';
import CompatibilityBadge from './CompatibilityBadge.jsx';
import PlatformBadge from './PlatformBadge.jsx';
import ProductCover from './ProductCover.jsx';
import StockBadge from './StockBadge.jsx';

const TIERS = {
  low: { label: 'Req. bajos', tone: 'text-success', bars: 1 },
  medium: { label: 'Req. medios', tone: 'text-warning', bars: 2 },
  high: { label: 'Req. altos', tone: 'text-danger', bars: 3 },
  console: { label: 'Consola', tone: 'text-xbox', bars: 0 },
};

const CARD_GLOW = {
  compatible: 'ring-1 ring-success/40',
  limit: 'ring-1 ring-warning/40',
  incompatible: 'ring-1 ring-danger/30',
};

function TierMeter({ tier }) {
  const { label, tone, bars } = TIERS[tier] ?? TIERS.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${tone}`}>
      {bars > 0 && (
        <span className="flex items-end gap-px" aria-hidden="true">
          {[1, 2, 3].map((bar) => (
            <span
              key={bar}
              className={`w-1 rounded-sm ${bar <= bars ? 'bg-current' : 'bg-ink-700'}`}
              style={{ height: `${4 + bar * 3}px` }}
            />
          ))}
        </span>
      )}
      {label}
    </span>
  );
}

function SpecsTable({ product }) {
  const rows = [
    ['CPU', product.minCpu, product.recCpu],
    ['GPU', product.minGpu, product.recGpu],
    ['RAM', `${product.minRamGb} GB`, `${product.recRamGb} GB`],
  ];
  return (
    <dl className="mt-2 animate-fade-up space-y-2 rounded-lg border border-ink-700 bg-ink-950/60 p-2.5 text-[11px] leading-snug">
      {rows.map(([label, min, rec]) => (
        <div key={label}>
          <dt className="font-mono font-semibold tracking-wider text-accent-light">{label}</dt>
          <dd className="text-ink-300">
            <span className="text-ink-400">Mín:</span> {min}
          </dd>
          {rec && rec !== min && (
            <dd className="text-ink-300">
              <span className="text-ink-400">Rec:</span> {rec}
            </dd>
          )}
        </div>
      ))}
      <div className="text-ink-400">
        {product.os} · {product.storage}
      </div>
    </dl>
  );
}

export default function ProductCard({ product, verdict, quantityInCart, onAdd, onAsk, onCheck }) {
  const [showSpecs, setShowSpecs] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const remaining = product.stockKeys - quantityInCart;
  const isConsole = product.platform === 'Xbox';
  const addLabel =
    product.stockKeys === 0 ? 'Agotado' : remaining === 0 ? 'Todo en carrito' : 'Agregar al Carrito';

  useEffect(() => {
    if (!justAdded) return undefined;
    const timer = setTimeout(() => setJustAdded(false), 1200);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleAdd = () => {
    onAdd(product);
    setJustAdded(true);
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-ink-700/70 bg-ink-850 shadow-card transition duration-300 ease-out hover:-translate-y-1 hover:border-primary-light/60 hover:shadow-glow ${CARD_GLOW[verdict] ?? ''}`}
    >
      <div className="relative overflow-hidden">
        <ProductCover
          product={product}
          className={`aspect-2/3 w-full transition-transform duration-500 ease-out group-hover:scale-105 ${product.stockKeys === 0 ? 'grayscale' : ''}`}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink-950/90 via-transparent to-ink-950/40"
          aria-hidden="true"
        />
        <PlatformBadge
          platform={product.platform}
          className="absolute top-2 left-2 bg-ink-950/85! backdrop-blur-sm"
        />
        {verdict && (
          <CompatibilityBadge verdict={verdict} className="absolute top-2 right-2 animate-pop-in bg-ink-950/80!" />
        )}
        {!isConsole && (
          <button
            type="button"
            onClick={() => onCheck(product)}
            aria-label={`¿Corre ${product.name} en mi PC?`}
            className="absolute inset-x-2 bottom-2 inline-flex min-h-8 translate-y-0 items-center justify-center gap-1.5 rounded-lg bg-ink-950/85 px-2 py-1 text-xs font-semibold text-ink-100 ring-1 ring-white/15 backdrop-blur-sm transition-all hover:bg-primary hover:text-white sm:translate-y-1 sm:opacity-90 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          >
            <Cpu className="size-3.5 shrink-0" aria-hidden="true" />
            {verdict ? 'Ver análisis' : '¿Corre en mi PC?'}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-display leading-tight font-semibold text-balance">{product.name}</h3>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="text-xs text-ink-400">{product.genre}</p>
          <TierMeter tier={product.requirementTier} />
        </div>

        <button
          type="button"
          onClick={() => setShowSpecs((open) => !open)}
          aria-expanded={showSpecs}
          className="mt-2 inline-flex items-center gap-1 self-start text-[11px] font-semibold text-ink-300 transition-colors hover:text-accent-light"
        >
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${showSpecs ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
          {isConsole ? 'Detalles' : 'Requisitos'}
        </button>
        {showSpecs && <SpecsTable product={product} />}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-3">
          <span className="font-display text-lg font-bold whitespace-nowrap text-white">
            {formatPrice(product.price)}
          </span>
          <StockBadge stockKeys={product.stockKeys} />
        </div>

        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={remaining <= 0}
            className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-white transition-all active:scale-[0.97] disabled:bg-ink-700 disabled:text-ink-400 ${
              justAdded ? 'bg-success text-ink-950' : 'bg-primary hover:bg-primary-light hover:text-ink-950'
            }`}
          >
            {justAdded ? (
              <Check className="size-3.5 shrink-0 animate-pop-in" aria-hidden="true" />
            ) : (
              <ShoppingCart className="hidden size-3.5 shrink-0 min-[360px]:block" aria-hidden="true" />
            )}
            {justAdded ? '¡Agregado!' : addLabel}
          </button>
          <button
            type="button"
            onClick={() => onAsk(product)}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-accent/40 px-2 py-2 text-xs font-semibold text-accent-light transition-colors hover:bg-accent/10"
          >
            <Bot className="hidden size-3.5 shrink-0 min-[360px]:block" aria-hidden="true" />
            Consultar a la IA
          </button>
        </div>
      </div>
    </article>
  );
}
