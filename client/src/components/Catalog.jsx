import { useState } from 'react';
import { Cpu, PackageX, RotateCw, Search, ShieldCheck, X } from 'lucide-react';
import CompatibilityBadge from './CompatibilityBadge.jsx';
import ProductCard from './ProductCard.jsx';

const ALL_CATEGORIES = 'Todos';
const CATEGORIES = [ALL_CATEGORIES, 'Grandes Éxitos', 'Bajos Requisitos / Indie', 'Acción/RPG'];
const ALL_PLATFORMS = 'Todas';
const PLATFORMS = [ALL_PLATFORMS, 'Steam', 'Epic', 'Xbox'];
const SKELETON_COUNT = 10;
const GRID_CLASSES = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5';

function CatalogMessage({ icon: Icon, title, action, onAction }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-ink-700 px-6 py-14 text-center">
      <Icon className="size-9 text-ink-400" aria-hidden="true" />
      <p className="mt-3 text-ink-300">{title}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-4 rounded-lg border border-ink-700 px-4 py-2 text-sm font-semibold transition-colors hover:border-accent hover:text-accent-light"
      >
        {action}
      </button>
    </div>
  );
}

const RUNS_ON_PC = new Set(['compatible', 'limit']);

function CompatibilitySummary({ verdicts, onlyCompatible, onToggle, onClear }) {
  const counts = Object.values(verdicts).reduce((acc, verdict) => {
    acc[verdict] = (acc[verdict] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mt-5 flex animate-fade-up flex-col gap-3 rounded-xl border border-ink-700 bg-ink-850/80 p-3 sm:flex-row sm:items-center">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Cpu className="size-4 text-accent-light" aria-hidden="true" />
        Tu PC analizada
      </p>
      <div className="flex flex-wrap gap-1.5">
        {['compatible', 'limit', 'incompatible'].map(
          (verdict) =>
            counts[verdict] > 0 && (
              <span key={verdict} className="inline-flex items-center gap-1">
                <CompatibilityBadge verdict={verdict} />
                <span className="text-xs text-ink-400 tabular-nums">×{counts[verdict]}</span>
              </span>
            ),
        )}
      </div>
      <div className="flex gap-2 sm:ml-auto">
        <button
          type="button"
          aria-pressed={onlyCompatible}
          onClick={onToggle}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
            onlyCompatible
              ? 'border-success bg-success/15 text-success'
              : 'border-ink-700 text-ink-300 hover:border-success hover:text-white'
          }`}
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          Solo compatibles
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Quitar análisis de compatibilidad"
          className="grid size-9 place-items-center rounded-lg border border-ink-700 text-ink-400 transition-colors hover:border-danger hover:text-danger"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function Catalog({
  products,
  status,
  onRetry,
  quantities,
  verdicts = {},
  onClearVerdicts,
  onAdd,
  onAsk,
  onCheck,
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [platform, setPlatform] = useState(ALL_PLATFORMS);
  const [onlyCompatible, setOnlyCompatible] = useState(false);
  const hasVerdicts = Object.keys(verdicts).length > 0;
  const filterByVerdict = hasVerdicts && onlyCompatible;

  const term = search.trim().toLowerCase();
  const visibleProducts = products.filter(
    (product) =>
      (category === ALL_CATEGORIES || product.categories.includes(category)) &&
      (platform === ALL_PLATFORMS || product.platform === platform) &&
      (!filterByVerdict || RUNS_ON_PC.has(verdicts[product.id])) &&
      product.name.toLowerCase().includes(term),
  );

  const clearFilters = () => {
    setSearch('');
    setCategory(ALL_CATEGORIES);
    setPlatform(ALL_PLATFORMS);
    setOnlyCompatible(false);
  };

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Catálogo de juegos
          </h2>
          <p className="mt-1 text-ink-400">
            {products.length > 0 ? `${products.length} títulos` : 'Keys digitales'} listos para activar en
            Steam, Epic y Xbox.
          </p>
        </div>
        <label className="relative lg:w-80">
          <span className="sr-only">Buscar juego</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar juego..."
            className="h-11 w-full rounded-lg border border-ink-700 bg-ink-850 pr-3 pl-9 text-sm transition-colors placeholder:text-ink-400 focus:border-primary-light"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
          {CATEGORIES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={category === option}
              onClick={() => setCategory(option)}
              className={`min-h-9 rounded-full border px-4 text-sm font-medium transition-all duration-200 ${
                category === option
                  ? 'border-primary bg-primary text-white shadow-glow'
                  : 'border-ink-700 bg-ink-850 text-ink-300 hover:border-primary-light hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div
          role="group"
          aria-label="Filtrar por plataforma"
          className="grid grid-cols-4 gap-1 rounded-lg border border-ink-700 bg-ink-850 p-1"
        >
          {PLATFORMS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={platform === option}
              onClick={() => setPlatform(option)}
              className={`h-8 rounded-md px-3 text-sm font-medium transition-colors ${
                platform === option
                  ? 'bg-ink-700 text-white'
                  : 'text-ink-400 hover:bg-ink-800 hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {hasVerdicts && (
        <CompatibilitySummary
          verdicts={verdicts}
          onlyCompatible={onlyCompatible}
          onToggle={() => setOnlyCompatible((current) => !current)}
          onClear={() => {
            setOnlyCompatible(false);
            onClearVerdicts();
          }}
        />
      )}

      <div className="mt-6">
        {status === 'error' && (
          <CatalogMessage
            icon={RotateCw}
            title="No pudimos cargar el catálogo."
            action="Reintentar"
            onAction={onRetry}
          />
        )}

        {status === 'loading' && (
          <div className={GRID_CLASSES} aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div key={index} className="aspect-2/4 animate-pulse rounded-xl bg-ink-850" />
            ))}
          </div>
        )}

        {status === 'ready' && visibleProducts.length === 0 && (
          <CatalogMessage
            icon={PackageX}
            title="Ningún juego coincide con esos filtros."
            action="Limpiar filtros"
            onAction={clearFilters}
          />
        )}

        {status === 'ready' && visibleProducts.length > 0 && (
          <div className={GRID_CLASSES}>
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                verdict={verdicts[product.id]}
                quantityInCart={quantities[product.id] ?? 0}
                onAdd={onAdd}
                onAsk={onAsk}
                onCheck={onCheck}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
