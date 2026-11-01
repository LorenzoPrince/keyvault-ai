// Identifica la visita para atribuir en el panel las ventas asistidas por el asesor.
export const sessionId = Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) =>
  byte.toString(16).padStart(2, '0'),
).join('');
