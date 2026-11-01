import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Plus, SendHorizontal, X } from 'lucide-react';
import { formatPrice } from '../lib/format.js';
import TrafficLight from './TrafficLight.jsx';

const SUGGESTIONS = [
  '¿Qué me corre con una GTX 1650?',
  '¿Tienen claves para Steam?',
  '¿Qué juego de rol me recomendás?',
];

function ChatBubble({ message, products, onAddToCart }) {
  const isUser = message.role === 'user';
  const target = message.compatibility?.target;
  const suggested = (message.suggestedProducts ?? [])
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);

  return (
    <li className={`flex animate-fade-up gap-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-accent">
          <Bot className="size-4 text-white" aria-hidden="true" />
        </span>
      )}
      <div className="max-w-[85%] min-w-0">
        {target && (
          <div className="mb-1.5 flex items-center justify-between gap-3 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-xs">
            <span className="min-w-0 truncate text-ink-300">{target.name}</span>
            <TrafficLight verdict={target.verdict} />
          </div>
        )}
        <p
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap ${
            isUser
              ? 'rounded-br-sm bg-primary text-white'
              : `rounded-tl-sm bg-ink-800 ${message.isError ? 'text-danger' : 'text-ink-100'}`
          }`}
        >
          {message.content}
        </p>
        {suggested.length > 0 && (
          <div className="mt-2 grid gap-1.5">
            {suggested.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onAddToCart(product)}
                className="flex min-h-9 items-center justify-between gap-2 rounded-lg border border-accent/40 bg-accent/5 px-2.5 py-1.5 text-left text-xs font-semibold text-accent-light transition-colors hover:bg-accent/15"
              >
                <span className="flex items-center gap-1.5">
                  <Plus className="size-3.5 shrink-0" aria-hidden="true" />
                  {product.name}
                </span>
                <span className="whitespace-nowrap">{formatPrice(product.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export default function ChatWidget({ chat, isOpen, onToggle, products, onAddToCart }) {
  const { messages, isLoading, send } = chat;
  const [draft, setDraft] = useState('');
  const logRef = useRef(null);
  const inputRef = useRef(null);

  const lastReply = messages.findLast(({ role, id }) => role === 'assistant' && id !== 0);
  const isDemoMode = lastReply?.source === 'mock';

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isLoading || !draft.trim()) return;
    send(draft);
    setDraft('');
  };

  return (
    <>
      {isOpen && (
        <section
          aria-label="Asesor IA de KeyVault"
          onKeyDown={(event) => event.key === 'Escape' && onToggle()}
          className="fixed inset-0 z-40 flex h-dvh animate-pop-in flex-col overflow-hidden bg-ink-900 sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-96 sm:rounded-2xl sm:border sm:border-ink-700 sm:shadow-2xl sm:shadow-black/60"
        >
          <header className="flex items-center gap-3 bg-linear-to-r from-primary/90 to-accent/70 px-4 py-3">
            <span className="grid size-9 place-items-center rounded-full bg-white/15">
              <Bot className="size-5 text-white" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display leading-tight font-bold text-white">Asesor KeyVault</h2>
              <p className="flex items-center gap-1.5 text-xs text-white/90">
                <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                {isDemoMode ? 'Modo demo, sin OpenAI' : 'En línea 24/7'}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggle}
              aria-label="Cerrar asesor"
              className="grid size-9 place-items-center rounded-lg text-white transition-colors hover:bg-white/15"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>

          <ul
            ref={logRef}
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-3"
          >
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                products={products}
                onAddToCart={onAddToCart}
              />
            ))}
            {isLoading && (
              <li className="flex items-center gap-2 pl-9 text-xs text-ink-400">
                <span className="flex gap-1" aria-hidden="true">
                  <span className="size-1.5 animate-bounce rounded-full bg-accent-light" />
                  <span className="size-1.5 animate-bounce rounded-full bg-accent-light [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-accent-light [animation-delay:300ms]" />
                </span>
                Asesor pensando...
              </li>
            )}
          </ul>

          {messages.length === 1 && (
            <div className="flex flex-col items-stretch gap-1.5 px-3 pb-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-left text-sm text-ink-300 transition-colors hover:border-primary-light hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-ink-700 p-3">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Escribí tu consulta</span>
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={1000}
                placeholder="Escribí tu consulta..."
                className="h-11 w-full rounded-lg border border-ink-700 bg-ink-850 px-3 text-base placeholder:text-ink-400 focus:border-primary-light sm:text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading || !draft.trim()}
              aria-label="Enviar mensaje"
              className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-light disabled:bg-ink-700 disabled:text-ink-400"
            >
              <SendHorizontal className="size-5" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Cerrar asesor IA' : 'Abrir asesor IA'}
        className={`fixed right-4 bottom-4 z-40 size-14 place-items-center rounded-full bg-linear-to-br from-primary to-accent text-white shadow-glow transition-transform hover:scale-105 sm:right-6 sm:bottom-6 ${isOpen ? 'hidden sm:grid' : 'grid'}`}
      >
        {isOpen ? (
          <X className="size-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="size-6" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
