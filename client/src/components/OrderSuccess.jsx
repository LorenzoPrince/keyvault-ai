import { CircleCheck } from 'lucide-react';
import { formatDate, formatPrice } from '../lib/format.js';
import CopyButton from './CopyButton.jsx';
import PlatformBadge from './PlatformBadge.jsx';

export default function OrderSuccess({ order, onClose }) {
  const allKeys = order.items
    .map(({ name, keys }) => `${name}: ${keys.join(', ')}`)
    .join('\n');

  return (
    <>
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="text-center">
          <CircleCheck className="mx-auto size-12 text-success" aria-hidden="true" />
          <h3 className="mt-3 font-display text-xl font-bold">¡Compra confirmada!</h3>
          <p className="mt-1 text-sm text-ink-300">
            Pedido <span className="font-mono font-semibold text-white">{order.orderId}</span>
          </p>
          <p className="mt-1 text-xs text-ink-400">
            {formatDate(order.createdAt)} · Total {formatPrice(order.total)}
          </p>
        </div>

        <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          Guardá tus keys antes de cerrar esta ventana.
        </p>

        {order.items.map((item) => (
          <section key={item.productId} className="rounded-xl border border-ink-700 bg-ink-850 p-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold">{item.name}</h4>
              <PlatformBadge platform={item.platform} />
            </div>

            <ul className="mt-3 space-y-2">
              {item.keys.map((key) => (
                <li
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-lg bg-ink-950 py-1.5 pr-1.5 pl-3"
                >
                  <code className="font-mono text-sm tracking-wide break-all text-accent-light">
                    {key}
                  </code>
                  <CopyButton text={key} label="Copiar" />
                </li>
              ))}
            </ul>

            <p className="mt-3 text-xs leading-relaxed text-ink-300">{item.activationMessage}</p>
          </section>
        ))}
      </div>

      <footer className="grid gap-2 border-t border-ink-700 p-4">
        <CopyButton text={allKeys} label="Copiar todas las keys" className="min-h-11 text-sm" />
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-lg bg-primary font-semibold text-white transition-colors hover:bg-primary-light hover:text-ink-950"
        >
          Seguir comprando
        </button>
      </footer>
    </>
  );
}
