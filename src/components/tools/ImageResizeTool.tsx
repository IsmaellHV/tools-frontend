import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

type Format = 'keep' | 'jpeg' | 'png' | 'webp';

const fmtSize = (b: number): string => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

export default function ImageResizeTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [origUrl, setOrigUrl] = useState('');
  const [origSize, setOrigSize] = useState(0);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState<Format>('keep');
  const [result, setResult] = useState<{ url: string; size: number; w: number; h: number } | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const mimeFor = (): string => (format === 'keep' ? file?.type || 'image/png' : `image/${format}`);
  const extFor = (): string => (format === 'keep' ? file?.name.match(/\.([^.]+)$/)?.[1] || 'png' : format === 'jpeg' ? 'jpg' : format);

  const loadFile = async (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setError('');
    setResult(null);
    const url = URL.createObjectURL(f);
    setOrigUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    try {
      const img = await loadImage(url);
      setFile(f);
      setOrigSize(f.size);
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    } catch {
      setError(pick(dict, 't.imageResize.error', 'Could not process this image.'));
    }
  };

  const onWidth = (w: number) => {
    const nw = Math.max(1, w || 1);
    setWidth(nw);
    if (lock && origW) setHeight(Math.max(1, Math.round((nw * origH) / origW)));
  };
  const onHeight = (h: number) => {
    const nh = Math.max(1, h || 1);
    setHeight(nh);
    if (lock && origH) setWidth(Math.max(1, Math.round((nh * origW) / origH)));
  };
  const onPercent = (p: number) => {
    const pct = Math.max(1, p || 1) / 100;
    setWidth(Math.max(1, Math.round(origW * pct)));
    setHeight(Math.max(1, Math.round(origH * pct)));
  };

  const resize = useCallback(async () => {
    if (!file || !origUrl || !width || !height) return;
    setWorking(true);
    setError('');
    try {
      const img = await loadImage(origUrl);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('ctx');
      ctx.drawImage(img, 0, 0, width, height);
      const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), mimeFor(), 0.9));
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url: URL.createObjectURL(blob), size: blob.size, w: width, h: height };
      });
    } catch {
      setError(pick(dict, 't.imageResize.error', 'Could not process this image.'));
    } finally {
      setWorking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, origUrl, width, height, format, dict]);

  useEffect(() => {
    if (!file) return;
    const t = setTimeout(() => void resize(), 150);
    return () => clearTimeout(t);
  }, [file, width, height, format, resize]);

  const download = () => {
    if (!result || !file) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_${result.w}x${result.h}.${extFor()}`;
    a.click();
  };

  const pctNow = origW ? Math.round((width / origW) * 100) : 100;

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
          if (f) loadFile(f);
        }}
      >
        <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
          {pick(dict, 't.imageResize.drop', 'Drop an image here or click to choose')}
        </p>
        {file && (
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--color-fg)' }}>
            {file.name} · {origW}×{origH} · {fmtSize(origSize)}
          </p>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ''; }} />

      {file && origW > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="w">{pick(dict, 't.imageResize.width', 'Width')}</label>
              <input id="w" type="number" min={1} value={width} onChange={(e) => onWidth(Number(e.target.value))} />
            </div>
            <div>
              <label className="label" htmlFor="h">{pick(dict, 't.imageResize.height', 'Height')}</label>
              <input id="h" type="number" min={1} value={height} onChange={(e) => onHeight(Number(e.target.value))} />
            </div>
            <div>
              <label className="label" htmlFor="p">{pick(dict, 't.imageResize.percent', 'Scale')} %</label>
              <input id="p" type="number" min={1} value={pctNow} onChange={(e) => onPercent(Number(e.target.value))} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
            <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} style={{ width: 'auto' }} />
            {pick(dict, 't.imageResize.lock', 'Lock aspect ratio')}
          </label>

          <div className="flex items-center gap-2">
            <span className="label" style={{ marginBottom: 0 }}>{pick(dict, 't.imageResize.format', 'Format')}</span>
            {(['keep', 'jpeg', 'png', 'webp'] as Format[]).map((f) => (
              <button key={f} type="button" className={`btn ${format === f ? 'btn-primary' : ''}`} aria-pressed={format === f} onClick={() => setFormat(f)} style={{ padding: '0.4rem 0.7rem' }}>
                {f === 'keep' ? pick(dict, 't.imageResize.original', 'Original') : f === 'jpeg' ? 'JPG' : f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="label">{pick(dict, 't.imageResize.original', 'Original')}</p>
              {origUrl && <img alt="" src={origUrl} style={{ maxWidth: '100%', maxHeight: 180, border: '2px solid var(--color-border-strong)', background: '#fff' }} />}
              <p className="font-mono text-sm" style={{ marginTop: 6 }}>{origW}×{origH} · {fmtSize(origSize)}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="label">{pick(dict, 't.imageResize.result', 'Result')}</p>
              {result ? (
                <>
                  <img alt="" src={result.url} style={{ maxWidth: '100%', maxHeight: 180, border: '2px solid var(--color-border-strong)', background: '#fff' }} />
                  <p className="font-mono text-sm" style={{ marginTop: 6 }}>{result.w}×{result.h} · {fmtSize(result.size)}</p>
                </>
              ) : (
                <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)', marginTop: 40 }}>{working ? pick(dict, 't.imageResize.working', 'Resizing…') : '—'}</p>
              )}
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}

      <button type="button" className="btn btn-primary" onClick={download} disabled={!result || working}>
        {pick(dict, 't.imageResize.download', 'Download')}
      </button>
    </div>
  );
}
