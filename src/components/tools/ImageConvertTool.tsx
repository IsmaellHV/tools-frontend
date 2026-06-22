import { useRef, useState } from 'react';
import JSZip from 'jszip';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

interface ImgItem {
  id: number;
  file: File;
  name: string;
  size: number;
  url: string;
}

type Format = 'png' | 'jpeg' | 'webp';
const EXT: Record<Format, string> = { png: 'png', jpeg: 'jpg', webp: 'webp' };

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

const convertOne = async (file: File, format: Format, quality: number): Promise<Blob> => {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ctx');
    ctx.drawImage(img, 0, 0);
    return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), `image/${format}`, quality));
  } finally {
    URL.revokeObjectURL(url);
  }
};

export default function ImageConvertTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const [items, setItems] = useState<ImgItem[]>([]);
  const [format, setFormat] = useState<Format>('webp');
  const [quality, setQuality] = useState(0.85);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const addFiles = (files: FileList | File[]) => {
    setError('');
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imgs.length) return;
    setItems((prev) => [...prev, ...imgs.map((file) => ({ id: idRef.current++, file, name: file.name, size: file.size, url: URL.createObjectURL(file) }))]);
  };

  const remove = (id: number) => {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it) URL.revokeObjectURL(it.url);
      return prev.filter((x) => x.id !== id);
    });
  };

  const baseOf = (name: string) => name.replace(/\.[^.]+$/, '');

  const downloadOne = async (it: ImgItem) => {
    setWorking(true);
    setError('');
    try {
      const blob = await convertOne(it.file, format, quality);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseOf(it.name)}.${EXT[format]}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError(pick(dict, 't.imageConvert.error', 'Could not process an image.'));
    } finally {
      setWorking(false);
    }
  };

  const downloadAll = async () => {
    if (!items.length) return;
    setWorking(true);
    setError('');
    try {
      const zip = new JSZip();
      for (const it of items) {
        const blob = await convertOne(it.file, format, quality);
        zip.file(`${baseOf(it.name)}.${EXT[format]}`, blob);
      }
      const out = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(out);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_${EXT[format]}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError(pick(dict, 't.imageConvert.error', 'Could not process an image.'));
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {items.map((it) => (
            <div key={it.id} className="card" style={{ position: 'relative', padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => remove(it.id)}
                title={pick(dict, 't.imageConvert.remove', 'Remove')}
                aria-label={pick(dict, 't.imageConvert.remove', 'Remove')}
                style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, padding: 0, fontSize: '0.8rem', border: '2px solid var(--color-border-strong)', background: 'var(--color-bg-card)', color: 'var(--color-fg)', cursor: 'pointer', zIndex: 1 }}
              >
                ✕
              </button>
              <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img alt="" src={it.url} style={{ maxWidth: '90%', maxHeight: 130, objectFit: 'contain', border: '2px solid var(--color-border-strong)', background: '#fff' }} />
              </div>
              <p className="text-xs" title={it.name} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {it.name}
              </p>
              <p className="font-mono" style={{ margin: 0, fontSize: '0.65rem', textAlign: 'center', color: 'var(--color-fg-muted)' }}>
                {fmtSize(it.size)}
              </p>
              <button type="button" className="btn" onClick={() => downloadOne(it)} disabled={working} style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem' }}>
                {pick(dict, 't.imageConvert.download', 'Download')} {EXT[format].toUpperCase()}
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="card"
            style={{ minHeight: items.length ? undefined : 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '2px dashed var(--color-border-strong)', background: 'var(--color-bg-raised)', cursor: 'pointer', color: 'var(--color-fg)' }}
          >
            <span style={{ fontSize: '2rem', lineHeight: 1, color: 'var(--color-accent)' }}>+</span>
            <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)', textAlign: 'center', padding: '0 0.4rem' }}>
              {items.length ? pick(dict, 't.imageConvert.addMore', 'Add more') : pick(dict, 't.imageConvert.drop', 'Add images')}
            </span>
          </button>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }} />

      {items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="label" style={{ marginBottom: 0 }}>
              {pick(dict, 't.imageConvert.to', 'Convert to')}
            </span>
            {(['png', 'jpeg', 'webp'] as Format[]).map((f) => (
              <button key={f} type="button" className={`btn ${format === f ? 'btn-primary' : ''}`} aria-pressed={format === f} onClick={() => setFormat(f)} style={{ padding: '0.4rem 0.7rem' }}>
                {EXT[f].toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary" onClick={downloadAll} disabled={working}>
            {working ? pick(dict, 't.imageConvert.working', 'Converting…') : pick(dict, 't.imageConvert.downloadAll', 'Download all (ZIP)')}
          </button>
        </div>
      )}

      {items.length > 0 && format !== 'png' && (
        <div style={{ maxWidth: 320 }}>
          <label className="label" htmlFor="cq">
            {pick(dict, 't.imageConvert.quality', 'Quality')}: {Math.round(quality * 100)}%
          </label>
          <input id="cq" type="range" min={10} max={100} step={1} value={Math.round(quality * 100)} onChange={(e) => setQuality(Number(e.target.value) / 100)} style={{ padding: 0 }} />
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
