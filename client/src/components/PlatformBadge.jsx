const PLATFORM_STYLES = {
  Steam: 'border-steam/40 bg-steam/10 text-steam',
  Epic: 'border-epic/40 bg-epic/10 text-epic',
  Xbox: 'border-xbox/40 bg-xbox/10 text-xbox',
};

export default function PlatformBadge({ platform, className = '' }) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${PLATFORM_STYLES[platform]} ${className}`}
    >
      {platform}
    </span>
  );
}
