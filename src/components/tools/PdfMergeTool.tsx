import { useRef, useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import { renderFirstPage } from '~/lib/pdfPreview';

interface Props {
  dict: Dict;
}

interface PdfItem {
  id: number;
  file: File;
  name: string;
  pages: number;
  size: number;
  thumb?: string;
  rotation: number; // 0 | 90 | 180 | 270 — aplicado al unir
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

const fmtSize = (b: number): string => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

export default function PdfMergeTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const dragIdx = useRef<number | null>(null);
  const [items, setItems] = useState<PdfItem[]>([]);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [dropping, setDropping] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    setError('');
    const pdfs = Array.from(files).filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    const next: PdfItem[] = [];
    for (const file of pdfs) {
      try {
        const buf = await file.arrayBuffer();
        const doc = await PDFDocument.load(buf);
        let thumb: string | undefined;
        try {
          thumb = (await renderFirstPage(buf, 200)) ?? undefined;
        } catch {
          thumb = undefined;
        }
        next.push({ id: idRef.current++, file, name: file.name, pages: doc.getPageCount(), size: file.size, thumb, rotation: 0 });
      } catch {
        setError(pick(dict, 't.pdfMerge.error', 'Could not read a PDF.'));
      }
    }
    if (next.length) setItems((prev) => [...prev, ...next]);
  };

  const reorder = (from: number, to: number) => {
    setItems((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const rotate = (id: number) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, rotation: (x.rotation + 90) % 360 } : x)));

  const remove = (id: number) => setItems((prev) => prev.filter((x) => x.id !== id));

  const merge = async () => {
    if (items.length < 2) {
      setError(pick(dict, 't.pdfMerge.need2', 'Add at least 2 PDFs.'));
      return;
    }
    setError('');
    setWorking(true);
    try {
      const out = await PDFDocument.create();
      for (const it of items) {
        const src = await PDFDocument.load(await it.file.arrayBuffer());
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => {
          if (it.rotation) p.setRotation(degrees((p.getRotation().angle + it.rotation) % 360));
          out.addPage(p);
        });
      }
      const bytes = await out.save();
      downloadBlob(bytes, 'merged.pdf');
    } catch {
      setError(pick(dict, 't.pdfMerge.error', 'Could not read a PDF.'));
    } finally {
      setWorking(false);
    }
  };

  const totalPages = items.reduce((sum, x) => sum + x.pages, 0);
  const iconBtn: React.CSSProperties = {
    width: 26,
    height: 26,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    border: '2px solid var(--color-border-strong)',
    background: 'var(--color-bg-card)',
    color: 'var(--color-fg)',
    cursor: 'pointer',
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDropping(true);
        }}
        onDragLeave={() => setDropping(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDropping(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        style={{ outline: dropping ? '3px dashed var(--color-accent)' : 'none', outlineOffset: 4 }}
      >
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', alignItems: 'stretch' }}
        >
          {items.map((it, idx) => (
            <div
              key={it.id}
              className="card"
              draggable
              onDragStart={(e) => {
                dragIdx.current = idx;
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragIdx.current !== null) reorder(dragIdx.current, idx);
                dragIdx.current = null;
              }}
              title={pick(dict, 't.pdfMerge.dragHint', 'Drag to reorder')}
              style={{ position: 'relative', padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'grab' }}
            >
              <span className="tag" style={{ position: 'absolute', top: 6, left: 6, fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                {idx + 1}
              </span>
              <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => rotate(it.id)}
                  title={pick(dict, 't.pdfMerge.rotate', 'Rotate')}
                  aria-label={pick(dict, 't.pdfMerge.rotate', 'Rotate')}
                  style={iconBtn}
                >
                  ↻
                </button>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  title={pick(dict, 't.pdfMerge.remove', 'Remove')}
                  aria-label={pick(dict, 't.pdfMerge.remove', 'Remove')}
                  style={iconBtn}
                >
                  ✕
                </button>
              </div>

              <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 18 }}>
                {it.thumb ? (
                  <img
                    alt=""
                    src={it.thumb}
                    style={{
                      maxWidth: '90%',
                      maxHeight: 150,
                      border: '2px solid var(--color-border-strong)',
                      background: '#fff',
                      transform: `rotate(${it.rotation}deg)`,
                      transition: 'transform .2s ease',
                    }}
                  />
                ) : (
                  <span style={{ width: 90, height: 120, border: '2px solid var(--color-border-strong)', background: 'var(--color-bg-raised)' }} />
                )}
              </div>

              <p className="text-xs" title={it.name} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {it.name}
              </p>
              <p className="font-mono" style={{ margin: 0, fontSize: '0.65rem', textAlign: 'center', color: 'var(--color-fg-muted)' }}>
                {fmtSize(it.size)} · {it.pages} {pick(dict, 't.pdfMerge.pages', 'pages')}
              </p>
            </div>
          ))}

          {/* Tile para agregar más PDFs */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="card"
            style={{
              minHeight: items.length ? undefined : 220,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              border: '2px dashed var(--color-border-strong)',
              background: 'var(--color-bg-raised)',
              cursor: 'pointer',
              color: 'var(--color-fg)',
            }}
          >
            <span style={{ fontSize: '2rem', lineHeight: 1, color: 'var(--color-accent)' }}>+</span>
            <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)', textAlign: 'center', padding: '0 0.4rem' }}>
              {items.length ? pick(dict, 't.pdfMerge.addMore', 'Add more') : pick(dict, 't.pdfMerge.drop', 'Add PDF files')}
            </span>
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button type="button" className="btn btn-primary" onClick={merge} disabled={working || items.length < 2}>
          {working ? pick(dict, 't.pdfMerge.working', 'Merging…') : pick(dict, 't.pdfMerge.merge', 'Merge & download')}
        </button>
        {items.length > 0 && (
          <span className="tag">
            {items.length} · {totalPages} {pick(dict, 't.pdfMerge.pages', 'pages')}
          </span>
        )}
      </div>
    </div>
  );
}
