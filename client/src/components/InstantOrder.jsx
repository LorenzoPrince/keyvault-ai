import { useState } from 'react';
import { CircleCheck, KeyRound, LoaderCircle } from 'lucide-react';
import { createOrder } from '../lib/api.js';
import { formatPrice } from '../lib/format.js';
import CopyButton from './CopyButton.jsx';

export default function InstantOrder({ item, channel, initialOrder = null, onCompleted }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [order, setOrder] = useState(initialOrder);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsPaying(true);
    try {
      const createdOrder = await createOrder({
        customerEmail: email.trim(),
        items: [{ productId: item.id, quantity: 1 }],
        channel,
      });
      setOrder(createdOrder);
      onCompleted(createdOrder);
    } catch (orderError) {
      setError(orderError.message);
    } finally {
      setIsPaying(false);
    }
  };

  if (order) {
    const [line] = order.items;
    return (
      <div className="animate-fade-up space-y-2 rounded-xl border border-success/40 bg-success/5 p-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
          <CircleCheck className="size-4" aria-hidden="true" />
          Pedido {order.orderId} confirmado
        </p>
        <div className="flex items-center justify-between gap-2 rounded-lg bg-ink-950 py-1.5 pr-1.5 pl-3">
          <code className="font-mono text-sm tracking-wide break-all text-accent-light">
            {line.keys[0]}
          </code>
          <CopyButton text={line.keys[0]} label="Copiar" />
        </div>
        <p className="text-xs leading-relaxed text-ink-300">{line.activationMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-primary/40 bg-ink-850 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold">{item.name}</p>
        <p className="font-display font-bold whitespace-nowrap text-white">{formatPrice(item.price)}</p>
      </div>
      <label className="block text-xs font-semibold text-ink-300">
        Email para recibir la key
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vos@ejemplo.com"
          className="mt-1 h-10 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 text-base font-normal text-ink-100 placeholder:text-ink-400 focus:border-primary-light sm:text-sm"
        />
      </label>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPaying}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light hover:text-ink-950 disabled:bg-ink-700 disabled:text-ink-300"
      >
        {isPaying ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <KeyRound className="size-4" aria-hidden="true" />
        )}
        {isPaying ? 'Emitiendo...' : 'Confirmar y Emitir Key'}
      </button>
      <p className="text-[11px] text-ink-400">Pago simulado: no se realiza ningún cobro real.</p>
    </form>
  );
}
