import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CreditCard, LoaderCircle, Lock, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { createOrder } from '../lib/api.js';
import { formatPrice } from '../lib/format.js';
import OrderSuccess from './OrderSuccess.jsx';
import PlatformBadge from './PlatformBadge.jsx';
import ProductCover from './ProductCover.jsx';

const SIMULATED_PAYMENT_MS = 900;
const TITLES = { cart: 'Tu carrito', checkout: 'Finalizar compra', success: 'Tus keys' };

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function CartLine({ product, quantity, onSetQuantity, onRemove }) {
  const stepperButton =
    'grid size-9 place-items-center text-ink-300 transition-colors hover:text-white disabled:text-ink-700';

  return (
    <li className="flex gap-3 rounded-xl border border-ink-700 bg-ink-850 p-2.5">
      <ProductCover product={product} className="aspect-2/3 w-16 shrink-0 rounded-md" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="leading-tight font-semibold">{product.name}</p>
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            aria-label={`Quitar ${product.name} del carrito`}
            className="-m-1 p-1 text-ink-400 transition-colors hover:text-danger"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
        <PlatformBadge platform={product.platform} className="mt-1 self-start" />
        {quantity > product.stockKeys && (
          <p className="mt-1 text-xs text-danger">Solo quedan {product.stockKeys}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-lg border border-ink-700">
            <button
              type="button"
              onClick={() => onSetQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1}
              aria-label={`Quitar una unidad de ${product.name}`}
              className={stepperButton}
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={() => onSetQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stockKeys}
              aria-label={`Agregar una unidad de ${product.name}`}
              className={stepperButton}
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <span className="font-semibold">{formatPrice(product.price * quantity)}</span>
        </div>
      </div>
    </li>
  );
}

export default function CartDrawer({
  items,
  total,
  onClose,
  onSetQuantity,
  onRemove,
  onOrderCompleted,
  onOrderRejected,
}) {
  const dialogRef = useRef(null);
  const [view, setView] = useState('cart');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [order, setOrder] = useState(null);

  const hasStockIssue = items.some(({ product, quantity }) => quantity > product.stockKeys);
  const blocksDismiss = isPaying || view === 'success';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  const handlePay = async (event) => {
    event.preventDefault();
    setError('');
    setIsPaying(true);
    try {
      const [createdOrder] = await Promise.all([
        createOrder({
          customerEmail: email.trim(),
          items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        }),
        wait(SIMULATED_PAYMENT_MS),
      ]);
      setOrder(createdOrder);
      setView('success');
      onOrderCompleted();
    } catch (paymentError) {
      setError(paymentError.message);
      onOrderRejected();
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={TITLES[view]}
      onClose={onClose}
      onCancel={(event) => blocksDismiss && event.preventDefault()}
      onClick={(event) => event.target === dialogRef.current && !blocksDismiss && onClose()}
      className="my-0 mr-0 ml-auto h-dvh max-h-dvh w-full max-w-md animate-slide-in border-l border-ink-700 bg-ink-900 text-ink-100 backdrop:bg-ink-950/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center gap-2 border-b border-ink-700 p-4">
          {view === 'checkout' && (
            <button
              type="button"
              onClick={() => setView('cart')}
              disabled={isPaying}
              aria-label="Volver al carrito"
              className="grid size-9 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
          )}
          <h2 className="font-display text-lg font-bold">{TITLES[view]}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isPaying}
            aria-label="Cerrar"
            className="ml-auto grid size-9 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {view === 'cart' && items.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <ShoppingCart className="size-12 text-ink-700" aria-hidden="true" />
            <p className="mt-4 font-semibold">Tu carrito está vacío</p>
            <p className="mt-1 text-sm text-ink-400">Sumá un juego y activalo en minutos.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light hover:text-ink-950"
            >
              Ver catálogo
            </button>
          </div>
        )}

        {view === 'cart' && items.length > 0 && (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.map(({ product, quantity }) => (
                <CartLine
                  key={product.id}
                  product={product}
                  quantity={quantity}
                  onSetQuantity={onSetQuantity}
                  onRemove={onRemove}
                />
              ))}
            </ul>
            <footer className="border-t border-ink-700 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-ink-300">Total</span>
                <span className="font-display text-2xl font-bold">{formatPrice(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => setView('checkout')}
                disabled={hasStockIssue}
                className="mt-3 min-h-12 w-full rounded-lg bg-primary font-semibold text-white transition-colors hover:bg-primary-light hover:text-ink-950 disabled:bg-ink-700 disabled:text-ink-400"
              >
                Ir a pagar
              </button>
            </footer>
          </>
        )}

        {view === 'checkout' && (
          <form onSubmit={handlePay} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              <div>
                <label htmlFor="checkout-email" className="text-sm font-semibold">
                  Email para tu pedido
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="vos@ejemplo.com"
                  className="mt-1.5 h-11 w-full rounded-lg border border-ink-700 bg-ink-850 px-3 text-sm placeholder:text-ink-400 focus:border-primary-light"
                />
              </div>

              <div className="rounded-xl border border-ink-700 bg-ink-850 p-3">
                <h3 className="text-sm font-semibold">Resumen</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-300">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex justify-between gap-3">
                      <span>
                        {quantity} × {product.name}
                      </span>
                      <span className="whitespace-nowrap">
                        {formatPrice(product.price * quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="flex items-start gap-2 rounded-lg bg-ink-850 p-3 text-xs text-ink-300">
                <Lock className="mt-px size-3.5 shrink-0 text-accent-light" aria-hidden="true" />
                Pago simulado: no se realiza ningún cobro real.
              </p>

              {error && (
                <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
                  {error}
                </p>
              )}
            </div>

            <footer className="border-t border-ink-700 p-4">
              <button
                type="submit"
                disabled={isPaying || hasStockIssue}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-white transition-colors hover:bg-primary-light hover:text-ink-950 disabled:bg-ink-700 disabled:text-ink-300"
              >
                {isPaying ? (
                  <>
                    <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <CreditCard className="size-5" aria-hidden="true" />
                    Pagar {formatPrice(total)}
                  </>
                )}
              </button>
            </footer>
          </form>
        )}

        {view === 'success' && <OrderSuccess order={order} onClose={onClose} />}
      </div>
    </dialog>
  );
}
