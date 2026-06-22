import { useRef, useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import { renderFirstPage } from '~/lib/pdfPreview';

interface Props {
  dict: Dict;
}

const downloadBlob = (bytes: Uint8Array, name: string) => {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const ANGLES = [90, 180, 270] as const;
const ANGLE_LABEL: Record<number, string> = { 90: '90° ↻', 180: '180°', 270: '270° ↺' };

export default function PdfRotateTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);
  const [angle, setAngle] = useState<number>(90);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [preview, setPreview] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadFile = async (f: File) => {
    setError('');
    setPreview('');
    setAngle(90);
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return;
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      setFile(f);
      setTotal(doc.getPageCount());
      setPreviewLoading(true);
      try {
        const url = await renderFirstPage(buf, 200);
        if (url) setPreview(url);
      } catch {
        setPreview('');
      } finally {
        setPreviewLoading(false);
      }
    } catch {
      setFile(null);
      setTotal(0);
      setError(pick(dict, 't.pdfRotate.error', 'Could not read this PDF.'));
    }
  };

  const apply = async () => {
    if (!file) return;
    setError('');
    setWorking(true);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      for (const page of doc.getPages()) {
        const cur = page.getRotation().angle;
        page.setRotation(degrees((cur + angle) % 360));
      }
      const bytes = await doc.save();
      const base = file.name.replace(/\.pdf$/i, '');
      downloadBlob(bytes, `${base}_rotated.pdf`);
    } catch {
      setError(pick(dict, 't.pdfRotate.error', 'Could not read this PDF.'));
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
          {pick(dict, 't.pdfRotate.drop', 'Drop a PDF here or click to choose')}
        </p>
        {file && (
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--color-fg)' }}>
            {file.name} · {total} {pick(dict, 't.pdfRotate.total', 'total pages')}
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
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <label className="label">{pick(dict, 't.pdfRotate.direction', 'Rotation')}</label>
            <div className="flex flex-wrap gap-2">
              {ANGLES.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`btn ${angle === a ? 'btn-primary' : ''}`}
                  aria-pressed={angle === a}
                  onClick={() => setAngle(a)}
                >
                  {ANGLE_LABEL[a]}
                </button>
              ))}
            </div>
          </div>

          <div
            className="card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, minWidth: 200, overflow: 'hidden' }}
          >
            {previewLoading ? (
              <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                {pick(dict, 't.pdfRotate.rendering', 'Rendering preview…')}
              </span>
            ) : preview ? (
              <img
                alt=""
                src={preview}
                style={{ maxWidth: 160, maxHeight: 200, border: '2px solid var(--color-border-strong)', background: '#fff', transform: `rotate(${angle}deg)`, transition: 'transform .2s ease' }}
              />
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
        {working ? pick(dict, 't.pdfRotate.working', 'Rotating…') : pick(dict, 't.pdfRotate.apply', 'Rotate & download')}
      </button>
    </div>
  );
}
