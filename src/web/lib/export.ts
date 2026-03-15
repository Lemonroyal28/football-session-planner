import type { Session } from '../../types/session';

export function exportPNG(svgEl: SVGSVGElement, filename = 'session.png'): void {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svgEl.clientWidth * 2;
    canvas.height = svgEl.clientHeight * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0, svgEl.clientWidth, svgEl.clientHeight);
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

export function exportFSP(session: Session): void {
  const json = JSON.stringify(session, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${session.meta.title || 'session'}.fsp`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function generateShareURL(session: Session): string {
  const json = JSON.stringify(session);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return `${window.location.origin}?session=${encoded}`;
}

export function parseShareURL(): Session | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('session');
  if (!encoded) return null;
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
