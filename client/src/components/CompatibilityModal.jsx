import { useEffect, useRef, useState } from 'react';
import { Bot, CircleCheck, CircleHelp, CircleX, Cpu, LoaderCircle, Plus, TriangleAlert, X } from 'lucide-react';
import { checkCompatibility, fetchHardwareOptions } from '../lib/api.js';
import { formatPrice } from '../lib/format.js';
import TrafficLight from './TrafficLight.jsx';

const ALL_GAMES = '';

const CHECK_ICONS = {
  ok: { icon: CircleCheck, tone: 'text-success' },
  limit: { icon: TriangleAlert, tone: 'text-warning' },
  fail: { icon: CircleX, tone: 'text-danger' },
  unknown: { icon: CircleHelp, tone: 'text-ink-400' },
};

const SELECT_CLASSES =
  'mt-1 h-11 w-full rounded-lg border border-ink-700 bg-ink-850 px-3 text-sm focus:border-primary-light';

function Field({ label, children }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

function Result({ result, products, onAddToCart }) {
  const suggested = result.suggestedProducts
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);

  return (
    <div className="animate-fade-up space-y-4 rounded-xl border border-ink-700 bg-ink-950/60 p-4">
      {result.target ? (
        <>
          <div>
            <p className="text-xs text-ink-400">{result.target.name}</p>
            <div className="mt-1">
              <TrafficLight verdict={result.target.verdict} size="lg" />
            </div>
          </div>
          <ul className="space-y-1.5 text-sm text-ink-300">
            {result.target.checks.map(({ status, detail }) => {
              const { icon: Icon, tone } = CHECK_ICONS[status];
              return (
                <li key={detail} className="flex gap-2">
                  <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} aria-hidden="true" />
                  {detail}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <ul className="space-y-2">
          {result.results.map(({ productId, name, verdict }) => (
            <li key={productId} className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate">{name}</span>
              <TrafficLight verdict={verdict} />
            </li>
          ))}
        </ul>
      )}

      {suggested.length > 0 && (
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-300">
            <Bot className="size-3.5 text-accent-light" aria-hidden="true" />
            {result.target?.verdict === 'compatible' || result.target?.verdict === 'limit'
              ? 'Listo para llevar'
              : 'El asesor te recomienda'}
          </p>
          <div className="mt-2 grid gap-1.5">
            {suggested.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onAddToCart(product)}
                className="flex min-h-10 items-center justify-between gap-2 rounded-lg border border-accent/40 bg-accent/5 px-3 py-1.5 text-left text-sm font-semibold text-accent-light transition-colors hover:bg-accent/15"
              >
                <span className="flex items-center gap-1.5">
                  <Plus className="size-4 shrink-0" aria-hidden="true" />
                  {product.name}
                </span>
                <span className="whitespace-nowrap">{formatPrice(product.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompatibilityModal({
  initialProductId,
  products,
  selection,
  onSelectionChange,
  onClose,
  onAddToCart,
  onResult,
}) {
  const dialogRef = useRef(null);
  const resultRef = useRef(null);
  const [options, setOptions] = useState(null);
  const [productId, setProductId] = useState(initialProductId ?? ALL_GAMES);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    fetchHardwareOptions()
      .then(setOptions)
      .catch((loadError) => setError(loadError.message));
  }, []);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [result]);

  const updateSelection = (field, value) => {
    setResult(null);
    onSelectionChange({ ...selection, [field]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsChecking(true);
    try {
      const { cpuId, gpuId, ramGb } = selection;
      const checked = await checkCompatibility({
        cpuId,
        gpuId,
        ramGb: Number(ramGb),
        ...(productId ? { productId } : {}),
      });
      setResult(checked);
      // El análisis cubre todo el catálogo: las tarjetas muestran su badge aunque se haya consultado un juego.
      onResult?.(Object.fromEntries(checked.results.map(({ productId: id, verdict }) => [id, verdict])));
    } catch (checkError) {
      setError(checkError.message);
    } finally {
      setIsChecking(false);
    }
  };

  const pcGames = products.filter(({ platform }) => platform !== 'Xbox');

  return (
    <dialog
      ref={dialogRef}
      aria-label="¿Corre en mi PC?"
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg animate-pop-in overflow-y-auto rounded-2xl border border-ink-700 bg-ink-900 text-ink-100 shadow-2xl shadow-black/60 backdrop:bg-ink-950/70 backdrop:backdrop-blur-sm"
    >
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink-700 bg-ink-900 p-4">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/20 text-primary-light">
          <Cpu className="size-5" aria-hidden="true" />
        </span>
        <h2 className="font-display text-lg font-bold">¿Corre en mi PC?</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="ml-auto grid size-9 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="space-y-4 p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Juego">
            <select
              value={productId}
              onChange={(event) => {
                setResult(null);
                setProductId(event.target.value);
              }}
              className={SELECT_CLASSES}
            >
              <option value={ALL_GAMES}>Todo el catálogo</option>
              {pcGames.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Procesador">
            <select
              required
              value={selection.cpuId}
              onChange={(event) => updateSelection('cpuId', event.target.value)}
              className={SELECT_CLASSES}
            >
              <option value="">Elegí tu procesador</option>
              {options?.cpus.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <Field label="Placa de video">
              <select
                required
                value={selection.gpuId}
                onChange={(event) => updateSelection('gpuId', event.target.value)}
                className={SELECT_CLASSES}
              >
                <option value="">Elegí tu placa</option>
                {options?.gpus.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="RAM">
              <select
                required
                value={selection.ramGb}
                onChange={(event) => updateSelection('ramGb', event.target.value)}
                className={SELECT_CLASSES}
              >
                <option value="">GB</option>
                {options?.ramOptions.map((ram) => (
                  <option key={ram} value={ram}>
                    {ram} GB
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <button
            type="submit"
            disabled={isChecking || !options}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-white transition-colors hover:bg-primary-light hover:text-ink-950 disabled:bg-ink-700 disabled:text-ink-300"
          >
            {isChecking && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
            {isChecking ? 'Analizando...' : 'Analizar compatibilidad'}
          </button>
        </form>

        {error && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div ref={resultRef} aria-live="polite" className="scroll-mb-4">
          {result && <Result result={result} products={products} onAddToCart={onAddToCart} />}
        </div>
      </div>
    </dialog>
  );
}
