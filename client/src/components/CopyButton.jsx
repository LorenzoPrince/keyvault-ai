import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '../lib/clipboard.js';

const COPIED_FEEDBACK_MS = 1600;

export default function CopyButton({ text, label, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!(await copyText(text))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  const Icon = copied ? Check : Copy;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-ink-700 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent-light ${copied ? 'border-success! text-success!' : ''} ${className}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span aria-live="polite">{copied ? 'Copiado' : label}</span>
    </button>
  );
}
