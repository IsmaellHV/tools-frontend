// Motor de render del editor. Las operaciones se aplican DESTRUCTIVAMENTE sobre
// el canvas: lo que se exporta no lleva capas ni metadatos, los pixeles tapados
// dejan de existir en el archivo final. Un overlay CSS solo lo escondería.

import type { EditOp } from '~/lib/imageEditStore';

/** Recorta el rect al lienzo y lo normaliza (permite arrastrar en cualquier direccion). */
const norm = (x: number, y: number, w: number, h: number, cw: number, ch: number) => {
  const x0 = Math.max(0, Math.min(cw, w < 0 ? x + w : x));
  const y0 = Math.max(0, Math.min(ch, h < 0 ? y + h : y));
  const x1 = Math.max(0, Math.min(cw, w < 0 ? x : x + w));
  const y1 = Math.max(0, Math.min(ch, h < 0 ? y : y + h));
  return { x: x0, y: y0, w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
};

const pixelate = (ctx: CanvasRenderingContext2D, op: Extract<EditOp, { k: 'pixelate' }>): void => {
  const r = norm(op.x, op.y, op.w, op.h, ctx.canvas.width, ctx.canvas.height);
  if (r.w < 1 || r.h < 1) return;
  // Bajar a una rejilla diminuta y volver a subir sin suavizado tira la informacion.
  const cols = Math.max(1, Math.round(r.w / op.size));
  const rows = Math.max(1, Math.round(r.h / op.size));
  const tmp = document.createElement('canvas');
  tmp.width = cols;
  tmp.height = rows;
  const tctx = tmp.getContext('2d');
  if (!tctx) return;
  tctx.drawImage(ctx.canvas, r.x, r.y, r.w, r.h, 0, 0, cols, rows);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmp, 0, 0, cols, rows, r.x, r.y, r.w, r.h);
  ctx.restore();
};

const blur = (ctx: CanvasRenderingContext2D, op: Extract<EditOp, { k: 'blur' }>): void => {
  const r = norm(op.x, op.y, op.w, op.h, ctx.canvas.width, ctx.canvas.height);
  if (r.w < 1 || r.h < 1) return;
  // Se copia con margen para que el desenfoque no chupe transparencia del borde.
  const pad = Math.ceil(op.radius * 2);
  const sx = Math.max(0, r.x - pad);
  const sy = Math.max(0, r.y - pad);
  const sw = Math.min(ctx.canvas.width - sx, r.w + pad * 2);
  const sh = Math.min(ctx.canvas.height - sy, r.h + pad * 2);
  const tmp = document.createElement('canvas');
  tmp.width = sw;
  tmp.height = sh;
  const tctx = tmp.getContext('2d');
  if (!tctx) return;
  tctx.drawImage(ctx.canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.filter = `blur(${op.radius}px)`;
  ctx.drawImage(tmp, sx, sy);
  ctx.restore();
};

/** Rellena o contornea el trazo ya definido en el path actual. */
const paint = (ctx: CanvasRenderingContext2D, color: string, fill: boolean, width: number): void => {
  if (fill) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, width);
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
};

const box = (ctx: CanvasRenderingContext2D, op: Extract<EditOp, { k: 'box' }>): void => {
  const r = norm(op.x, op.y, op.w, op.h, ctx.canvas.width, ctx.canvas.height);
  if (r.w < 1 || r.h < 1) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  paint(ctx, op.color, op.fill !== false, op.width ?? 4);
  ctx.restore();
};

const ellipse = (ctx: CanvasRenderingContext2D, op: Extract<EditOp, { k: 'ellipse' }>): void => {
  const r = norm(op.x, op.y, op.w, op.h, ctx.canvas.width, ctx.canvas.height);
  if (r.w < 2 || r.h < 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
  paint(ctx, op.color, op.fill !== false, op.width ?? 4);
  ctx.restore();
};

const polygon = (ctx: CanvasRenderingContext2D, op: Extract<EditOp, { k: 'polygon' }>): void => {
  if (op.points.length < 3) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(op.points[0][0], op.points[0][1]);
  for (const [x, y] of op.points.slice(1)) ctx.lineTo(x, y);
  ctx.closePath();
  paint(ctx, op.color, op.fill !== false, op.width ?? 4);
  ctx.restore();
};

const arrow = (ctx: CanvasRenderingContext2D, op: Extract<EditOp, { k: 'arrow' }>): void => {
  const dx = op.x2 - op.x1;
  const dy = op.y2 - op.y1;
  const len = Math.hypot(dx, dy);
  if (len < 4) return;
  const w = Math.max(1, op.width);
  const head = Math.min(len, w * 4); // la punta no puede comerse la flecha entera
  const a = Math.atan2(dy, dx);
  // El tallo se corta antes de la punta para que no asome por dentro del triangulo.
  const sx = op.x2 - Math.cos(a) * head * 0.9;
  const sy = op.y2 - Math.sin(a) * head * 0.9;
  ctx.save();
  ctx.strokeStyle = op.color;
  ctx.fillStyle = op.color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(op.x1, op.y1);
  ctx.lineTo(sx, sy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(op.x2, op.y2);
  ctx.lineTo(op.x2 - Math.cos(a - 0.42) * head, op.y2 - Math.sin(a - 0.42) * head);
  ctx.lineTo(op.x2 - Math.cos(a + 0.42) * head, op.y2 - Math.sin(a + 0.42) * head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const text = (ctx: CanvasRenderingContext2D, op: Extract<EditOp, { k: 'text' }>): void => {
  if (!op.text) return;
  ctx.save();
  ctx.font = `700 ${op.size}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.textBaseline = 'top';
  // Contorno oscuro para que el texto se lea tanto sobre zonas claras como oscuras.
  ctx.lineWidth = Math.max(2, op.size / 8);
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineJoin = 'round';
  ctx.strokeText(op.text, op.x, op.y);
  ctx.fillStyle = op.color;
  ctx.fillText(op.text, op.x, op.y);
  ctx.restore();
};

export function applyOps(ctx: CanvasRenderingContext2D, ops: readonly EditOp[]): void {
  for (const op of ops) {
    if (op.k === 'box') box(ctx, op);
    else if (op.k === 'ellipse') ellipse(ctx, op);
    else if (op.k === 'polygon') polygon(ctx, op);
    else if (op.k === 'arrow') arrow(ctx, op);
    else if (op.k === 'pixelate') pixelate(ctx, op);
    else if (op.k === 'blur') blur(ctx, op);
    else text(ctx, op);
  }
}

/** Render a resolucion nativa: es el que se descarga, se copia y se guarda. */
export function renderFull(img: CanvasImageSource, w: number, h: number, ops: readonly EditOp[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(img, 0, 0, w, h);
    applyOps(ctx, ops);
  }
  return canvas;
}

export const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality = 0.92): Promise<Blob> =>
  new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), type, quality));

/** Miniatura del resultado YA censurado: es lo unico seguro de pintar en el historial. */
export async function makeThumb(source: HTMLCanvasElement, max = 320): Promise<Blob> {
  const scale = Math.min(1, max / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvasToBlob(canvas, 'image/jpeg', 0.7);
}
