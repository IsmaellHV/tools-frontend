import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import { renderPdfThumbs } from '~/lib/pdfPreview';

interface Props {
  dict: Dict;
}

const THUMB_CAP = 60;

const downloadBlob = (bytes: Uint8Array, name: string) => {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export default function PdfSplitTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [thumbsLoading, setThumbsLoading] = useState(false);

  const loadFile = async (f: File) => {
    setError('');
    setThumbs([]);
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return;
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const n = doc.getPageCount();
      setFile(f);
      setTotal(n);
      setFrom(1);
      setTo(n);
      // Render de miniaturas (no bloquea la operación si falla)
      setThumbsLoading(true);
      try {
        const { thumbs } = await renderPdfThumbs(buf, { width: 96, max: THUMB_CAP });
        setThumbs(thumbs);
      } catch {
        setThumbs([]);
      } finally {
        setThumbsLoading(false);
      }
    } catch {
      setFile(null);
      setTotal(0);
      setError(pick(dict, 't.pdfSplit.error', 'Could not read this PDF.'));
    }
  };

  const clamp = (v: number) => Math.min(Math.max(1, v || 1), total || 1);

  // Click en una miniatura: mueve el borde más cercano del rango a esa página.
  const pickPage = (p: number) => {
    if (p < from) setFrom(p);
    else if (p > to) setTo(p);
    else if (p - from <= to - p) setFrom(p);
    else setTo(p);
  };

  const extract = async () => {
    if (!file) return;
    const a = clamp(from);
    const b = clamp(to);
    if (a > b) {
      setError(pick(dict, 't.pdfSplit.invalid', 'Enter a valid page range.'));
      return;
    }
    setError('');
    setWorking(true);
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();
      const indices = [];
      for (let i = a - 1; i <= b - 1; i++) indices.push(i);
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const base = file.name.replace(/\.pdf$/i, '');
      downloadBlob(bytes, `${base}_p${a}-${b}.pdf`);
    } catch {
      setError(pick(dict, 't.pdfSplit.error', 'Could not read this PDF.'));
    } finally {
      setWorking(false);
    }
  };

  const inRange = (p: number) => p >= from && p <= to;

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
          {pick(dict, 't.pdfSplit.drop', 'Drop a PDF here or click to choose')}
        </p>
        {file && (
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--color-fg)' }}>
            {file.name} · {total} {pick(dict, 't.pdfSplit.total', 'total pages')}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="pdf-from">
                {pick(dict, 't.pdfSplit.from', 'From page')}
              </label>
              <input id="pdf-from" type="number" min={1} max={total} value={from} onChange={(e) => setFrom(clamp(Number(e.target.value)))} />
            </div>
            <div>
              <label className="label" htmlFor="pdf-to">
                {pick(dict, 't.pdfSplit.to', 'To page')}
              </label>
              <input id="pdf-to" type="number" min={1} max={total} value={to} onChange={(e) => setTo(clamp(Number(e.target.value)))} />
            </div>
          </div>

          {thumbsLoading && (
            <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
              // {pick(dict, 't.pdfSplit.rendering', 'Rendering preview…')}
            </p>
          )}

          {thumbs.length > 0 && (
            <div
              className="card"
              style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.7rem', alignItems: 'flex-start' }}
            >
              {thumbs.map((src, idx) => {
                const p = idx + 1;
                const active = inRange(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => pickPage(p)}
                    title={`${pick(dict, 't.pdfSplit.from', 'Page')} ${p}`}
                    style={{
                      flexShrink: 0,
                      padding: 0,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: active ? 1 : 0.4,
                      transition: 'opacity .1s',
                    }}
                  >
                    <img
                      alt={`Page ${p}`}
                      src={src}
                      style={{
                        display: 'block',
                        width: 72,
                        border: `3px solid ${active ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
                        background: '#fff',
                      }}
                    />
                    <span className="font-mono" style={{ display: 'block', textAlign: 'center', fontSize: '0.65rem', marginTop: 2, color: active ? 'var(--color-accent)' : 'var(--color-fg-muted)' }}>
                      {p}
                    </span>
                  </button>
                );
              })}
              {total > thumbs.length && (
                <span className="font-mono text-xs" style={{ flexShrink: 0, alignSelf: 'center', color: 'var(--color-fg-muted)', padding: '0 0.5rem' }}>
                  +{total - thumbs.length}…
                </span>
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

      <button type="button" className="btn btn-primary" onClick={extract} disabled={!file || working}>
        {working ? pick(dict, 't.pdfSplit.working', 'Extracting…') : pick(dict, 't.pdfSplit.extract', 'Extract & download')}
      </button>
    </div>
  );
}
