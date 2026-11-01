import { KeyRound, ShoppingCart, Sparkles } from 'lucide-react';

export default function Header({ cartCount, onOpenCart }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-700/70 bg-ink-900/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <a href="#inicio" className="flex items-center gap-2.5 rounded-lg">
          <span className="grid size-9 place-items-center rounded-lg bg-linear-to-br from-primary to-accent">
            <KeyRound className="size-5 text-white" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight whitespace-nowrap">
            KeyVault <span className="text-accent-light">AI</span>
          </span>
        </a>

        <span className="hidden items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium whitespace-nowrap text-accent-light min-[360px]:inline-flex">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Asesor IA 24/7
        </span>

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
      </div>
    </header>
  );
}
