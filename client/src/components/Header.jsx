import { Gamepad2, LayoutDashboard, ShoppingCart, Sparkles, Store, Zap } from 'lucide-react';
import { ADMIN_PATH, STORE_PATH } from '../hooks/useRoute.js';

const NAV_ITEMS = [
  { view: 'store', path: STORE_PATH, label: 'Tienda Gamer', icon: Store },
  { view: 'admin', path: ADMIN_PATH, label: 'Panel Dueño (Métricas)', icon: LayoutDashboard },
];

export default function Header({ view, onNavigate, cartCount, onOpenCart }) {
  const handleNavigate = (event, path) => {
    event.preventDefault();
    onNavigate(path);
  };

  return (
    <>
      <p className="bg-linear-to-r from-primary/30 to-accent/30 px-4 py-2 text-center text-xs text-ink-100 sm:text-sm">
        <Zap className="mr-1.5 inline size-3.5 align-[-2px] text-accent-light" aria-hidden="true" />
        <strong className="font-semibold">Atención automatizada 24/7 con IA:</strong> compras
        inmediatas sin demoras de WhatsApp
      </p>

      <header className="sticky top-0 z-30 border-b border-ink-700/70 bg-ink-900/85 shadow-card backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6 lg:h-16 lg:flex-nowrap lg:py-0">
          <a
            href={STORE_PATH}
            onClick={(event) => handleNavigate(event, STORE_PATH)}
            className="group flex items-center gap-2.5 rounded-lg"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-linear-to-br from-primary to-accent shadow-glow ring-1 ring-accent-light/40 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <Gamepad2 className="size-5 text-white drop-shadow-[0_0_6px_rgb(34_211_238/0.8)]" aria-hidden="true" />
            </span>
            <span className="flex flex-col whitespace-nowrap">
              <span className="font-display text-lg leading-tight font-bold tracking-tight">
                KeyVault
              </span>
              <span className="text-[11px] leading-tight text-ink-300">Tu tienda gamer local</span>
            </span>
          </a>

          <span className="hidden items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium whitespace-nowrap text-accent-light min-[380px]:inline-flex">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Asesor IA 24/7
          </span>

          <nav
            aria-label="Secciones"
            className="order-last grid w-full grid-cols-[auto_1fr] gap-1 rounded-lg border border-ink-700 bg-ink-850 p-1 lg:order-none lg:ml-4 lg:w-auto"
          >
            {NAV_ITEMS.map(({ view: itemView, path, label, icon: Icon }) => (
              <a
                key={itemView}
                href={path}
                aria-current={view === itemView ? 'page' : undefined}
                onClick={(event) => handleNavigate(event, path)}
                className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap transition-colors min-[400px]:px-3 min-[400px]:text-sm ${
                  view === itemView
                    ? 'bg-primary text-white'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                }`}
              >
                <Icon className="hidden size-4 shrink-0 min-[400px]:block" aria-hidden="true" />
                {label}
              </a>
            ))}
          </nav>

          {view === 'store' ? (
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Abrir carrito, ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`}
              className="relative ml-auto grid size-11 place-items-center rounded-lg border border-ink-700 bg-ink-800 transition-colors hover:border-primary-light hover:bg-ink-700"
            >
              <ShoppingCart className="size-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 animate-pop-in place-items-center rounded-full bg-accent px-1 text-xs font-bold text-ink-950"
                >
                  {cartCount}
                </span>
              )}
            </button>
          ) : (
            <span className="ml-auto size-11" aria-hidden="true" />
          )}
        </div>
      </header>
    </>
  );
}
