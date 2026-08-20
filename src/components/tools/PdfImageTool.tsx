import { useMemo, useRef, useState } from 'react';
import { PDFDocument, type PDFImage } from 'pdf-lib';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import { renderPage, type PageRender } from '~/lib/pdfPreview';

interface Props {
  dict: Dict;
}

const PREVIEW_W = 480; // ancho al que renderizamos la vista previa
const MIN_RW = 0.05; // ancho mínimo de la imagen, como fracción del ancho de página

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const downloadBlob = (bytes: Uint8Array, name: string) => {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

// Embeber cualquier imagen decodificable: JPG/PNG directos, el resto via canvas → PNG.
const embedImage = async (doc: PDFDocument, file: File): Promise<PDFImage> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (file.type === 'image/jpeg') return doc.embedJpg(bytes);
  if (file.type === 'image/png') return doc.embedPng(bytes);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d')?.drawImage(img, 0, 0);
    const pngBytes = await new Promise<Uint8Array>((res, rej) =>
      canvas.toBlob((b) => (b ? b.arrayBuffer().then((ab) => res(new Uint8Array(ab))) : rej(new Error('blob'))), 'image/png'),
    );
    return doc.embedPng(pngBytes);
  } finally {
    URL.revokeObjectURL(url);
  }
};

type DragMode = 'move' | 'resize';
interface DragState {
  mode: DragMode;
  px: number;
  py: number;
  rx: number;
  ry: number;
  rw: number;
}

