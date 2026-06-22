import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

type Format = 'jpeg' | 'webp' | 'png';
const EXT: Record<Format, string> = { jpeg: 'jpg', webp: 'webp', png: 'png' };

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

export default function ImageCompressTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [origUrl, setOrigUrl] = useState('');
  const [origSize, setOrigSize] = useState(0);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(0);
  const [format, setFormat] = useState<Format>('jpeg');
  const [result, setResult] = useState<{ url: string; size: number; blob: Blob } | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const loadFile = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setError('');
    setResult(null);
    setFile(f);
    setOrigSize(f.size);
    setOrigUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const compress = useCallback(async () => {
    if (!file || !origUrl) return;
    setWorking(true);
    setError('');
    try {
      const img = await loadImage(origUrl);
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (maxWidth > 0 && w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('ctx');
      ctx.drawImage(img, 0, 0, w, h);
      const mime = `image/${format}`;
      const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), mime, quality));
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url: URL.createObjectURL(blob), size: blob.size, blob };
      });
    } catch {
      setError(pick(dict, 't.imageCompress.error', 'Could not process this image.'));
    } finally {
      setWorking(false);
    }
  }, [file, origUrl, quality, maxWidth, format, dict]);

  // Recalcula (con pequeño debounce) cuando cambia el archivo o cualquier control.
  useEffect(() => {
    if (!file) return;
    const t = setTimeout(() => {
      void compress();
    }, 150);
    return () => clearTimeout(t);
  }, [file, quality, maxWidth, format, compress]);

  const download = () => {
    if (!result || !file) return;
    const base = file.name.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${base}_min.${EXT[format]}`;
    a.click();
  };

  const pct = result && origSize ? Math.round((1 - result.size / origSize) * 100) : 0;
  const smaller = pct >= 0;

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
          {pick(dict, 't.imageCompress.drop', 'Drop an image here or click to choose')}
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadFile(f);
          e.target.value = '';
        }}
      />

      {file && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="q">
                {pick(dict, 't.imageCompress.quality', 'Quality')}: {Math.round(quality * 100)}%
              </label>
              <input id="q" type="range" min={10} max={100} step={1} value={Math.round(quality * 100)} onChange={(e) => setQuality(Number(e.target.value) / 100)} style={{ padding: 0 }} disabled={format === 'png'} />
            </div>
            <div>
              <label className="label" htmlFor="mw">
                {pick(dict, 't.imageCompress.maxWidth', 'Max width')}
              </label>
              <input id="mw" type="number" min={0} value={maxWidth} onChange={(e) => setMaxWidth(Math.max(0, Number(e.target.value) || 0))} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="label" style={{ marginBottom: 0 }}>
              {pick(dict, 't.imageCompress.format', 'Format')}
            </span>
            {(['jpeg', 'webp', 'png'] as Format[]).map((f) => (
              <button key={f} type="button" className={`btn ${format === f ? 'btn-primary' : ''}`} aria-pressed={format === f} onClick={() => setFormat(f)} style={{ padding: '0.4rem 0.7rem' }}>
                {EXT[f].toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="label">{pick(dict, 't.imageCompress.original', 'Original')}</p>
              {origUrl && <img alt="" src={origUrl} style={{ maxWidth: '100%', maxHeight: 200, border: '2px solid var(--color-border-strong)', background: '#fff' }} />}
              <p className="font-mono text-sm" style={{ marginTop: 6 }}>{fmtSize(origSize)}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="label">{pick(dict, 't.imageCompress.compressed', 'Compressed')}</p>
              {result ? (
                <>
                  <img alt="" src={result.url} style={{ maxWidth: '100%', maxHeight: 200, border: '2px solid var(--color-border-strong)', background: '#fff' }} />
                  <p className="font-mono text-sm" style={{ marginTop: 6 }}>
                    {fmtSize(result.size)}{' '}
                    <span style={{ color: smaller ? 'var(--color-accent)' : 'var(--color-accent-2)', fontWeight: 700 }}>
                      ({Math.abs(pct)}% {smaller ? pick(dict, 't.imageCompress.saved', 'saved') : pick(dict, 't.imageCompress.bigger', 'bigger')})
                    </span>
                  </p>
                </>
              ) : (
                <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)', marginTop: 40 }}>
                  {working ? pick(dict, 't.imageCompress.working', 'Compressing…') : '—'}
                </p>
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
        {pick(dict, 't.imageCompress.download', 'Download')} {result ? EXT[format].toUpperCase() : ''}
      </button>
    </div>
  );
}
