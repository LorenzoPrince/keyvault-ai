import { useState } from 'react';
import { Bot, Gamepad2, MessageCircle, Search, SendHorizontal, ShieldCheck, Zap } from 'lucide-react';
import ProductCover from './ProductCover.jsx';

const HIGHLIGHTS = [
  { icon: Zap, text: 'Entrega instantánea' },
  { icon: Bot, text: 'Asesor IA 24/7' },
  { icon: ShieldCheck, text: 'Steam, Epic y Xbox' },
];

const QUICK_QUERIES = [
  'Tengo una notebook con Intel HD',
  '¿Qué corre con una GTX 1650?',
  'Busco un RPG para mi PC gamer',
  'Quiero un juego liviano',
];

const COVER_LAYOUT = [
  'left-0 top-10 w-44 -rotate-6',
  'right-0 top-16 w-44 rotate-6',
  'left-1/2 top-0 z-10 w-52 -translate-x-1/2',
];

export default function Hero({ products, onAsk, onOpenRescue }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    onAsk(query);
    setQuery('');
  };

  return (
    <section id="inicio" className="relative isolate overflow-hidden border-b border-ink-700/70">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_15%_0%,rgb(99_102_241/0.28),transparent),radial-gradient(50rem_30rem_at_90%_100%,rgb(6_182_212/0.18),transparent)]"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <h1 className="font-display text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl xl:text-6xl">
            Comprá tus juegos y claves digitales{' '}
            <span className="bg-linear-to-r from-primary-light to-accent-light bg-clip-text text-transparent">
              al instante
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-300">
            Asesoramiento gamer con IA sin esperas.
          </p>

          <form onSubmit={handleSubmit} className="relative mt-7 max-w-xl">
            <label>
              <span className="sr-only">¿Qué buscás o qué PC tenés?</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-400"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                maxLength={1000}
                placeholder="¿Qué buscás o qué PC tenés?"
                className="h-14 w-full rounded-xl border border-ink-700 bg-ink-850/90 pr-14 pl-12 text-base shadow-card max-[359px]:text-sm transition-colors placeholder:text-ink-400 focus:border-primary-light"
              />
            </label>
            <button
              type="submit"
              aria-label="Consultar al asesor"
              className="absolute top-2 right-2 grid size-10 place-items-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-light hover:text-ink-950"
            >
              <SendHorizontal className="size-5" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-3 flex max-w-xl flex-wrap gap-2">
            {QUICK_QUERIES.map((quickQuery) => (
              <button
                key={quickQuery}
                type="button"
                onClick={() => onAsk(quickQuery)}
                className="min-h-8 rounded-full border border-ink-700 bg-ink-850/70 px-3 text-xs font-medium text-ink-300 transition-colors hover:border-accent hover:text-accent-light"
              >
                {quickQuery}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#catalogo"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-glow transition-colors hover:bg-primary-light hover:text-ink-950"
            >
              <Gamepad2 className="size-5" aria-hidden="true" />
              Ver catálogo
            </a>
            <button
              type="button"
              onClick={onOpenRescue}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-xbox/40 bg-xbox/10 px-6 py-3 font-semibold transition-colors hover:border-xbox hover:text-xbox"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              Demo: Rescatar mensaje de WhatsApp
            </button>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-300">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon className="size-4 text-accent-light" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden h-80 lg:block" aria-hidden="true">
          {products.slice(0, COVER_LAYOUT.length).map((product, index) => (
            <div
              key={product.id}
              className={`absolute overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50 ${COVER_LAYOUT[index]}`}
            >
              <ProductCover product={product} className="aspect-2/3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
