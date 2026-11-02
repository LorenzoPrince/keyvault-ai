import { CircleCheck, CircleHelp, CircleX, Gamepad2, TriangleAlert } from 'lucide-react';

// Mismo vocabulario y colores que el semáforo: verde apto, amarillo al límite, rojo no compatible.
const VERDICT_BADGES = {
  compatible: {
    icon: CircleCheck,
    label: 'Compatible',
    tone: 'border-success/50 bg-success/15 text-success shadow-[0_0_12px_-2px_var(--color-success)]',
  },
  limit: {
    icon: TriangleAlert,
    label: 'Al límite',
    tone: 'border-warning/50 bg-warning/15 text-warning shadow-[0_0_12px_-2px_var(--color-warning)]',
  },
  partial: {
    icon: CircleHelp,
    label: 'Faltan datos',
    tone: 'border-warning/40 bg-warning/10 text-warning',
  },
  incompatible: {
    icon: CircleX,
    label: 'No compatible',
    tone: 'border-danger/50 bg-danger/15 text-danger shadow-[0_0_12px_-2px_var(--color-danger)]',
  },
  console: {
    icon: Gamepad2,
    label: 'Solo consola',
    tone: 'border-xbox/40 bg-xbox/10 text-xbox',
  },
};

export default function CompatibilityBadge({ verdict, compact = false, className = '' }) {
  const badge = VERDICT_BADGES[verdict];
  if (!badge) return null;
  const { icon: Icon, label, tone } = badge;

  return (
    <span
      title={`Tu PC: ${label}`}
      className={`inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap backdrop-blur-sm ${
        compact ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-[11px]'
      } ${tone} ${className}`}
    >
      <Icon className={compact ? 'size-2.5' : 'size-3'} aria-hidden="true" />
      {label}
    </span>
  );
}
