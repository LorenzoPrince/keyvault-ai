import { Cpu } from 'lucide-react';

export default function CompatibilityBanner({ onOpen }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-linear-to-r from-primary/15 via-ink-850 to-accent/15 p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary-light">
          <Cpu className="size-6" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold">¿Corre en mi PC?</h2>
          <p className="mt-0.5 text-sm text-ink-300">
            Elegí tu procesador y tu placa: te decimos al instante qué juegos son aptos, antes de pagar.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="min-h-11 rounded-lg bg-primary px-5 font-semibold whitespace-nowrap text-white transition-colors hover:bg-primary-light hover:text-ink-950"
        >
          Analizar mi PC
        </button>
      </div>
    </section>
  );
}