export default function PdfImageTool({ dict }: Props) {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [render, setRender] = useState<PageRender | null>(null);
  const [rendering, setRendering] = useState(false);

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState('');
  const [imgNat, setImgNat] = useState<{ w: number; h: number } | null>(null);

  // Rectángulo de la imagen en fracciones [0..1] de la página. `rw` es el ancho;
  // el alto se deriva para conservar la proporción real de la imagen.
  const [rx, setRx] = useState(0.3);
  const [ry, setRy] = useState(0.3);
  const [rw, setRw] = useState(0.4);
  const [opacity, setOpacity] = useState(1);
  const [applyAll, setApplyAll] = useState(false);

  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  // Relación alto/ancho de la página en puntos: convierte una fracción de ancho
  // en fracción de alto conservando la proporción de la imagen.
  const pageRatio = render ? render.widthPt / render.heightPt : 1;
  const imgRatio = imgNat ? imgNat.h / imgNat.w : 1;
  const rh = useMemo(() => rw * pageRatio * imgRatio, [rw, pageRatio, imgRatio]);

  const loadPage = async (buf: ArrayBuffer, index: number) => {
    setRendering(true);
    try {
      const r = await renderPage(buf, index + 1, PREVIEW_W);
      setRender(r);
    } catch {
      setRender(null);
    } finally {
      setRendering(false);
    }
  };

  const loadPdf = async (f: File) => {
    setError('');
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return;
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      setFile(f);
      setTotal(doc.getPageCount());
      setPageIndex(0);
      await loadPage(buf, 0);
    } catch {
      setFile(null);
      setTotal(0);
      setRender(null);
      setError(pick(dict, 't.pdfImage.error', 'Could not read this PDF (it may be encrypted or corrupt).'));
    }
  };

  const goToPage = async (index: number) => {
    if (!file || index < 0 || index >= total || index === pageIndex) return;
    setPageIndex(index);
    await loadPage(await file.arrayBuffer(), index);
  };

  const loadImage = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setError('');
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(f);
    const probe = new Image();
    probe.onload = () => {
      setImgFile(f);
      setImgUrl(url);
      setImgNat({ w: probe.naturalWidth, h: probe.naturalHeight });
      // Coloca la imagen centrada al 40 % del ancho de página.
      const nrw = 0.4;
      const nrh = nrw * pageRatio * (probe.naturalHeight / probe.naturalWidth);
      setRw(nrw);
      setRx((1 - nrw) / 2);
      setRy(clamp((1 - nrh) / 2, 0, 1));
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setError(pick(dict, 't.pdfImage.imageError', 'Could not load this image.'));
    };
    probe.src = url;
  };

  const onPointerDown = (mode: DragMode) => (e: React.PointerEvent) => {
    if (!imgNat) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, px: e.clientX, py: e.clientY, rx, ry, rw };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const st = drag.current;
    const stage = stageRef.current;
    if (!st || !stage) return;
    const box = stage.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    const dx = (e.clientX - st.px) / box.width;
    const dy = (e.clientY - st.py) / box.height;

    if (st.mode === 'move') {
      setRx(clamp(st.rx + dx, 0, Math.max(0, 1 - rw)));
      setRy(clamp(st.ry + dy, 0, Math.max(0, 1 - rh)));
      return;
    }
    // resize desde la esquina inferior derecha; el alto sigue al ancho.
    const perW = pageRatio * imgRatio; // rh = rw * perW
    const maxByWidth = 1 - st.rx;
    const maxByHeight = perW > 0 ? (1 - ry) / perW : 1;
    setRw(clamp(st.rw + dx, MIN_RW, Math.max(MIN_RW, Math.min(maxByWidth, maxByHeight))));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    drag.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* el puntero ya podría no estar capturado */
    }
  };

  // Slider de tamaño: fija el ancho y reencaja la posición si se sale de página.
  const setSize = (nrw: number) => {
    const perW = pageRatio * imgRatio;
    setRw(nrw);
    setRx((x) => clamp(x, 0, Math.max(0, 1 - nrw)));
    setRy((y) => clamp(y, 0, Math.max(0, 1 - nrw * perW)));
  };

  const center = () => {
    setRx((1 - rw) / 2);
    setRy(clamp((1 - rh) / 2, 0, 1));
  };

  const apply = async () => {
    if (!file) return;
    if (!imgFile || !imgNat) {
      setError(pick(dict, 't.pdfImage.needImage', 'Add an image first.'));
      return;
    }
    setWorking(true);
    setError('');
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const embedded = await embedImage(doc, imgFile);
      const pages = doc.getPages();
      const targets = applyAll ? pages : [pages[pageIndex]];
      for (const page of targets) {
        if (!page) continue;
        const { width: pw, height: ph } = page.getSize();
        const wPt = rw * pw;
        const hPt = wPt * imgRatio;
        const x = rx * pw;
        const y = ph - ry * ph - hPt; // pdf-lib mide desde abajo-izquierda
        page.drawImage(embedded, { x, y, width: wPt, height: hPt, opacity });
      }
      const bytes = await doc.save();
      downloadBlob(bytes, `${file.name.replace(/\.pdf$/i, '')}_image.pdf`);
    } catch {
      setError(pick(dict, 't.pdfImage.error', 'Could not read this PDF (it may be encrypted or corrupt).'));
    } finally {
      setWorking(false);
    }
  };

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    right: -7,
    bottom: -7,
    width: 16,
    height: 16,
    borderRadius: 3,
    background: 'var(--color-accent)',
    border: '2px solid #fff',
    cursor: 'nwse-resize',
    touchAction: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,.4)',
  };

  return (
    <div className="space-y-4">
      {/* Paso 1: cargar PDF */}
      <div
        className="card cursor-pointer text-center"
        role="button"
        tabIndex={0}
        onClick={() => pdfInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pdfInputRef.current?.click();
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) loadPdf(f);
        }}
      >
        <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
          {pick(dict, 't.pdfImage.dropPdf', 'Drop a PDF here or click to choose')}
        </p>
        {file && total > 0 && (
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--color-fg)' }}>
            {file.name} · {total} {pick(dict, 't.pdfImage.total', 'total pages')}
          </p>
        )}
      </div>

      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadPdf(f);
          e.target.value = '';
        }}
      />

      {file && total > 0 && (
        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
          {/* Escenario: página + imagen arrastrable */}
          <div className="space-y-2">
            <div
              ref={stageRef}
              style={{
                position: 'relative',
                display: 'inline-block',
                lineHeight: 0,
                border: '2px solid var(--color-border-strong)',
                background: '#fff',
                maxWidth: '100%',
                touchAction: 'none',
              }}
            >
              {rendering || !render ? (
                <div style={{ width: 260, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                    {pick(dict, 't.pdfImage.rendering', 'Rendering preview…')}
                  </span>
                </div>
              ) : (
                <>
                  <img
                    alt=""
                    src={render.url}
                    draggable={false}
                    style={{ display: 'block', width: PREVIEW_W, maxWidth: '100%', height: 'auto', userSelect: 'none' }}
                  />
                  {imgUrl && (
                    <div
                      role="button"
                      aria-label={pick(dict, 't.pdfImage.hint', 'Drag to move, drag the corner to resize')}
                      onPointerDown={onPointerDown('move')}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      style={{
                        position: 'absolute',
                        left: `${rx * 100}%`,
                        top: `${ry * 100}%`,
                        width: `${rw * 100}%`,
                        height: `${rh * 100}%`,
                        cursor: 'move',
                        touchAction: 'none',
                        outline: '1px solid var(--color-accent)',
                        boxShadow: '0 0 0 1px rgba(255,255,255,.6)',
                      }}
                    >
                      <img
                        alt=""
                        src={imgUrl}
                        draggable={false}
                        style={{ width: '100%', height: '100%', objectFit: 'fill', opacity, userSelect: 'none', pointerEvents: 'none' }}
                      />
                      <span
                        onPointerDown={onPointerDown('resize')}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        style={handleStyle}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {total > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '0.3rem 0.6rem' }}
                  onClick={() => goToPage(pageIndex - 1)}
                  disabled={pageIndex === 0}
                  aria-label={pick(dict, 't.pdfImage.prevPage', 'Previous page')}
                >
                  ‹
                </button>
                <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                  {pick(dict, 't.pdfImage.page', 'Page')} {pageIndex + 1} / {total}
                </span>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '0.3rem 0.6rem' }}
                  onClick={() => goToPage(pageIndex + 1)}
                  disabled={pageIndex >= total - 1}
                  aria-label={pick(dict, 't.pdfImage.nextPage', 'Next page')}
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="space-y-4">
            <div>
              <button type="button" className="btn" onClick={() => imgInputRef.current?.click()}>
                {imgFile ? pick(dict, 't.pdfImage.replaceImage', 'Replace image') : pick(dict, 't.pdfImage.addImage', 'Add image')}
              </button>
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) loadImage(f);
                  e.target.value = '';
                }}
              />
              {imgFile && (
                <p className="mt-2 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                  {pick(dict, 't.pdfImage.hint', 'Drag to move, drag the corner to resize')}
                </p>
              )}
            </div>

            {imgFile && (
              <>
                <div>
                  <label className="label" htmlFor="pi-size">
                    {pick(dict, 't.pdfImage.size', 'Size')} · {Math.round(rw * 100)}%
                  </label>
                  <input
                    id="pi-size"
                    type="range"
                    min={5}
                    max={100}
                    value={Math.round(rw * 100)}
                    onChange={(e) => setSize(Number(e.target.value) / 100)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="pi-opacity">
                    {pick(dict, 't.pdfImage.opacity', 'Opacity')} · {Math.round(opacity * 100)}%
                  </label>
                  <input
                    id="pi-opacity"
                    type="range"
                    min={10}
                    max={100}
                    value={Math.round(opacity * 100)}
                    onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="flex gap-2">
                  <button type="button" className="btn" style={{ padding: '0.4rem 0.7rem' }} onClick={center}>
                    {pick(dict, 't.pdfImage.center', 'Center')}
                  </button>
                </div>

                {total > 1 && (
                  <div>
                    <label className="label">{pick(dict, 't.pdfImage.applyTo', 'Apply to')}</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`btn ${!applyAll ? 'btn-primary' : ''}`}
                        aria-pressed={!applyAll}
                        onClick={() => setApplyAll(false)}
                        style={{ padding: '0.4rem 0.7rem' }}
                      >
                        {pick(dict, 't.pdfImage.thisPage', 'This page')}
                      </button>
                      <button
                        type="button"
                        className={`btn ${applyAll ? 'btn-primary' : ''}`}
                        aria-pressed={applyAll}
                        onClick={() => setApplyAll(true)}
                        style={{ padding: '0.4rem 0.7rem' }}
                      >
                        {pick(dict, 't.pdfImage.allPages', 'All pages')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}

      <button type="button" className="btn btn-primary" onClick={apply} disabled={!file || !imgFile || working}>
        {working ? pick(dict, 't.pdfImage.working', 'Inserting…') : pick(dict, 't.pdfImage.apply', 'Insert image & download')}
      </button>
    </div>
  );
}
