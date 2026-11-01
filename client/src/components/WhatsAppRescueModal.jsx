import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, LoaderCircle, MessageCircle, Receipt, Sparkles, X } from 'lucide-react';
import { parseInquiry } from '../lib/api.js';
import InstantOrder from './InstantOrder.jsx';
import PlatformBadge from './PlatformBadge.jsx';
import TrafficLight from './TrafficLight.jsx';

const SAMPLES = [
  'hola che tengo una compu vieja con un pentium y la placa q viene con el mother, me corre el ciberpunk? cuanto sale??',
  'buenas, audio: mirá tengo un i5 8400 con una gtx 1650 y 16 gigas de ram, quiero el elden ring, anda bien?',
  'ey busco algo livianito pa jugar en la notebook q tiene intel hd, 4 gb de ram',
];

const VERDICTS = {
  INCOMPATIBLE: { light: 'incompatible', label: 'INCOMPATIBLE' },
  COMPATIBLE: { light: 'compatible', label: 'COMPATIBLE' },
  AL_LIMITE: { light: 'limit', label: 'AL LÍMITE' },
  DATOS_INSUFICIENTES: { light: 'partial', label: 'FALTAN DATOS' },
  SIN_HARDWARE: { light: 'partial', label: 'SIN HARDWARE' },
};

function Step({ number, title, icon: Icon, children }) {
  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-ink-700 bg-ink-850 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-white">
          {number}
        </span>
        <Icon className="size-4 text-accent-light" aria-hidden="true" />
        {title}
      </h3>
      <div className="mt-3 flex-1 space-y-3">{children}</div>
    </section>
  );
}

const Placeholder = ({ children }) => (
  <p className="rounded-lg border border-dashed border-ink-700 p-4 text-center text-sm text-ink-400">
    {children}
  </p>
);

export default function WhatsAppRescueModal({ onClose, onOrderCompleted }) {
  const dialogRef = useRef(null);
  const [text, setText] = useState(SAMPLES[0]);
  const [result, setResult] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  const changeText = (value) => {
    setText(value);
    setResult(null);
    setError('');
  };

  const handleRescue = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    const startedAt = performance.now();
    try {
      const inquiry = await parseInquiry(text);
      setElapsedMs(performance.now() - startedAt);
      setResult(inquiry);
      setSelectedId(inquiry.cartSuggestedItems[0]?.id ?? null);
    } catch (rescueError) {
      setError(rescueError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verdict = result && VERDICTS[result.hardwareVerdict];
  const hardware = result?.diagnosis?.hardware;
  const hardwareLabels = hardware
    ? [hardware.cpu, hardware.gpu, hardware.ramGb !== null && `${hardware.ramGb} GB RAM`].filter(Boolean)
    : [];
  const selectedItem = result?.cartSuggestedItems.find(({ id }) => id === selectedId);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Demo: Rescatar mensaje de WhatsApp"
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-6xl animate-pop-in overflow-y-auto rounded-2xl border border-ink-700 bg-ink-900 text-ink-100 shadow-2xl shadow-black/60 backdrop:bg-ink-950/70 backdrop:backdrop-blur-sm"
    >
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink-700 bg-ink-900 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-xbox/15 text-xbox">
          <MessageCircle className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg leading-tight font-bold">
            Demo: Rescatar mensaje de WhatsApp
          </h2>
          <p className="text-xs text-ink-400">De consulta desordenada a venta, sin esperar a nadie.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-white"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="grid gap-3 p-4 lg:grid-cols-3">
        <Step number={1} title="Mensaje original" icon={MessageCircle}>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLES.map((sample, index) => (
              <button
                key={sample}
                type="button"
                aria-pressed={text === sample}
                onClick={() => changeText(sample)}
                className={`min-h-8 rounded-full border px-3 text-xs font-medium transition-colors ${
                  text === sample
                    ? 'border-primary bg-primary text-white'
                    : 'border-ink-700 text-ink-300 hover:border-primary-light'
                }`}
              >
                Ejemplo {index + 1}
              </button>
            ))}
          </div>
          <form onSubmit={handleRescue} className="space-y-3">
            <label className="block">
              <span className="sr-only">Mensaje del cliente</span>
              <textarea
                required
                rows={5}
                maxLength={1000}
                value={text}
                onChange={(event) => changeText(event.target.value)}
                className="w-full resize-none rounded-xl rounded-tl-sm border border-xbox/20 bg-[#10362c] p-3 text-base leading-relaxed text-ink-100 focus:border-xbox sm:text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 font-semibold text-white transition-colors hover:bg-primary-light hover:text-ink-950 disabled:bg-ink-700 disabled:text-ink-300"
            >
              {isLoading ? (
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-5" aria-hidden="true" />
              )}
              {isLoading ? 'Analizando...' : 'Rescatar con IA'}
            </button>
          </form>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </Step>

        <Step number={2} title="Diagnóstico IA" icon={Bot}>
          {!result ? (
            <Placeholder>El diagnóstico aparece acá.</Placeholder>
          ) : (
            <div className="animate-fade-up space-y-3">
              <TrafficLight verdict={verdict.light} label={verdict.label} size="lg" />
              {result.diagnosis?.target && (
                <p className="text-xs text-ink-400">Consultó por {result.diagnosis.target.name}</p>
              )}
              {hardwareLabels.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {hardwareLabels.map((label) => (
                    <li key={label} className="rounded-md bg-ink-800 px-2 py-1 text-xs text-ink-300">
                      {label}
                    </li>
                  ))}
                </ul>
              )}
              <p className="rounded-xl rounded-tl-sm bg-ink-800 p-3 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
                {result.replyText}
              </p>
              <p className="text-xs text-ink-400">
                Resuelto en {elapsedMs < 1000 ? 'menos de 1 s' : `${(elapsedMs / 1000).toFixed(1)} s`} ·{' '}
                {result.source === 'openai' ? 'gpt-4o-mini' : 'Asesor local'}
              </p>
            </div>
          )}
        </Step>

        <Step number={3} title="Orden de compra instantánea" icon={Receipt}>
          {!result && <Placeholder>La orden lista para confirmar aparece acá.</Placeholder>}
          {result && result.cartSuggestedItems.length === 0 && (
            <Placeholder>Sin una opción segura para ofrecer: faltan datos del cliente.</Placeholder>
          )}
          {result && result.cartSuggestedItems.length > 0 && (
            <div className="animate-fade-up space-y-3">
              <fieldset className="space-y-1.5">
                <legend className="sr-only">Juego a comprar</legend>
                {result.cartSuggestedItems.map(({ id, name, platform }) => (
                  <label
                    key={id}
                    className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      id === selectedId
                        ? 'border-accent bg-accent/10'
                        : 'border-ink-700 hover:border-accent/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rescue-item"
                      checked={id === selectedId}
                      onChange={() => setSelectedId(id)}
                      className="accent-accent"
                    />
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    <PlatformBadge platform={platform} />
                  </label>
                ))}
              </fieldset>
              {selectedItem && (
                <InstantOrder
                  key={selectedItem.id}
                  item={selectedItem}
                  onCompleted={onOrderCompleted}
                />
              )}
            </div>
          )}
        </Step>
      </div>

      <p className="flex items-center justify-center gap-1.5 px-4 pb-4 text-xs text-ink-400">
        Mensaje <ArrowRight className="size-3" aria-hidden="true" /> Diagnóstico
        <ArrowRight className="size-3" aria-hidden="true" /> Orden. Demo con pago simulado.
      </p>
    </dialog>
  );
}
