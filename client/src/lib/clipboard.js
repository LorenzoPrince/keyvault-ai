// navigator.clipboard solo existe en HTTPS o localhost; el fallback cubre un sitio servido por HTTP.
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.className = 'fixed opacity-0';
    // Dentro de un <dialog> modal el resto del documento es inerte.
    (document.querySelector('dialog[open]') ?? document.body).append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }
}
