import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import type { EditOp, SessionSummary } from '~/lib/imageEditStore';
import { clearSessions, deleteSession, getSession, listSessions, saveSession } from '~/lib/imageEditStore';
import { applyOps, canvasToBlob, makeThumb, renderFull } from '~/lib/imageRedact';

interface Props {
  dict: Dict;
}

type Tool = 'box' | 'ellipse' | 'polygon' | 'arrow' | 'pixelate' | 'blur' | 'text';
type Format = 'png' | 'jpeg';
type Point = [number, number];

const TOOLS: readonly Tool[] = ['box', 'ellipse', 'polygon', 'arrow', 'pixelate', 'blur', 'text'];
const SHAPES: readonly Tool[] = ['box', 'ellipse', 'polygon'];
const COLORS = ['#000000', '#ffffff', '#ff2d2d', '#ffd400', '#0a7cff'];

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `s_${Date.now()}_${Math.round(Math.random() * 1e6)}`;

/** Luminancia aproximada: decide el fondo del campo flotante segun el color elegido. */
const isLight = (hex: string): boolean => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

export default function ImageRedactTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bakedRef = useRef<HTMLCanvasElement | null>(null); // base + ops ya aplicadas
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [size, setSize] = useState({ w: 0, h: 0 });
  // ops y redo viven juntos: hacerlo en dos setState encadenados duplicaba
  // entradas en StrictMode al re-ejecutar el updater.
  const [hist, setHist] = useState<{ ops: EditOp[]; redo: EditOp[] }>({ ops: [], redo: [] });
  const [tool, setTool] = useState<Tool>('box');
  const [color, setColor] = useState(COLORS[0]);
  const [fill, setFill] = useState(true);
  const [stroke, setStroke] = useState(6);
  const [strength, setStrength] = useState(14);
  const [fontSize, setFontSize] = useState(32);
  const [poly, setPoly] = useState<Point[]>([]);
  const [editing, setEditing] = useState<{ ix: number; iy: number; left: number; top: number } | null>(null);
  const [draft, setDraft] = useState('');
  const [format, setFormat] = useState<Format>('png');
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  const ops = hist.ops;
  const t = (k: string, fb: string) => pick(dict, k as Parameters<typeof pick>[1], fb);

  /* ---------- historial de edicion ---------- */

  const pushOp = useCallback((op: EditOp) => setHist((h) => ({ ops: [...h.ops, op], redo: [] })), []);
  const undo = useCallback(
    () => setHist((h) => (h.ops.length ? { ops: h.ops.slice(0, -1), redo: [h.ops[h.ops.length - 1], ...h.redo] } : h)),
    [],
  );
  const redo = useCallback(() => setHist((h) => (h.redo.length ? { ops: [...h.ops, h.redo[0]], redo: h.redo.slice(1) } : h)), []);

  /* ---------- sesiones guardadas ---------- */

  const refreshHistory = useCallback(async () => {
    const list = await listSessions();
    setSessions(list);
    setThumbs((prev) => {
      Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
      const next: Record<string, string> = {};
      for (const s of list) next[s.id] = URL.createObjectURL(s.thumb);
      return next;
    });
  }, []);

  useEffect(() => {
    void refreshHistory();
    return () => setThumbs((prev) => (Object.values(prev).forEach((u) => URL.revokeObjectURL(u)), {}));
  }, [refreshHistory]);

  /* ---------- pintado ---------- */

  // Re-hornea base + ops una sola vez por cambio; arrastrar solo copia el cache.
  const bake = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    bakedRef.current = renderFull(img, size.w, size.h, ops);
    canvas.getContext('2d')?.drawImage(bakedRef.current, 0, 0);
  }, [ops, size.w, size.h]);

  useEffect(() => {
    if (ready) bake();
  }, [ready, bake]);

  /** Dibuja sobre el cache el trazo que aun no se ha confirmado. */
  const preview = useCallback(
    (build: (ctx: CanvasRenderingContext2D) => void) => {
      const canvas = canvasRef.current;
      const baked = bakedRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !baked || !ctx) return;
      ctx.drawImage(baked, 0, 0);
      build(ctx);
    },
    [],
  );

  const previewDrag = (r: { x: number; y: number; w: number; h: number }) =>
    preview((ctx) => {
      // Se previsualiza el efecto real, no un rectangulo punteado generico.
      if (tool === 'box') applyOps(ctx, [{ k: 'box', ...r, color, fill, width: stroke }]);
      else if (tool === 'ellipse') applyOps(ctx, [{ k: 'ellipse', ...r, color, fill, width: stroke }]);
      else if (tool === 'arrow') applyOps(ctx, [{ k: 'arrow', x1: r.x, y1: r.y, x2: r.x + r.w, y2: r.y + r.h, color, width: stroke }]);
      else if (tool === 'pixelate') applyOps(ctx, [{ k: 'pixelate', ...r, size: strength }]);
      else if (tool === 'blur') applyOps(ctx, [{ k: 'blur', ...r, radius: strength }]);
      if (tool !== 'arrow') {
        ctx.save();
        ctx.strokeStyle = '#0a7cff';
        ctx.lineWidth = Math.max(1, size.w / 500);
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        ctx.restore();
      }
    });

  // Polilinea en curso + puntos, para saber donde vas a cerrar.
  useEffect(() => {
    if (!ready || tool !== 'polygon') return;
    preview((ctx) => {
      if (!poly.length) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, stroke);
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (const [x, y] of poly.slice(1)) ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#0a7cff';
      for (const [x, y] of poly) {
        ctx.beginPath();
        ctx.arc(x, y, Math.max(3, size.w / 220), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }, [poly, tool, ready, color, stroke, size.w, preview]);

  /* ---------- carga ---------- */

  const loadFile = useCallback(
    async (f: File | Blob, fileName?: string) => {
      if (!f.type.startsWith('image/')) return;
      setError('');
      const url = URL.createObjectURL(f);
      try {
        const img = await loadImage(url);
        imgRef.current = img;
        setSize({ w: img.naturalWidth, h: img.naturalHeight });
        setName(fileName || (f as File).name || 'image');
        setHist({ ops: [], redo: [] });
        setPoly([]);
        setEditing(null);
        setSessionId(newId());
        setReady(true);
      } catch {
        setError(t('t.imageRedact.error', 'Could not open this image.'));
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    [dict],
  );

  // Pegar desde el portapapeles (captura de pantalla -> Ctrl/Cmd+V).
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (editing) return; // si estas escribiendo, pegar es del input
      const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith('image/'));
      const f = item?.getAsFile();
      if (f) void loadFile(f, 'pasted');
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadFile, editing]);

  /* ---------- atajos de teclado ---------- */

  const closePolygon = useCallback(() => {
    setPoly((p) => {
      if (p.length >= 3) pushOp({ k: 'polygon', points: p, color, fill, width: stroke });
      return [];
    });
  }, [pushOp, color, fill, stroke]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (e.key === 'Escape') {
        setPoly([]);
        setEditing(null);
        return;
      }
      if (typing) return; // dentro de un input, Ctrl+Z es del navegador
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) {
        if (e.key === 'Enter' && poly.length >= 3) {
          e.preventDefault();
          closePolygon();
        }
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((k === 'z' && e.shiftKey) || k === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, poly.length, closePolygon]);

  /* ---------- interaccion con el lienzo ---------- */

  const toImageCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, sx: 1 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      sx: rect.width / canvas.width,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ready) return;
    const p = toImageCoords(e);

    if (tool === 'text') {
      // El input flota justo donde has hecho clic: escribes sobre la imagen.
      setDraft('');
      setEditing({ ix: p.x, iy: p.y, left: p.x * p.sx, top: p.y * p.sx });
      return;
    }

    if (tool === 'polygon') {
      setPoly((prev) => {
        // Clic cerca del primer punto = cerrar el poligono.
        if (prev.length >= 3) {
          const [fx, fy] = prev[0];
          if (Math.hypot(p.x - fx, p.y - fy) < Math.max(10, size.w / 60)) {
            pushOp({ k: 'polygon', points: prev, color, fill, width: stroke });
            return [];
          }
        }
        return [...prev, [p.x, p.y] as Point];
      });
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: p.x, y: p.y, w: 0, h: 0 };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const p = toImageCoords(e);
    dragRef.current = { ...dragRef.current, w: p.x - dragRef.current.x, h: p.y - dragRef.current.y };
    previewDrag(dragRef.current);
  };

  const onPointerUp = () => {
    const r = dragRef.current;
    dragRef.current = null;
    if (!r) return;
    const tiny = Math.abs(r.w) < 3 && Math.abs(r.h) < 3;
    if (tiny) return bake();
    if (tool === 'box') pushOp({ k: 'box', ...r, color, fill, width: stroke });
    else if (tool === 'ellipse') pushOp({ k: 'ellipse', ...r, color, fill, width: stroke });
    else if (tool === 'arrow') pushOp({ k: 'arrow', x1: r.x, y1: r.y, x2: r.x + r.w, y2: r.y + r.h, color, width: stroke });
    else if (tool === 'pixelate') pushOp({ k: 'pixelate', ...r, size: strength });
    else if (tool === 'blur') pushOp({ k: 'blur', ...r, radius: strength });
  };

  const commitText = () => {
    if (editing && draft.trim()) pushOp({ k: 'text', x: editing.ix, y: editing.iy, text: draft.trim(), color, size: fontSize });
    setEditing(null);
    setDraft('');
  };

  useEffect(() => {
    if (editing) textInputRef.current?.focus();
  }, [editing]);

  /* ---------- guardado local ---------- */

  useEffect(() => {
    if (!ready || !ops.length || !sessionId) return;
    const id = setTimeout(async () => {
      const img = imgRef.current;
      if (!img) return;
      const full = renderFull(img, size.w, size.h, ops);
      // Se persiste el PNG ya aplanado, nunca los pixeles originales.
      await saveSession({
        id: sessionId,
        name,
        ts: Date.now(),
        width: size.w,
        height: size.h,
        result: await canvasToBlob(full, 'image/png'),
        thumb: await makeThumb(full),
      });
      void refreshHistory();
    }, 900);
    return () => clearTimeout(id);
  }, [ready, ops, sessionId, name, size.w, size.h, refreshHistory]);

  // Se reabre sobre la imagen ya censurada: no hay original que restaurar, asi
  // que las censuras previas quedan fijadas y encima se sigue anotando.
  const restore = async (id: string) => {
    const s = await getSession(id);
    if (!s) return;
    const url = URL.createObjectURL(s.result);
    try {
      const img = await loadImage(url);
      imgRef.current = img;
      setSize({ w: s.width, h: s.height });
      setName(s.name);
      setHist({ ops: [], redo: [] });
      setPoly([]);
      setEditing(null);
      setSessionId(s.id);
      setReady(true);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const removeSession = async (id: string) => {
    await deleteSession(id);
    void refreshHistory();
  };

  const wipe = async () => {
    await clearSessions();
    void refreshHistory();
  };

  /* ---------- salida ---------- */

  const exportCanvas = () => renderFull(imgRef.current as HTMLImageElement, size.w, size.h, ops);

  const download = async () => {
    if (!imgRef.current) return;
    const blob = await canvasToBlob(exportCanvas(), `image/${format}`);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/\.[^.]+$/, '') || 'image'}-redacted.${format === 'jpeg' ? 'jpg' : 'png'}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const copy = async () => {
    if (!imgRef.current) return;
    try {
      // El portapapeles solo acepta PNG de forma fiable, aunque exportes JPG.
      const blob = await canvasToBlob(exportCanvas(), 'image/png');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    setTimeout(() => setCopied('idle'), 2000);
  };

  const needsStrength = tool === 'pixelate' || tool === 'blur';
  const isShape = SHAPES.includes(tool);
  const showStroke = tool === 'arrow' || (isShape && !fill);

  const hint =
    tool === 'text'
      ? t('t.imageRedact.hintText', 'Click on the image and type right there. Enter to place it.')
      : tool === 'polygon'
        ? t('t.imageRedact.hintPolygon', 'Click to add corners. Close it by clicking the first point or pressing Enter.')
        : tool === 'arrow'
          ? t('t.imageRedact.hintArrow', 'Drag from the tail to the tip of the arrow.')
          : t('t.imageRedact.hintDrag', 'Drag over the area you want to cover.');

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
          {t('t.imageRedact.drop', 'Drop an image, paste a screenshot, or click to choose')}
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
            {TOOLS.map((k) => (
              <button
                key={k}
                type="button"
                className={`btn ${tool === k ? 'btn-primary' : ''}`}
                aria-pressed={tool === k}
                onClick={() => {
                  setPoly([]);
                  setEditing(null);
                  setTool(k);
                }}
                style={{ padding: '0.4rem 0.7rem' }}
              >
                {t(`t.imageRedact.tool.${k}`, k)}
              </button>
            ))}
          </div>

          <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            {hint}
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span className="label">{t('t.imageRedact.color', 'Color')}</span>
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    aria-pressed={color === c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      background: c,
                      border: `2px solid ${color === c ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>

            {isShape && (
              <div>
                <span className="label">{t('t.imageRedact.style', 'Style')}</span>
                <div className="flex items-center gap-2">
                  <button type="button" className={`btn ${fill ? 'btn-primary' : ''}`} aria-pressed={fill} onClick={() => setFill(true)} style={{ padding: '0.35rem 0.6rem' }}>
                    {t('t.imageRedact.filled', 'Filled')}
                  </button>
                  <button type="button" className={`btn ${!fill ? 'btn-primary' : ''}`} aria-pressed={!fill} onClick={() => setFill(false)} style={{ padding: '0.35rem 0.6rem' }}>
                    {t('t.imageRedact.outline', 'Outline')}
                  </button>
                </div>
              </div>
            )}

            {showStroke && (
              <div>
                <label className="label" htmlFor="stroke">
                  {t('t.imageRedact.stroke', 'Line width')}
                </label>
                <input id="stroke" type="range" min={1} max={40} value={stroke} onChange={(e) => setStroke(Number(e.target.value))} />
              </div>
            )}

            {needsStrength && (
              <div>
                <label className="label" htmlFor="strength">
                  {tool === 'pixelate' ? t('t.imageRedact.blockSize', 'Block size') : t('t.imageRedact.radius', 'Blur radius')}
                </label>
                <input id="strength" type="range" min={4} max={60} value={strength} onChange={(e) => setStrength(Number(e.target.value))} />
              </div>
            )}

            {tool === 'text' && (
              <div>
                <label className="label" htmlFor="fs">
                  {t('t.imageRedact.fontSize', 'Font size')}
                </label>
                <input id="fs" type="range" min={12} max={160} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '0.75rem', overflow: 'auto' }}>
            <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
              <canvas
                ref={canvasRef}
                width={size.w}
                height={size.h}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onDoubleClick={() => poly.length >= 3 && closePolygon()}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  height: 'auto',
                  touchAction: 'none',
                  cursor: tool === 'text' ? 'text' : 'crosshair',
                  border: '2px solid var(--color-border-strong)',
                  background: '#fff',
                }}
              />
              {editing && (
                <div style={{ position: 'absolute', left: editing.left, top: editing.top, zIndex: 5 }}>
                  {/* Sin esta etiqueta el campo aparecia y desaparecia sin explicar que hacer. */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      marginBottom: 4,
                      whiteSpace: 'nowrap',
                      background: '#0a7cff',
                      color: '#fff',
                      fontFamily: 'ui-monospace, Menlo, monospace',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 6px',
                    }}
                  >
                    {t('t.imageRedact.textBadge', 'Type · Enter to place · Esc to cancel')}
                  </span>
                  <input
                    ref={textInputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitText();
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        setDraft('');
                        setEditing(null);
                      }
                    }}
                    onBlur={commitText}
                    placeholder={t('t.imageRedact.textPlaceholder', 'e.g. CONFIDENTIAL')}
                    style={{
                      // `width` explicito: la regla global `input { width: 100% }` estiraba
                      // el campo a todo el lienzo y no parecia un campo de texto.
                      width: `${Math.max(9, draft.length + 2)}ch`,
                      minWidth: 90,
                      padding: '0 4px',
                      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                      fontWeight: 700,
                      // Escalado como el lienzo: lo que escribes ya es la vista previa real.
                      fontSize: Math.max(11, fontSize * (canvasRef.current ? canvasRef.current.getBoundingClientRect().width / size.w : 1)),
                      lineHeight: 1.15,
                      color,
                      caretColor: color,
                      // El fondo contrasta con el color elegido: en negro sobre negro no se veia nada.
                      background: isLight(color) ? 'rgba(0,0,0,0.62)' : 'rgba(255,255,255,0.85)',
                      border: '2px dashed #0a7cff',
                      borderRadius: 0,
                      outline: 'none',
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn" onClick={undo} disabled={!ops.length} title="Ctrl/⌘ + Z">
              {t('t.imageRedact.undo', 'Undo')}
            </button>
            <button type="button" className="btn" onClick={redo} disabled={!hist.redo.length} title="Ctrl/⌘ + Shift + Z">
              {t('t.imageRedact.redo', 'Redo')}
            </button>
            <button type="button" className="btn" onClick={() => setHist({ ops: [], redo: [] })} disabled={!ops.length}>
              {t('t.imageRedact.reset', 'Clear edits')}
            </button>
            <span className="flex-1" />
            {(['png', 'jpeg'] as Format[]).map((f) => (
              <button key={f} type="button" className={`btn ${format === f ? 'btn-primary' : ''}`} aria-pressed={format === f} onClick={() => setFormat(f)} style={{ padding: '0.4rem 0.7rem' }}>
                {f === 'jpeg' ? 'JPG' : 'PNG'}
              </button>
            ))}
            <button type="button" className="btn" onClick={() => void copy()}>
              {copied === 'ok'
                ? t('t.imageRedact.copied', 'Copied')
                : copied === 'fail'
                  ? t('t.imageRedact.copyFail', 'Copy failed')
                  : t('t.imageRedact.copy', 'Copy image')}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void download()}>
              {t('t.imageRedact.download', 'Download')}
            </button>
          </div>

          <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            {t('t.imageRedact.shortcuts', 'Shortcuts: Ctrl/⌘+Z undo · Ctrl/⌘+Shift+Z redo · Esc cancel · Ctrl/⌘+V paste a screenshot')}
          </p>

          <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            {t('t.imageRedact.safety', 'The exported file is flattened: covered pixels are gone, not hidden under a layer. A solid box is the only edit that cannot be reversed — pixelation and blur can sometimes be partly recovered from text.')}
          </p>
        </>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}

      <div className="card">
        <div className="flex items-center justify-between gap-2">
          <span className="label" style={{ marginBottom: 0 }}>
            {t('t.imageRedact.history', 'Saved on this device')}
          </span>
          {sessions.length > 0 && (
            <button type="button" className="btn" onClick={() => void wipe()} style={{ padding: '0.3rem 0.6rem' }}>
              {t('t.imageRedact.clearAll', 'Delete all')}
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <p className="mt-2 font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            {t('t.imageRedact.historyEmpty', 'Your edits are saved here automatically so you can pick them up later.')}
          </p>
        ) : (
          <>
            <ul className="mt-3 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', listStyle: 'none', padding: 0 }}>
              {sessions.map((s) => (
                <li key={s.id} style={{ border: '2px solid var(--color-border-strong)', padding: 6 }}>
                  {thumbs[s.id] && <img alt="" src={thumbs[s.id]} style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />}
                  <p className="mt-1 truncate font-mono text-xs" title={s.name}>
                    {s.name}
                  </p>
                  <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                    {s.width}×{s.height}
                  </p>
                  <div className="mt-1 flex gap-1">
                    <button type="button" className="btn" onClick={() => void restore(s.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', flex: 1 }}>
                      {t('t.imageRedact.restore', 'Open')}
                    </button>
                    <button type="button" className="btn" onClick={() => void removeSession(s.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>
                      {t('t.imageRedact.delete', 'Delete')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
              {t('t.imageRedact.storageNote', 'Saved sessions keep the untouched original so you can keep editing — they stay in this browser on this device and are never uploaded. Use “Delete all” on a shared computer.')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
