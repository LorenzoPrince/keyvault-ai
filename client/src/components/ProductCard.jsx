import { Bot, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../lib/format.js';
import PlatformBadge from './PlatformBadge.jsx';
import ProductCover from './ProductCover.jsx';

const LOW_STOCK_THRESHOLD = 5;

function StockLabel({ stockKeys }) {
  if (stockKeys === 0) return <span className="text-danger">Agotado</span>;
  const isLow = stockKeys <= LOW_STOCK_THRESHOLD;
  return (
    <span className={`flex items-center gap-1.5 ${isLow ? 'text-warning' : 'text-success'}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {isLow ? `¡Quedan ${stockKeys}!` : `${stockKeys} keys`}
    </span>
  );
}

export default function ProductCard({ product, quantityInCart, onAdd, onAsk }) {
  const remaining = product.stockKeys - quantityInCart;
  const addLabel = product.stockKeys === 0 ? 'Agotado' : remaining === 0 ? 'Todo en carrito' : 'Agregar al Carrito';

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-ink-700/70 bg-ink-850 transition duration-200 hover:-translate-y-1 hover:border-primary-light/60 hover:shadow-glow">
      <div className="relative overflow-hidden">
        <ProductCover
          product={product}
          className={`aspect-2/3 w-full transition-transform duration-300 group-hover:scale-105 ${product.stockKeys === 0 ? 'grayscale' : ''}`}
        />
        <PlatformBadge
          platform={product.platform}
          className="absolute top-2 left-2 bg-ink-950/85! backdrop-blur-sm"
        />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-display leading-tight font-semibold text-balance">{product.name}</h3>
        <p className="mt-1 text-xs text-ink-400">{product.genre}</p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 pt-3">
          <span className="font-display text-lg font-bold whitespace-nowrap text-white">
            {formatPrice(product.price)}
          </span>
          <span className="pb-0.5 text-xs font-medium">
            <StockLabel stockKeys={product.stockKeys} />
          </span>
        </div>

        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={remaining <= 0}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-light hover:text-ink-950 disabled:bg-ink-700 disabled:text-ink-400"
          >
            <ShoppingCart className="hidden size-3.5 shrink-0 min-[360px]:block lg:hidden xl:block" aria-hidden="true" />
            {addLabel}
          </button>
          <button
            type="button"
            onClick={() => onAsk(product)}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-accent/40 px-2 py-2 text-xs font-semibold text-accent-light transition-colors hover:bg-accent/10"
          >
            <Bot className="hidden size-3.5 shrink-0 min-[360px]:block lg:hidden xl:block" aria-hidden="true" />
            Consultar a la IA
          </button>
        </div>
      </div>
    </article>
  );
}
