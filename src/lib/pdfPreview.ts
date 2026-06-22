// Renderiza páginas PDF a miniaturas (data URL) usando pdf.js. Solo corre en el
// browser (lo importan islas client:only). El worker se sirve via Vite ?url.
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export interface PdfThumbs {
  total: number; // páginas totales del PDF
  rendered: number; // cuántas miniaturas se generaron (puede ser < total por el cap)
  thumbs: string[]; // data URLs JPEG
}

// Renderiza hasta `max` páginas a un ancho fijo. pdf.js "consume" el ArrayBuffer
// que recibe, así que pasamos una copia y dejamos el original intacto.
export async function renderPdfThumbs(data: ArrayBuffer, opts?: { width?: number; max?: number }): Promise<PdfThumbs> {
  const width = opts?.width ?? 120;
  const max = opts?.max ?? 60;
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data.slice(0)) });
  const pdf = await loadingTask.promise;
  const total = pdf.numPages;
  const count = Math.min(total, max);
  const thumbs: string[] = [];
  try {
    for (let i = 1; i <= count; i++) {
      const page = await pdf.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: width / base.width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      thumbs.push(canvas.toDataURL('image/jpeg', 0.7));
    }
  } finally {
    await loadingTask.destroy();
  }
  return { total, rendered: thumbs.length, thumbs };
}

// Atajo: renderiza solo la primera página (para previews de un archivo).
export async function renderFirstPage(data: ArrayBuffer, width = 160): Promise<string | null> {
  const { thumbs } = await renderPdfThumbs(data, { width, max: 1 });
  return thumbs[0] ?? null;
}

export interface PdfPageImage {
  page: number;
  url: string; // objectURL para mostrar/descargar
  blob: Blob;
}

// Renderiza páginas a imágenes full-res (PNG/JPG) para exportar. Si `pages` se
// pasa, solo renderiza esas (1-based); si no, todas hasta `max`.
export async function renderPdfPageImages(
  data: ArrayBuffer,
  opts?: { scale?: number; format?: 'png' | 'jpeg'; quality?: number; max?: number; pages?: number[] },
): Promise<{ total: number; pages: PdfPageImage[] }> {
  const scale = opts?.scale ?? 2;
  const mime = opts?.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = opts?.quality ?? 0.92;
  const max = opts?.max ?? 100;
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data.slice(0)) });
  const pdf = await loadingTask.promise;
  const total = pdf.numPages;
  const wanted = opts?.pages ?? Array.from({ length: Math.min(total, max) }, (_, i) => i + 1);
  const result: PdfPageImage[] = [];
  try {
    for (const n of wanted) {
      if (n < 1 || n > total) continue;
      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), mime, quality));
      result.push({ page: n, url: URL.createObjectURL(blob), blob });
    }
  } finally {
    await loadingTask.destroy();
  }
  return { total, pages: result };
}
