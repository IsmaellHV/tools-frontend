import { useRef, useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import { renderFirstPage } from '~/lib/pdfPreview';

interface Props {
  dict: Dict;
}

type V = 'top' | 'bottom';
type H = 'left' | 'center' | 'right';
type Fmt = 'n' | 'nOfTotal';

const MARGIN = 28;
const POSITIONS: { v: V; h: H }[] = [
  { v: 'top', h: 'left' },
  { v: 'top', h: 'center' },
  { v: 'top', h: 'right' },
  { v: 'bottom', h: 'left' },
  { v: 'bottom', h: 'center' },
  { v: 'bottom', h: 'right' },
];

const downloadBlob = (bytes: Uint8Array, name: string) => {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export default function PdfPageNumbersTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);
  const [preview, setPreview] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [vPos, setVPos] = useState<V>('bottom');
  const [hPos, setHPos] = useState<H>('center');
  const [format, setFormat] = useState<Fmt>('n');
  const [start, setStart] = useState(1);
  const [size, setSize] = useState(11);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const lastNum = () => start + Math.max(total, 1) - 1;
  const label = (n: number) => (format === 'nOfTotal' ? `${n} / ${lastNum()}` : `${n}`);

  const loadFile = async (f: File) => {
    setError('');
    setPreview('');
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return;
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      setFile(f);
      setTotal(doc.getPageCount());
      setPreviewLoading(true);
      try {
        const url = await renderFirstPage(buf, 220);
        if (url) setPreview(url);
      } catch {
        setPreview('');
      } finally {
        setPreviewLoading(false);
      }
    } catch {
      setFile(null);
      setTotal(0);
      setError(pick(dict, 't.pdfPageNumbers.error', 'Could not read this PDF.'));
    }
  };

  const apply = async () => {
    if (!file) return;
    setWorking(true);
    setError('');
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      pages.forEach((page, i) => {
        const text = label(start + i);
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(text, size);
        let x: number;
        if (hPos === 'left') x = MARGIN;
        else if (hPos === 'center') x = (width - tw) / 2;
        else x = width - MARGIN - tw;
        const y = vPos === 'bottom' ? MARGIN : height - MARGIN - size;
        page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
      });
      const bytes = await doc.save();
      downloadBlob(bytes, `${file.name.replace(/\.pdf$/i, '')}_numbered.pdf`);
    } catch {
      setError(pick(dict, 't.pdfPageNumbers.error', 'Could not read this PDF.'));
    } finally {
      setWorking(false);
    }
  };

  // Estilo del dot dentro del selector visual de posición.
  const dotStyle = (v: V, h: H): React.CSSProperties => ({
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: '50%',
    [v === 'top' ? 'top' : 'bottom']: 4,
    ...(h === 'left' ? { left: 4 } : h === 'right' ? { right: 4 } : { left: '50%', marginLeft: -3 }),
  });

  // Posición del número en el preview (overlay CSS).
  const overlayStyle = (): React.CSSProperties => ({
    position: 'absolute',
    [vPos === 'top' ? 'top' : 'bottom']: 6,
    ...(hPos === 'left' ? { left: 8 } : hPos === 'right' ? { right: 8 } : { left: '50%', transform: 'translateX(-50%)' }),
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: 11,
    color: '#000',
    background: 'rgba(255,255,255,0.7)',
    padding: '0 3px',
    lineHeight: 1.3,
  });

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
          {pick(dict, 't.pdfPageNumbers.drop', 'Drop a PDF here or click to choose')}
        </p>
        {file && total > 0 && (
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--color-fg)' }}>
            {file.name} · {total} {pick(dict, 't.pdfPageNumbers.total', 'total pages')}
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
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="space-y-4">
            <div>
              <label className="label">{pick(dict, 't.pdfPageNumbers.position', 'Position')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 44px)', gap: 6 }}>
                {POSITIONS.map((p) => {
                  const active = p.v === vPos && p.h === hPos;
                  return (
                    <button
                      key={`${p.v}-${p.h}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setVPos(p.v);
                        setHPos(p.h);
                      }}
                      style={{ position: 'relative', width: 44, height: 32, padding: 0, border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-border-strong)'}`, background: 'var(--color-bg-card)', cursor: 'pointer' }}
                    >
                      <span style={{ ...dotStyle(p.v, p.h), background: active ? 'var(--color-accent)' : 'var(--color-fg-muted)' }} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label">{pick(dict, 't.pdfPageNumbers.format', 'Format')}</label>
              <div className="flex gap-2">
                <button type="button" className={`btn ${format === 'n' ? 'btn-primary' : ''}`} aria-pressed={format === 'n'} onClick={() => setFormat('n')} style={{ padding: '0.4rem 0.7rem' }}>
                  1
                </button>
                <button type="button" className={`btn ${format === 'nOfTotal' ? 'btn-primary' : ''}`} aria-pressed={format === 'nOfTotal'} onClick={() => setFormat('nOfTotal')} style={{ padding: '0.4rem 0.7rem' }}>
                  1 / {Math.max(total, 1)}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="start">
                  {pick(dict, 't.pdfPageNumbers.start', 'Start at')}
                </label>
                <input id="start" type="number" min={0} value={start} onChange={(e) => setStart(Math.max(0, Number(e.target.value) || 0))} />
              </div>
              <div>
                <label className="label" htmlFor="size">
                  {pick(dict, 't.pdfPageNumbers.size', 'Font size')}
                </label>
                <input id="size" type="number" min={6} max={48} value={size} onChange={(e) => setSize(Math.min(48, Math.max(6, Number(e.target.value) || 11)))} />
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 200, minHeight: 240 }}>
            {previewLoading ? (
              <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                {pick(dict, 't.pdfPageNumbers.rendering', 'Rendering preview…')}
              </span>
            ) : preview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img alt="" src={preview} style={{ display: 'block', maxWidth: 200, maxHeight: 260, border: '2px solid var(--color-border-strong)', background: '#fff' }} />
                <span style={overlayStyle()}>{label(start)}</span>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}

      <button type="button" className="btn btn-primary" onClick={apply} disabled={!file || working}>
        {working ? pick(dict, 't.pdfPageNumbers.working', 'Adding…') : pick(dict, 't.pdfPageNumbers.apply', 'Add numbers & download')}
      </button>
    </div>
  );
}
