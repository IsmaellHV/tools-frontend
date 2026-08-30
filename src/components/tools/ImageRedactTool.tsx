import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import type { EditOp, SessionSummary } from '~/lib/imageEditStore';
import { clearSessions, deleteSession, getSession, listSessions, saveSession } from '~/lib/imageEditStore';
import { applyOps, canvasToBlob, makeThumb, renderFull } from '~/lib/imageRedact';

interface Props {
  dict: Dict;
}

type Tool = 'box' | 'pixelate' | 'blur' | 'text';
type Format = 'png' | 'jpeg';

const COLORS = ['#000000', '#ffffff', '#ff2d2d', '#ffd400', '#0a7cff'];

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `s_${Date.now()}_${Math.round(Math.random() * 1e6)}`;

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
  const blobRef = useRef<Blob | null>(null);
  const dragRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const [name, setName] = useState('');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [ops, setOps] = useState<EditOp[]>([]);
  const [redo, setRedo] = useState<EditOp[]>([]);
  const [tool, setTool] = useState<Tool>('box');
  const [color, setColor] = useState(COLORS[0]);
  const [strength, setStrength] = useState(14);
  const [fontSize, setFontSize] = useState(32);
  const [label, setLabel] = useState('');
  const [format, setFormat] = useState<Format>('png');
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  const t = (k: string, fb: string) => pick(dict, k as Parameters<typeof pick>[1], fb);

  /* ---------- historial ---------- */

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

  // Re-hornea base + ops una sola vez por cambio; el arrastre solo copia el cache.
  const bake = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    bakedRef.current = renderFull(img, size.w, size.h, ops);
    const ctx = canvas.getContext('2d');
    if (ctx && bakedRef.current) ctx.drawImage(bakedRef.current, 0, 0);
  }, [ops, size.w, size.h]);

  useEffect(() => {
    if (ready) bake();
  }, [ready, bake]);

  const paintMarquee = (r: { x: number; y: number; w: number; h: number }) => {
    const canvas = canvasRef.current;
    const baked = bakedRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !baked || !ctx) return;
    ctx.drawImage(baked, 0, 0);
    // Previsualiza el efecto real en vez de un simple rectangulo punteado.
    if (tool === 'box') applyOps(ctx, [{ k: 'box', ...r, color }]);
    else if (tool === 'pixelate') applyOps(ctx, [{ k: 'pixelate', ...r, size: strength }]);
    else if (tool === 'blur') applyOps(ctx, [{ k: 'blur', ...r, radius: strength }]);
    ctx.save();
    ctx.strokeStyle = '#0a7cff';
    ctx.lineWidth = Math.max(1, size.w / 500);
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.restore();
  };

  /* ---------- carga ---------- */

  const loadFile = useCallback(
    async (f: File | Blob, fileName?: string) => {
      if (!f.type.startsWith('image/')) return;
      setError('');
      const url = URL.createObjectURL(f);
      try {
        const img = await loadImage(url);
        imgRef.current = img;
        blobRef.current = f;
        setSize({ w: img.naturalWidth, h: img.naturalHeight });
        setName(fileName || (f as File).name || 'image');
        setOps([]);
        setRedo([]);
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
      const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith('image/'));
      const f = item?.getAsFile();
      if (f) void loadFile(f, 'pasted');
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadFile]);

  /* ---------- interaccion ---------- */

  const toImageCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const pushOp = (op: EditOp) => {
    setOps((prev) => [...prev, op]);
    setRedo([]);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ready) return;
    const p = toImageCoords(e);
    if (tool === 'text') {
      if (!label.trim()) return;
      pushOp({ k: 'text', x: p.x, y: p.y, text: label.trim(), color, size: fontSize });
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: p.x, y: p.y, w: 0, h: 0 };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const p = toImageCoords(e);
    dragRef.current = { ...dragRef.current, w: p.x - dragRef.current.x, h: p.y - dragRef.current.y };
    paintMarquee(dragRef.current);
  };

  const onPointerUp = () => {
    const r = dragRef.current;
    dragRef.current = null;
    if (!r || Math.abs(r.w) < 3 || Math.abs(r.h) < 3) return bake();
    if (tool === 'box') pushOp({ k: 'box', ...r, color });
    else if (tool === 'pixelate') pushOp({ k: 'pixelate', ...r, size: strength });
    else if (tool === 'blur') pushOp({ k: 'blur', ...r, radius: strength });
  };

  const undo = () => {
    setOps((prev) => {
      if (!prev.length) return prev;
      setRedo((r) => [prev[prev.length - 1], ...r]);
      return prev.slice(0, -1);
    });
  };

  const redoOp = () => {
    setRedo((prev) => {
      if (!prev.length) return prev;
      setOps((o) => [...o, prev[0]]);
      return prev.slice(1);
    });
  };

  /* ---------- guardado local ---------- */

  // Autoguardado: solo cuando hay ediciones, para no llenar el historial de originales.
  useEffect(() => {
    if (!ready || !ops.length || !sessionId) return;
    const id = setTimeout(async () => {
      const img = imgRef.current;
      const original = blobRef.current;
      if (!img || !original) return;
      const full = renderFull(img, size.w, size.h, ops);
      await saveSession({ id: sessionId, name, ts: Date.now(), width: size.w, height: size.h, original, thumb: await makeThumb(full), ops });
      void refreshHistory();
    }, 900);
    return () => clearTimeout(id);
  }, [ready, ops, sessionId, name, size.w, size.h, refreshHistory]);

  const restore = async (id: string) => {
    const s = await getSession(id);
    if (!s) return;
    const url = URL.createObjectURL(s.original);
    try {
      const img = await loadImage(url);
      imgRef.current = img;
      blobRef.current = s.original;
      setSize({ w: s.width, h: s.height });
      setName(s.name);
      setOps(s.ops);
      setRedo([]);
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

  const download = async () => {
    const img = imgRef.current;
    if (!img) return;
    const full = renderFull(img, size.w, size.h, ops);
    const blob = await canvasToBlob(full, `image/${format}`);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/\.[^.]+$/, '') || 'image'}-redacted.${format === 'jpeg' ? 'jpg' : 'png'}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const needsSize = tool === 'pixelate' || tool === 'blur';

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
            {(['box', 'pixelate', 'blur', 'text'] as Tool[]).map((k) => (
              <button
                key={k}
                type="button"
                className={`btn ${tool === k ? 'btn-primary' : ''}`}
                aria-pressed={tool === k}
                onClick={() => setTool(k)}
                style={{ padding: '0.4rem 0.7rem' }}
              >
                {t(`t.imageRedact.tool.${k}`, k)}
              </button>
            ))}
          </div>

          <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            {tool === 'text'
              ? t('t.imageRedact.hintText', 'Type your note, then click on the image to place it.')
              : t('t.imageRedact.hintDrag', 'Drag over the area you want to cover.')}
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

            {needsSize && (
              <div>
                <label className="label" htmlFor="strength">
                  {tool === 'pixelate' ? t('t.imageRedact.blockSize', 'Block size') : t('t.imageRedact.radius', 'Blur radius')}
                </label>
                <input id="strength" type="range" min={4} max={60} value={strength} onChange={(e) => setStrength(Number(e.target.value))} />
              </div>
            )}

            {tool === 'text' && (
              <>
                <div>
                  <label className="label" htmlFor="note">
                    {t('t.imageRedact.text', 'Text')}
                  </label>
                  <input id="note" type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('t.imageRedact.textPlaceholder', 'e.g. CONFIDENTIAL')} />
                </div>
                <div>
                  <label className="label" htmlFor="fs">
                    {t('t.imageRedact.fontSize', 'Font size')}
                  </label>
                  <input id="fs" type="range" min={12} max={160} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ padding: '0.75rem', overflow: 'auto' }}>
            <canvas
              ref={canvasRef}
              width={size.w}
              height={size.h}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                display: 'block',
                maxWidth: '100%',
                height: 'auto',
                margin: '0 auto',
                touchAction: 'none',
                cursor: tool === 'text' ? 'text' : 'crosshair',
                border: '2px solid var(--color-border-strong)',
                background: '#fff',
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn" onClick={undo} disabled={!ops.length}>
              {t('t.imageRedact.undo', 'Undo')}
            </button>
            <button type="button" className="btn" onClick={redoOp} disabled={!redo.length}>
              {t('t.imageRedact.redo', 'Redo')}
            </button>
            <button type="button" className="btn" onClick={() => { setOps([]); setRedo([]); }} disabled={!ops.length}>
              {t('t.imageRedact.reset', 'Clear edits')}
            </button>
            <span className="flex-1" />
            {(['png', 'jpeg'] as Format[]).map((f) => (
              <button key={f} type="button" className={`btn ${format === f ? 'btn-primary' : ''}`} aria-pressed={format === f} onClick={() => setFormat(f)} style={{ padding: '0.4rem 0.7rem' }}>
                {f === 'jpeg' ? 'JPG' : 'PNG'}
              </button>
            ))}
            <button type="button" className="btn btn-primary" onClick={() => void download()}>
              {t('t.imageRedact.download', 'Download')}
            </button>
          </div>

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
