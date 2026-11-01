import { useState } from 'react';
import {
  Bot,
  CircleDollarSign,
  Clock,
  Eye,
  EyeOff,
  LifeBuoy,
  Lock,
  MessageCircleOff,
  RotateCw,
  Search,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react';
import { useAdminStats } from '../hooks/useAdminStats.js';
import { formatPrice, formatShortDate } from '../lib/format.js';
import CopyButton from './CopyButton.jsx';
import PlatformBadge from './PlatformBadge.jsx';
import StockBadge from './StockBadge.jsx';

const PANEL_CLASSES = 'rounded-2xl border border-ink-700/70 bg-ink-850 shadow-card';

const maskKey = (key) => `•••••-•••••-${key.slice(-5)}`;

const CHANNEL_BADGES = { concierge: 'Concierge IA', rescate: 'Rescate WhatsApp' };
const MINUTES_PER_HOUR = 60;

function formatDuration(minutes) {
  if (minutes < MINUTES_PER_HOUR) return `${minutes} min`;
  const remainder = minutes % MINUTES_PER_HOUR;
  const hours = `${Math.floor(minutes / MINUTES_PER_HOUR)} h`;
  return remainder > 0 ? `${hours} ${remainder} min` : hours;
}

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;

function Kpi({ icon: Icon, label, value, hint }) {
  return (
    <article className={`${PANEL_CLASSES} p-5`}>
      <div className="flex items-center gap-2 text-sm font-medium text-ink-300">
        <Icon className="size-4 text-accent-light" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight text-white tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-ink-400">{hint}</p>
    </article>
  );
}

function SavedSales({ stats }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-primary/40 bg-linear-to-r from-primary/20 to-accent/15 p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/25 text-primary-light">
        <LifeBuoy className="size-6" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <h2 className="font-display text-lg font-bold">
          Ventas salvadas por asesoramiento técnico de IA
        </h2>
        <p className="mt-0.5 text-sm text-ink-300">
          El cliente iba por un juego que su PC no corría y compró una alternativa compatible.
        </p>
      </div>
      <dl className="flex gap-8">
        <div>
          <dt className="text-xs text-ink-300">Ventas</dt>
          <dd className="font-display text-3xl font-bold text-white tabular-nums">
            {stats.savedSalesCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-300">Facturado</dt>
          <dd className="font-display text-3xl font-bold whitespace-nowrap text-white tabular-nums">
            {formatPrice(stats.savedSalesRevenue)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function SaleRow({ sale }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const ToggleIcon = isRevealed ? EyeOff : Eye;

  return (
    <tr className="block border-t border-ink-700/60 py-2 transition-colors hover:bg-ink-800/50 md:table-row md:py-0">
      <td className="block px-4 py-1 whitespace-nowrap md:table-cell md:py-3">
        <p className="font-mono text-xs font-semibold text-white">{sale.orderId}</p>
        <p className="mt-0.5 text-xs text-ink-400">{formatShortDate(sale.date)}</p>
      </td>
      <td className="block px-4 py-1 md:table-cell md:py-3">
        <p className="font-medium">{sale.game}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <PlatformBadge platform={sale.platform} />
          {CHANNEL_BADGES[sale.channel] && (
            <span className="rounded-md border border-xbox/40 bg-xbox/10 px-2 py-0.5 text-xs font-semibold text-xbox">
              {CHANNEL_BADGES[sale.channel]}
            </span>
          )}
          {sale.savedByAdvice && (
            <span className="rounded-md border border-primary-light/40 bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary-light">
              Venta salvada
            </span>
          )}
          {sale.aiAssisted && !sale.savedByAdvice && (
            <span className="rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent-light">
              Asesorada por IA
            </span>
          )}
        </div>
      </td>
      <td className="block px-4 py-1 break-all text-ink-300 md:table-cell md:py-3">{sale.customerEmail}</td>
      <td className="block px-4 py-1 font-semibold whitespace-nowrap tabular-nums md:table-cell md:py-3 md:text-right">
        {formatPrice(sale.price)}
      </td>
      <td className="block px-4 py-1 md:table-cell md:py-3">
        <div className="flex items-center gap-1.5">
          <code className="font-mono text-xs whitespace-nowrap text-accent-light">
            {isRevealed ? sale.key : maskKey(sale.key)}
          </code>
          <button
            type="button"
            onClick={() => setIsRevealed((current) => !current)}
            aria-label={`${isRevealed ? 'Ocultar' : 'Mostrar'} key del pedido ${sale.orderId}`}
            className="grid size-8 shrink-0 place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-700 hover:text-white"
          >
            <ToggleIcon className="size-4" aria-hidden="true" />
          </button>
          <CopyButton text={sale.key} label="Copiar" />
        </div>
      </td>
    </tr>
  );
}

function SalesTable({ sales, onGoToStore }) {
  const [search, setSearch] = useState('');
  const [onlyAssisted, setOnlyAssisted] = useState(false);

  const term = search.trim().toLowerCase();
  const visibleSales = sales.filter(
    ({ orderId, game, customerEmail, aiAssisted }) =>
      (!onlyAssisted || aiAssisted) &&
      [orderId, game, customerEmail].some((value) => value.toLowerCase().includes(term)),
  );

  return (
    <section className={`${PANEL_CLASSES} min-w-0 overflow-hidden`}>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <h2 className="font-display text-lg font-bold">Últimas ventas</h2>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            aria-pressed={onlyAssisted}
            onClick={() => setOnlyAssisted((current) => !current)}
            className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
              onlyAssisted
                ? 'border-accent bg-accent/15 text-accent-light'
                : 'border-ink-700 text-ink-300 hover:border-accent hover:text-white'
            }`}
          >
            <Bot className="size-4" aria-hidden="true" />
            Solo asesoradas
          </button>
          <label className="relative sm:w-64">
            <span className="sr-only">Buscar venta</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pedido, juego o email"
              className="h-9 w-full rounded-lg border border-ink-700 bg-ink-900 pr-3 pl-9 text-sm placeholder:text-ink-400 focus:border-primary-light"
            />
          </label>
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="border-t border-ink-700/60 px-6 py-12 text-center">
          <p className="text-ink-300">Todavía no hay ventas registradas.</p>
          <button
            type="button"
            onClick={onGoToStore}
            className="mt-3 rounded-lg border border-ink-700 px-4 py-2 text-sm font-semibold transition-colors hover:border-accent hover:text-accent-light"
          >
            Ir a la tienda
          </button>
        </div>
      ) : (
        <div>
          <table className="block w-full text-left text-sm md:table">
            <thead className="hidden text-xs tracking-wide text-ink-400 uppercase md:table-header-group">
              <tr>
                <th scope="col" className="px-4 pb-2 font-medium">Pedido</th>
                <th scope="col" className="px-4 pb-2 font-medium">Juego</th>
                <th scope="col" className="px-4 pb-2 font-medium">Cliente</th>
                <th scope="col" className="px-4 pb-2 text-right font-medium">Precio</th>
                <th scope="col" className="px-4 pb-2 font-medium">Key entregada</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {visibleSales.map((sale) => (
                <SaleRow key={sale.key} sale={sale} />
              ))}
            </tbody>
          </table>
          {visibleSales.length === 0 && (
            <p className="border-t border-ink-700/60 p-6 text-center text-sm text-ink-400">
              Ninguna venta coincide con la búsqueda.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function TopGames({ games }) {
  const maxDemand = Math.max(...games.map(({ unitsSold, consultations }) => unitsSold + consultations), 1);

  return (
    <section className={`${PANEL_CLASSES} p-4`}>
      <h2 className="font-display text-lg font-bold">Juegos más demandados</h2>
      <p className="text-xs text-ink-400">Unidades vendidas más consultas al asesor</p>

      {games.length === 0 ? (
        <p className="mt-4 text-sm text-ink-400">Sin datos de demanda todavía.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {games.map(({ productId, name, unitsSold, consultations }) => {
            const demand = unitsSold + consultations;
            return (
              <li key={productId} title={`${name}: ${plural(unitsSold, 'vendida', 'vendidas')}, ${plural(consultations, 'consulta', 'consultas')}`}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{name}</span>
                  <span className="text-xs whitespace-nowrap text-ink-300 tabular-nums">
                    {plural(unitsSold, 'vendida', 'vendidas')} · {plural(consultations, 'consulta', 'consultas')}
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-r bg-ink-800">
                  <div
                    className="h-full rounded-r bg-primary transition-[width] duration-500 ease-out"
                    style={{ width: `${(demand / maxDemand) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Inventory({ inventory }) {
  return (
    <section className={`${PANEL_CLASSES} p-4`}>
      <h2 className="font-display text-lg font-bold">Stock en tiempo real</h2>
      <ul className="mt-3 divide-y divide-ink-700/60">
        {inventory.map(({ productId, name, platform, stockKeys }) => (
          <li key={productId} className="flex items-center justify-between gap-2 py-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{name}</span>
              <PlatformBadge platform={platform} className="hidden min-[400px]:inline-block" />
            </span>
            <StockBadge stockKeys={stockKeys} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function LockedPanel({ wasRejected, onUnlock }) {
  const [token, setToken] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onUnlock(token.trim());
      }}
      className={`${PANEL_CLASSES} mx-auto mt-16 max-w-sm p-6 text-center`}
    >
      <Lock className="mx-auto size-8 text-primary-light" aria-hidden="true" />
      <h1 className="mt-3 font-display text-xl font-bold">Panel protegido</h1>
      <label className="mt-4 block text-left text-sm font-semibold">
        Token de administración
        <input
          type="password"
          required
          autoFocus
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="mt-1 h-11 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 text-sm focus:border-primary-light"
        />
      </label>
      {wasRejected && (
        <p role="alert" className="mt-2 text-left text-sm text-danger">
          Token incorrecto.
        </p>
      )}
      <button
        type="submit"
        className="mt-4 min-h-11 w-full rounded-lg bg-primary font-semibold text-white transition-colors hover:bg-primary-light hover:text-ink-950"
      >
        Entrar
      </button>
    </form>
  );
}

export default function AdminDashboard({ onGoToStore }) {
  const { stats, status, updatedAt, unlock, wasRejected } = useAdminStats();

  if (status === 'locked') {
    return (
      <div className="px-4">
        <LockedPanel wasRejected={wasRejected} onUnlock={unlock} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center text-ink-300">
        {status === 'error' ? (
          <>
            <RotateCw className="size-8 text-ink-400" aria-hidden="true" />
            <p className="mt-3">No pudimos cargar las métricas. Reintentando...</p>
          </>
        ) : (
          <p>Cargando métricas...</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Panel del dueño
          </h1>
          <p className="mt-1 text-ink-400">Lo que vendió y resolvió tu tienda sin intervención humana.</p>
        </div>
        <p className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-3 py-1 text-xs text-ink-300">
          <span className="relative flex size-2" aria-hidden="true">
            <span
              className={`absolute inset-0 rounded-full ${status === 'error' ? 'bg-danger' : 'animate-ping bg-success/70'}`}
            />
            <span className={`relative size-2 rounded-full ${status === 'error' ? 'bg-danger' : 'bg-success'}`} />
          </span>
          {status === 'error' ? 'Sin conexión' : 'En vivo'}
          {updatedAt && ` · ${updatedAt.toLocaleTimeString('es-AR')}`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={CircleDollarSign}
          label="Ingresos Generados"
          value={formatPrice(stats.totalRevenue)}
          hint={`${formatPrice(stats.aiAssistedRevenue)} en ventas asesoradas por IA`}
        />
        <Kpi
          icon={ShoppingBag}
          label="Pedidos Automatizados"
          value={stats.totalOrders}
          hint={`${plural(stats.aiAssistedCount, 'asesorado', 'asesorados')} por IA, ${plural(stats.conciergeOrders, 'cerrado', 'cerrados')} en el chat`}
        />
        <Kpi
          icon={MessageCircleOff}
          label="Consultas de WhatsApp Evitadas"
          value={stats.consultationsAutomated}
          hint="Respondidas por el asesor sin intervención humana"
        />
        <Kpi
          icon={Clock}
          label="Tiempo Ahorrado (estimado)"
          value={formatDuration(stats.timeSavedMinutes)}
          hint="Supone 5 min por consulta y 3 min por pedido"
        />
      </div>

      <SavedSales stats={stats} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SalesTable sales={stats.ordersList} onGoToStore={onGoToStore} />
        <div className="min-w-0 space-y-5">
          <TopGames games={stats.topDemandedGames} />
          <section className={`${PANEL_CLASSES} flex items-center gap-3 p-4`}>
            <ShieldAlert className="size-5 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-sm text-ink-300">
              <span className="font-semibold text-white tabular-nums">{stats.preventedPurchases}</span>{' '}
              compras inviables frenadas por el asesor
            </p>
          </section>
          <Inventory inventory={stats.inventory} />
        </div>
      </div>
    </div>
  );
}
