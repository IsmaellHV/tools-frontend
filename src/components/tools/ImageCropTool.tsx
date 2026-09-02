import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

type Format = 'png' | 'jpeg' | 'webp';
type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type Mode = Handle | 'new' | 'move';
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** null = libre; el resto es ancho/alto. */
const RATIOS: { id: string; value: number | null }[] = [
  { id: 'free', value: null },
  { id: 'square', value: 1 },
  { id: 'r43', value: 4 / 3 },
  { id: 'r32', value: 3 / 2 },
  { id: 'r169', value: 16 / 9 },
];

const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const CURSORS: Record<Handle, string> = {
  nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize',
  n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

const clampRect = (r: Rect, W: number, H: number): Rect => {
  const w = Math.min(Math.max(1, Math.round(r.w)), W);
  const h = Math.min(Math.max(1, Math.round(r.h)), H);
  return {
    w,
    h,
    x: Math.min(Math.max(0, Math.round(r.x)), W - w),
    y: Math.min(Math.max(0, Math.round(r.y)), H - h),
  };
};

/** Ajusta el rect a la proporcion pedida sin salirse del lienzo. */
const applyRatio = (r: Rect, ratio: number | null, W: number, H: number): Rect => {
  if (!ratio) return clampRect(r, W, H);
  const { x, y } = r;
  let { w, h } = r;
  h = w / ratio;
  if (y + h > H) {
    h = H - y;
    w = h * ratio;
  }
  if (x + w > W) {
    w = W - x;
    h = w / ratio;
  }
  return clampRect({ x, y, w, h }, W, H);
};

export default function ImageCropTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const scaleRef = useRef(1); // px de pantalla por px de imagen
  const dragRef = useRef<{ mode: Mode; sx: number; sy: number; orig: Rect } | null>(null);

  const [name, setName] = useState('');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [sel, setSel] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [ratio, setRatio] = useState<number | null>(null);
  const [format, setFormat] = useState<Format>('png');
  const [hover, setHover] = useState<Mode | null>(null);
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  const t = (k: string, fb: string) => pick(dict, k as Parameters<typeof pick>[1], fb);

  /* ---------- pintado ---------- */

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !img || !ctx) return;
    const scale = canvas.getBoundingClientRect().width / canvas.width || 1;
    scaleRef.current = scale;
    const px = (n: number) => n / scale; // grosores constantes en pantalla

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const { x, y, w, h } = sel;
    if (w < 1 || h < 1) return;

    // Se oscurece todo menos la seleccion (cuatro bandas, no un clear que borraria la foto).
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvas.width, y);
    ctx.fillRect(0, y + h, canvas.width, canvas.height - y - h);
    ctx.fillRect(0, y, x, h);
    ctx.fillRect(x + w, y, canvas.width - x - w, h);

    // Guias de tercios: ayudan a encuadrar y dejan claro que es una seleccion viva.
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = px(1);
    ctx.beginPath();
    for (let i = 1; i < 3; i++) {
      ctx.moveTo(x + (w * i) / 3, y);
      ctx.lineTo(x + (w * i) / 3, y + h);
      ctx.moveTo(x, y + (h * i) / 3);
      ctx.lineTo(x + w, y + (h * i) / 3);
    }
    ctx.stroke();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = px(2);
    ctx.strokeRect(x, y, w, h);

    const s = px(9);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = px(1);
    for (const hd of HANDLES) {
      const [cx, cy] = handleCenter(hd, sel);
      ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
      ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
    }
  }, [sel]);

  useEffect(() => {
    if (ready) draw();
  }, [ready, draw]);

  // El lienzo se reescala con la ventana y los tiradores deben seguir midiendo igual.
  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  /* ---------- carga ---------- */

  const loadFile = useCallback(async (f: File | Blob, fileName?: string) => {
    if (!f.type.startsWith('image/')) return;
    setError('');
    const url = URL.createObjectURL(f);
    try {
      const img = await loadImage(url);
      imgRef.current = img;
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      setSize({ w: W, h: H });
      setName(fileName || (f as File).name || 'image');
      // Arranca con un margen del 10%, para que se vea que se puede ajustar.
      setSel(clampRect({ x: W * 0.1, y: H * 0.1, w: W * 0.8, h: H * 0.8 }, W, H));
      setRatio(null);
      setReady(true);
    } catch {
      setError(t('t.imageCrop.error', 'Could not open this image.'));
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [dict]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith('image/'));
      const f = item?.getAsFile();
      if (f) void loadFile(f, 'pasted');
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadFile]);

  /* ---------- interaccion ---------- */

  const toImg = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  };

  const hitTest = (p: { x: number; y: number }): Mode | null => {
    const tol = 11 / scaleRef.current; // tolerancia constante en pantalla
    for (const hd of HANDLES) {
      const [cx, cy] = handleCenter(hd, sel);
      if (Math.abs(p.x - cx) <= tol && Math.abs(p.y - cy) <= tol) return hd;
    }
    if (p.x > sel.x && p.x < sel.x + sel.w && p.y > sel.y && p.y < sel.y + sel.h) return 'move';
    return null;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ready) return;
    const p = toImg(e);
    const mode = hitTest(p) ?? 'new';
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { mode, sx: p.x, sy: p.y, orig: { ...sel } };
    if (mode === 'new') setSel({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    const p = toImg(e);
    if (!d) {
      setHover(ready ? hitTest(p) : null);
      return;
    }
    const { w: W, h: H } = size;
    const dx = p.x - d.sx;
    const dy = p.y - d.sy;
    const o = d.orig;
    let next: Rect;

    if (d.mode === 'move') {
      next = clampRect({ ...o, x: o.x + dx, y: o.y + dy }, W, H);
    } else if (d.mode === 'new') {
      next = applyRatio(norm(d.sx, d.sy, p.x, p.y), ratio, W, H);
    } else {
      let { x, y, w, h } = o;
      if (d.mode.includes('w')) { x = o.x + dx; w = o.w - dx; }
      if (d.mode.includes('e')) { w = o.w + dx; }
      if (d.mode.includes('n')) { y = o.y + dy; h = o.h - dy; }
      if (d.mode.includes('s')) { h = o.h + dy; }
      next = applyRatio(norm(x, y, x + w, y + h), ratio, W, H);
    }
    setSel(next);
  };

  const onPointerUp = () => {
    dragRef.current = null;
    // Un clic suelto no debe dejar una seleccion invisible de 0 px.
    setSel((s) => (s.w < 2 || s.h < 2 ? clampRect({ x: size.w * 0.1, y: size.h * 0.1, w: size.w * 0.8, h: size.h * 0.8 }, size.w, size.h) : s));
  };

  const setRatioAndFit = (v: number | null) => {
    setRatio(v);
    if (v) setSel((s) => applyRatio(s, v, size.w, size.h));
  };

  const setField = (k: keyof Rect, v: number) => setSel((s) => clampRect({ ...s, [k]: v }, size.w, size.h));

  /* ---------- salida ---------- */

  const cropCanvas = (): HTMLCanvasElement | null => {
    const img = imgRef.current;
    if (!img || sel.w < 1 || sel.h < 1) return null;
    const c = document.createElement('canvas');
    c.width = Math.round(sel.w);
    c.height = Math.round(sel.h);
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    // JPG no tiene alfa: sin fondo, las zonas transparentes saldrian negras.
    if (format === 'jpeg') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.drawImage(img, Math.round(sel.x), Math.round(sel.y), c.width, c.height, 0, 0, c.width, c.height);
    return c;
  };

  const toBlob = (c: HTMLCanvasElement, type: string): Promise<Blob> =>
    new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), type, 0.92));

  const download = async () => {
    const c = cropCanvas();
    if (!c) return;
    const blob = await toBlob(c, `image/${format}`);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/\.[^.]+$/, '') || 'image'}-${c.width}x${c.height}.${format === 'jpeg' ? 'jpg' : format}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const copy = async () => {
    const c = cropCanvas();
    if (!c) return;
    try {
      // El portapapeles solo admite PNG de forma fiable.
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': await toBlob(c, 'image/png') })]);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    setTimeout(() => setCopied('idle'), 2000);
  };

  const cursor = dragRef.current
    ? undefined
    : hover === 'move'
      ? 'move'
      : hover && hover !== 'new'
        ? CURSORS[hover as Handle]
        : 'crosshair';

  return (
    <div className="space-y-4">
      <div
        className="card cursor-pointer text-center"
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) void loadFile(f);
        }}
      >
        <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
          {t('t.imageCrop.drop', 'Drop an image, paste a screenshot, or click to choose')}
        </p>
        {ready && (
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--color-fg)' }}>
            {name} · {size.w}×{size.h}
          </p>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void loadFile(f);
          e.target.value = '';
        }}
      />

      {ready && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="label" style={{ marginBottom: 0, minWidth: 92 }}>
              {t('t.imageCrop.ratio', 'Aspect ratio')}
            </span>
            {RATIOS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`btn ${ratio === r.value ? 'btn-primary' : ''}`}
                aria-pressed={ratio === r.value}
                onClick={() => setRatioAndFit(r.value)}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
              >
                {t(`t.imageCrop.ratio.${r.id}`, r.id)}
              </button>
            ))}
          </div>

          <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            {t('t.imageCrop.hint', 'Drag to select, drag inside to move, or pull the handles to adjust.')}
          </p>

          <div className="card" style={{ padding: '0.75rem', overflow: 'auto' }}>
            <canvas
              ref={canvasRef}
              width={size.w}
              height={size.h}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={() => !dragRef.current && setHover(null)}
              style={{
                display: 'block',
                maxWidth: '100%',
                height: 'auto',
                margin: '0 auto',
                touchAction: 'none',
                cursor,
                border: '2px solid var(--color-border-strong)',
                background: '#fff',
              }}
            />
          </div>

          <div className="card">
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))' }}>
              {(['x', 'y', 'w', 'h'] as (keyof Rect)[]).map((k) => (
                <div key={k}>
                  <label className="label" htmlFor={`crop-${k}`}>
                    {t(`t.imageCrop.${k}`, k.toUpperCase())}
                  </label>
                  <input
                    id={`crop-${k}`}
                    type="number"
                    min={0}
                    value={Math.round(sel[k])}
                    onChange={(e) => setField(k, Number(e.target.value))}
                    style={{ fontFamily: 'var(--font-mono, monospace)' }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="label" style={{ marginBottom: 0 }}>
                {t('t.imageCrop.output', 'Output')}
              </span>
              <span className="font-mono text-sm" style={{ fontWeight: 700 }}>
                {Math.round(sel.w)}×{Math.round(sel.h)}
              </span>
              <span style={{ flex: 1 }} />
              {(['png', 'jpeg', 'webp'] as Format[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`btn ${format === f ? 'btn-primary' : ''}`}
                  aria-pressed={format === f}
                  onClick={() => setFormat(f)}
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                >
                  {f === 'jpeg' ? 'JPG' : f.toUpperCase()}
                </button>
              ))}
              <button type="button" className="btn" onClick={() => void copy()}>
                {copied === 'ok'
                  ? t('t.imageCrop.copied', 'Copied')
                  : copied === 'fail'
                    ? t('t.imageCrop.copyFail', 'Copy failed')
                    : t('t.imageCrop.copy', 'Copy')}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => void download()}>
                {t('t.imageCrop.download', 'Download')}
              </button>
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Normaliza dos esquinas en un rect de ancho/alto positivos. */
function norm(x1: number, y1: number, x2: number, y2: number): Rect {
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

function handleCenter(h: Handle, r: Rect): [number, number] {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const l = r.x;
  const t = r.y;
  const rt = r.x + r.w;
  const b = r.y + r.h;
  const map: Record<Handle, [number, number]> = {
    nw: [l, t], n: [cx, t], ne: [rt, t], e: [rt, cy], se: [rt, b], s: [cx, b], sw: [l, b], w: [l, cy],
  };
  return map[h];
}
