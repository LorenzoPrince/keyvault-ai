const VERDICTS = {
  compatible: { lamp: 'green', label: 'Apto' },
  limit: { lamp: 'amber', label: 'Apto al límite' },
  partial: { lamp: 'amber', label: 'Faltan datos' },
  incompatible: { lamp: 'red', label: 'No compatible' },
  console: { lamp: 'red', label: 'Solo Xbox' },
};

const LAMPS = [
  { id: 'red', on: 'bg-danger shadow-[0_0_14px_var(--color-danger)]' },
  { id: 'amber', on: 'bg-warning shadow-[0_0_14px_var(--color-warning)]' },
  { id: 'green', on: 'bg-success shadow-[0_0_14px_var(--color-success)]' },
];

export default function TrafficLight({ verdict, size = 'sm' }) {
  const { lamp, label } = VERDICTS[verdict];
  const lampSize = size === 'lg' ? 'size-5' : 'size-2.5';

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-full bg-ink-950 ring-1 ring-ink-700 ${size === 'lg' ? 'gap-1.5 p-2' : 'gap-1 p-1'}`}
        aria-hidden="true"
      >
        {LAMPS.map(({ id, on }) => (
          <span
            key={id}
            className={`rounded-full transition-all duration-300 ${lampSize} ${id === lamp ? on : 'bg-ink-700'}`}
          />
        ))}
      </span>
      <span className={`font-semibold ${size === 'lg' ? 'font-display text-xl' : 'text-xs'}`}>
        {label}
      </span>
    </span>
  );
}
