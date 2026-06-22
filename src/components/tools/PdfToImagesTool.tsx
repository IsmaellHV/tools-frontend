import { useRef, useState } from 'react';
import JSZip from 'jszip';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import { renderPdfThumbs, renderPdfPageImages } from '~/lib/pdfPreview';

interface Props {
  dict: Dict;
}

type Format = 'png' | 'jpeg';
const THUMB_CAP = 100;

const triggerDownload = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export default function PdfToImagesTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [format, setFormat] = useState<Format>('png');
  const [rendering, setRendering] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const baseName = () => (file ? file.name.replace(/\.pdf$/i, '') : 'page');
  const ext = () => (format === 'jpeg' ? 'jpg' : 'png');

  const loadFile = async (f: File) => {
    setError('');
    setThumbs([]);
    setTotal(0);
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return;
    setFile(f);
    setRendering(true);
    try {
      const buf = await f.arrayBuffer();
      const { total, thumbs } = await renderPdfThumbs(buf, { width: 150, max: THUMB_CAP });
      setTotal(total);
      setThumbs(thumbs);
    } catch {
      setFile(null);
      setError(pick(dict, 't.pdfToImages.error', 'Could not read this PDF.'));
    } finally {
      setRendering(false);
    }
  };

  const downloadPage = async (n: number) => {
    if (!file) return;
    setWorking(true);
    setError('');
    try {
      const { pages } = await renderPdfPageImages(await file.arrayBuffer(), { format, pages: [n] });
      if (pages[0]) {
        triggerDownload(pages[0].blob, `${baseName()}_p${n}.${ext()}`);
        URL.revokeObjectURL(pages[0].url);
      }
    } catch {
      setError(pick(dict, 't.pdfToImages.error', 'Could not read this PDF.'));
    } finally {
      setWorking(false);
    }
  };

  const downloadAll = async () => {
    if (!file) return;
    setWorking(true);
    setError('');
    try {
      const { pages } = await renderPdfPageImages(await file.arrayBuffer(), { format, max: THUMB_CAP });
      const zip = new JSZip();
      const pad = String(total).length;
      for (const p of pages) {
        zip.file(`${baseName()}_p${String(p.page).padStart(pad, '0')}.${ext()}`, p.blob);
        URL.revokeObjectURL(p.url);
      }
      const out = await zip.generateAsync({ type: 'blob' });
      triggerDownload(out, `${baseName()}_images.zip`);
    } catch {
      setError(pick(dict, 't.pdfToImages.error', 'Could not read this PDF.'));
    } finally {
      setWorking(false);
    }
  };

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
          {pick(dict, 't.pdfToImages.drop', 'Drop a PDF here or click to choose')}
        </p>
        {file && total > 0 && (
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--color-fg)' }}>
            {file.name} · {total} {pick(dict, 't.pdfToImages.total', 'total pages')}
          </p>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadFile(f);
          e.target.value = '';
        }}
      />

      {rendering && (
        <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
          // {pick(dict, 't.pdfToImages.rendering', 'Rendering pages…')}
        </p>
      )}

      {thumbs.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="label" style={{ marginBottom: 0 }}>
                {pick(dict, 't.pdfToImages.format', 'Format')}
              </span>
              <button type="button" className={`btn ${format === 'png' ? 'btn-primary' : ''}`} aria-pressed={format === 'png'} onClick={() => setFormat('png')} style={{ padding: '0.4rem 0.7rem' }}>
                PNG
              </button>
              <button type="button" className={`btn ${format === 'jpeg' ? 'btn-primary' : ''}`} aria-pressed={format === 'jpeg'} onClick={() => setFormat('jpeg')} style={{ padding: '0.4rem 0.7rem' }}>
                JPG
              </button>
            </div>
            <button type="button" className="btn btn-primary" onClick={downloadAll} disabled={working}>
              {working ? pick(dict, 't.pdfToImages.working', 'Working…') : pick(dict, 't.pdfToImages.downloadAll', 'Download all (ZIP)')}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
            {thumbs.map((src, idx) => {
              const p = idx + 1;
              return (
                <div key={p} className="card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img alt={`${pick(dict, 't.pdfToImages.page', 'Page')} ${p}`} src={src} style={{ maxWidth: '100%', maxHeight: 130, border: '2px solid var(--color-border-strong)', background: '#fff' }} />
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                    {pick(dict, 't.pdfToImages.page', 'Page')} {p}
                  </span>
                  <button type="button" className="btn" onClick={() => downloadPage(p)} disabled={working} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', width: '100%' }}>
                    {pick(dict, 't.pdfToImages.downloadPage', 'Download')} {ext().toUpperCase()}
                  </button>
                </div>
              );
            })}
          </div>

          {total > thumbs.length && (
            <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
              // +{total - thumbs.length}
            </p>
          )}
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
