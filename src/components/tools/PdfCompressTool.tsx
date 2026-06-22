import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import { renderFirstPage, renderPdfPageImages } from '~/lib/pdfPreview';

interface Props {
  dict: Dict;
}

type Res = 'low' | 'med' | 'high';
const SCALE: Record<Res, number> = { low: 1, med: 1.5, high: 2 };
const PAGE_CAP = 500;

const downloadBlob = (bytes: Uint8Array, name: string) => {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const fmtSize = (b: number): string => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};

export default function PdfCompressTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);
  const [origSize, setOrigSize] = useState(0);
  const [preview, setPreview] = useState('');
  const [quality, setQuality] = useState(0.6);
  const [res, setRes] = useState<Res>('med');
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [bigger, setBigger] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const loadFile = async (f: File) => {
    setError('');
    setResultSize(null);
    setBigger(false);
    setPreview('');
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return;
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      setFile(f);
      setTotal(doc.getPageCount());
      setOrigSize(f.size);
      try {
        const url = await renderFirstPage(buf, 180);
        if (url) setPreview(url);
      } catch {
        setPreview('');
      }
    } catch {
      setFile(null);
      setTotal(0);
      setError(pick(dict, 't.pdfCompress.error', 'Could not read this PDF.'));
    }
  };

  const compress = async () => {
    if (!file) return;
    setWorking(true);
    setError('');
    setResultSize(null);
    setBigger(false);
    try {
      const buf = await file.arrayBuffer();
      // Tamaños originales de página (en puntos) para no agrandar el documento.
      const src = await PDFDocument.load(buf);
      const sizes = src.getPages().map((p) => p.getSize());
      // Rasteriza cada página a JPEG comprimido.
      const { pages } = await renderPdfPageImages(buf, { format: 'jpeg', quality, scale: SCALE[res], max: PAGE_CAP });
      const out = await PDFDocument.create();
      for (let i = 0; i < pages.length; i++) {
        const jpg = new Uint8Array(await pages[i].blob.arrayBuffer());
        const img = await out.embedJpg(jpg);
        const size = sizes[i] ?? { width: img.width, height: img.height };
        const page = out.addPage([size.width, size.height]);
        page.drawImage(img, { x: 0, y: 0, width: size.width, height: size.height });
        URL.revokeObjectURL(pages[i].url);
      }
      const bytes = await out.save();
      setResultSize(bytes.length);
      if (bytes.length >= origSize) {
        setBigger(true);
      } else {
        const base = file.name.replace(/\.pdf$/i, '');
        downloadBlob(bytes, `${base}_compressed.pdf`);
      }
    } catch {
      setError(pick(dict, 't.pdfCompress.error', 'Could not read this PDF.'));
    } finally {
      setWorking(false);
    }
  };

  const pct = resultSize && origSize ? Math.round((1 - resultSize / origSize) * 100) : 0;

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
          {pick(dict, 't.pdfCompress.drop', 'Drop a PDF here or click to choose')}
        </p>
        {file && total > 0 && (
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--color-fg)' }}>
            {file.name} · {total} {pick(dict, 't.pdfCompress.total', 'total pages')} · {fmtSize(origSize)}
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

      {file && total > 0 && (
        <>
          <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            // {pick(dict, 't.pdfCompress.note', 'Text and vectors are rasterized — best for scanned PDFs.')}
          </p>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
            {preview && (
              <img alt="" src={preview} style={{ maxWidth: 130, maxHeight: 170, border: '2px solid var(--color-border-strong)', background: '#fff' }} />
            )}
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="q">
                  {pick(dict, 't.pdfCompress.quality', 'Quality')}: {Math.round(quality * 100)}%
                </label>
                <input id="q" type="range" min={30} max={90} step={5} value={Math.round(quality * 100)} onChange={(e) => setQuality(Number(e.target.value) / 100)} style={{ padding: 0 }} />
              </div>
              <div>
                <label className="label">{pick(dict, 't.pdfCompress.resolution', 'Resolution')}</label>
                <div className="flex flex-wrap gap-2">
                  {(['low', 'med', 'high'] as Res[]).map((r) => (
                    <button key={r} type="button" className={`btn ${res === r ? 'btn-primary' : ''}`} aria-pressed={res === r} onClick={() => setRes(r)} style={{ padding: '0.4rem 0.7rem' }}>
                      {pick(dict, `t.pdfCompress.res${r === 'low' ? 'Low' : r === 'med' ? 'Med' : 'High'}` as never, r)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {resultSize !== null && (
            <div className="card">
              <p className="font-mono text-sm" style={{ margin: 0 }}>
                {pick(dict, 't.pdfCompress.original', 'Original')}: {fmtSize(origSize)} → {pick(dict, 't.pdfCompress.result', 'Result')}: {fmtSize(resultSize)}{' '}
                {!bigger && (
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                    ({pct}% {pick(dict, 't.pdfCompress.saved', 'saved')})
                  </span>
                )}
              </p>
              {bigger && (
                <p className="text-sm" style={{ color: 'var(--color-accent-2)', marginTop: 6 }}>
                  {pick(dict, 't.pdfCompress.bigger', 'Result is larger than the original — compression skipped.')}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}

      <button type="button" className="btn btn-primary" onClick={compress} disabled={!file || working}>
        {working ? pick(dict, 't.pdfCompress.working', 'Compressing…') : pick(dict, 't.pdfCompress.compress', 'Compress & download')}
      </button>
    </div>
  );
}
