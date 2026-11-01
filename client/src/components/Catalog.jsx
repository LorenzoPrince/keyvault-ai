import { useMemo, useState } from 'react';
import { PackageX, RotateCw, Search } from 'lucide-react';
import ProductCard from './ProductCard.jsx';

const PLATFORMS = ['Todas', 'Steam', 'Epic', 'Xbox'];
const ALL_GENRES = 'Todos los géneros';
const SKELETON_COUNT = 6;
const GRID_CLASSES = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6';

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

export default function Catalog({ products, status, onRetry, quantities, onAdd, onAsk }) {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [genre, setGenre] = useState(ALL_GENRES);

  const genres = useMemo(
    () => [ALL_GENRES, ...new Set(products.map((product) => product.genre))],
    [products],
  );

  const term = search.trim().toLowerCase();
  const visibleProducts = products.filter(
    (product) =>
      (platform === PLATFORMS[0] || product.platform === platform) &&
      (genre === ALL_GENRES || product.genre === genre) &&
      product.name.toLowerCase().includes(term),
  );

  const clearFilters = () => {
    setSearch('');
    setPlatform(PLATFORMS[0]);
    setGenre(ALL_GENRES);
  };

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Catálogo de juegos
      </h2>
      <p className="mt-1 text-ink-400">Keys digitales listas para activar.</p>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
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
            className="h-11 w-full rounded-lg border border-ink-700 bg-ink-850 pr-3 pl-9 text-sm placeholder:text-ink-400 focus:border-primary-light"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
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
                className={`h-9 rounded-md px-3 text-sm font-medium transition-colors ${
                  platform === option
                    ? 'bg-primary text-white'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <label className="sm:w-52">
            <span className="sr-only">Filtrar por género</span>
            <select
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              className="h-11 w-full rounded-lg border border-ink-700 bg-ink-850 px-3 text-sm focus:border-primary-light"
            >
              {genres.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

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
                quantityInCart={quantities[product.id] ?? 0}
                onAdd={onAdd}
                onAsk={onAsk}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
