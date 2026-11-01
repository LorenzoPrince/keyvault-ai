import { CircleCheck, CircleX, TriangleAlert } from 'lucide-react';

const LOW_STOCK_THRESHOLD = 5;

function stockState(stockKeys) {
  if (stockKeys === 0) {
    return { icon: CircleX, label: 'Agotado', tone: 'border-danger/40 bg-danger/10 text-danger' };
  }
  if (stockKeys <= LOW_STOCK_THRESHOLD) {
    return {
      icon: TriangleAlert,
      label: `Últimas ${stockKeys}`,
      tone: 'border-warning/40 bg-warning/10 text-warning',
    };
  }
  return {
    icon: CircleCheck,
    label: `${stockKeys} keys`,
    tone: 'border-success/30 bg-success/10 text-success',
  };
}

export default function StockBadge({ stockKeys }) {
  const { icon: Icon, label, tone } = stockState(stockKeys);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tone}`}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}
