import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

// Si la imagen externa no carga, muestra una portada generada con el nombre del juego.
export default function ProductCover({ product, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-linear-to-br from-primary/60 to-accent/40 p-3 text-center ${className}`}
      >
        <Gamepad2 className="size-7 text-white/80" aria-hidden="true" />
        <span className="font-display text-sm font-bold">{product.name}</span>
      </div>
    );
  }

  return (
    <img
      src={product.coverImage}
      alt={`Portada de ${product.name}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
