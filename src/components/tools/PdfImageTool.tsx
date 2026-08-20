import { useRef, useState } from 'react';
import { PDFDocument, degrees, type PDFImage } from 'pdf-lib';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import { renderPages, type PageRender } from '~/lib/pdfPreview';

interface Props {
  dict: Dict;
}

const PREVIEW_W = 520; // ancho al que se renderiza cada página
const MAX_PAGES = 50; // tope de páginas renderizadas (rendimiento)
const MIN_RW = 0.04; // ancho mínimo de una colocación, como fracción del ancho de página

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// Una imagen colocada: en qué página va y su rectángulo en fracciones [0..1] de
// esa página. `rw` es el ancho; el alto se deriva conservando la proporción de
// la imagen y la de la página. `rot` va en grados con el criterio de CSS
// (positivo = horario en pantalla) y gira alrededor del centro.
interface Placement {
  id: number;
  page: number;
  rx: number;
  ry: number;
  rw: number;
  rot: number;
}

type DragMode = 'move' | 'resize' | 'rotate';

interface DragState {
  id: number;
  mode: DragMode;
  grabFX: number; // punto de agarre dentro de la imagen (fracción), para que no salte
  grabFY: number;
  startClientX: number;
  startClientY: number;
  startRw: number;
  move: (e: PointerEvent) => void;
  up: (e: PointerEvent) => void;
}

const ROT_SNAP = 15; // grados a los que engancha la rotación con Shift

const downloadBlob = (bytes: Uint8Array, name: string) => {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

// Carga un <img> desde una URL y espera a que esté decodificado.
const loadImageEl = (url: string): Promise<HTMLImageElement> =>
  new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = url;
  });

// Recuadro de recorte, en fracciones [0..1] de la imagen ORIGINAL.
interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FULL_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };
const MIN_CROP = 0.02; // no dejar recortar por debajo del 2 % del lado
const TRIM_PAD = 2; // margen que deja el recorte automático, en píxeles
const TRIM_MAX_SIDE = 1400; // lado máximo al analizar píxeles (memoria)
const WHITE_CUT = 240; // a partir de aquí se considera fondo blanco
const ALPHA_CUT = 16; // por debajo de aquí se considera transparente

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

export default function PdfImageTool({ dict }: Props) {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const drag = useRef<DragState | null>(null);
  const suppressClick = useRef(false);

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageRender[]>([]);
  const [total, setTotal] = useState(0);
  const [rendering, setRendering] = useState(false);

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState('');
  const [imgRatio, setImgRatio] = useState(1); // alto / ancho de la imagen

  // La imagen que subió el usuario se conserva intacta: cada recorte parte de
  // ella, así que recortar de nuevo nunca degrada lo ya recortado.
  const [origFile, setOrigFile] = useState<File | null>(null);
  const [origUrl, setOrigUrl] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState<CropRect>(FULL_CROP);
  const cropRef = useRef<CropRect>(FULL_CROP);
  const cropImgRef = useRef<HTMLImageElement>(null);

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [opacity, setOpacity] = useState(1);
  const [dragging, setDragging] = useState(false);

  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  // Espejos en ref para que los listeners globales de arrastre lean SIEMPRE el
  // valor actual sin recrearse (evita cierres obsoletos y perder el arrastre
  // cuando una colocación cambia de página y React la re-monta).
  const placementsRef = useRef<Placement[]>([]);
  const pagesRef = useRef<PageRender[]>([]);
  const imgRatioRef = useRef(1);

  const commit = (next: Placement[]) => {
    placementsRef.current = next;
    setPlacements(next);
  };
  const updatePlacement = (id: number, fn: (p: Placement) => Placement) =>
    commit(placementsRef.current.map((p) => (p.id === id ? fn(p) : p)));

  const ratioOf = (page: number) => {
    const m = pagesRef.current[page];
    return m ? m.widthPt / m.heightPt : 1;
  };
  // Un ángulo ausente o corrupto se trata como 0: así un NaN nunca llega ni al
  // `transform` de la vista previa ni a la matriz que se escribe en el PDF.
  const rotOf = (p: Placement) => (Number.isFinite(p.rot) ? p.rot : 0);
  const rhOf = (p: Placement) => p.rw * ratioOf(p.page) * imgRatioRef.current;

  const resetForNewPdf = () => {
    commit([]);
    setActiveId(null);
  };

  const loadPdf = async (f: File) => {
    setError('');
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return;
    setRendering(true);
    try {
      const buf = await f.arrayBuffer();
      const { total: t, pages: pr } = await renderPages(buf, { width: PREVIEW_W, max: MAX_PAGES });
      setFile(f);
      setTotal(t);
      setPages(pr);
      pagesRef.current = pr;
      resetForNewPdf();
    } catch (err) {
      setFile(null);
      setTotal(0);
      setPages([]);
      pagesRef.current = [];
      // El motivo real va a la consola. Aquí no solo caen PDFs dañados: si el
      // worker de pdf.js no carga (por ejemplo servido con un MIME que el
      // navegador rechaza) el fallo aterriza igual en este catch, y sin este
      // registro el usuario solo ve "PDF dañado" sobre un PDF perfectamente sano.
      console.error('pdf-image: no se pudo renderizar el PDF:', err);
      setError(pick(dict, 't.pdfImage.error', 'Could not read this PDF (it may be encrypted or corrupt).'));
    } finally {
      setRendering(false);
    }
  };

  // Página con mayor área visible dentro del visor con scroll. Sirve para que
  // "colocar otra" caiga donde el usuario está mirando, no siempre en la 1.
  const mostVisiblePage = (): number => {
    const stage = stageRef.current;
    if (!stage) return 0;
    const sr = stage.getBoundingClientRect();
    let best = 0;
    let bestArea = -1;
    stage.querySelectorAll<HTMLElement>('[data-page]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const vis = Math.max(0, Math.min(r.bottom, sr.bottom) - Math.max(r.top, sr.top));
      if (vis > bestArea) {
        bestArea = vis;
        best = Number(el.dataset.page);
      }
    });
    return best;
  };

  const addPlacement = (page?: number, at?: { rx: number; ry: number }) => {
    const pg = page ?? mostVisiblePage();
    const rw = 0.28;
    const rh = rw * ratioOf(pg) * imgRatioRef.current;
    const rx = at ? clamp(at.rx - rw / 2, 0, Math.max(0, 1 - rw)) : (1 - rw) / 2;
    const ry = at ? clamp(at.ry - rh / 2, 0, Math.max(0, 1 - rh)) : clamp(0.72 - rh, 0, Math.max(0, 1 - rh));
    const p: Placement = { id: idRef.current++, page: pg, rx, ry, rw, rot: 0 };
    commit([...placementsRef.current, p]);
    setActiveId(p.id);
  };

  // Clic en una zona libre de la página: si hay una firma activa la trae aquí;
  // si no, crea una nueva. Es la vía cómoda para firmar cualquier página.
  const placeAt = (page: number, e: React.MouseEvent) => {
    if (!imgFile) return;
    // Tras soltar un arrastre el navegador emite un `click` sobre la página; sin
    // esta guarda la firma daría un salto al punto donde se soltó el ratón.
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    const cur = placementsRef.current.find((p) => p.id === activeId);
    if (cur) {
      const rh = cur.rw * ratioOf(page) * imgRatioRef.current;
      updatePlacement(cur.id, (p) => ({
        ...p,
        page,
        rx: clamp(fx - p.rw / 2, 0, Math.max(0, 1 - p.rw)),
        ry: clamp(fy - rh / 2, 0, Math.max(0, 1 - rh)),
      }));
    } else {
      addPlacement(page, { rx: fx, ry: fy });
    }
  };

  const setCropState = (c: CropRect) => {
    cropRef.current = c;
    setCrop(c);
  };

  // Fija la imagen que realmente se estampa (la original o un recorte de ella).
  const applyImage = (f: File) => {
    const url = URL.createObjectURL(f);
    loadImageEl(url)
      .then((el) => {
        setImgFile(f);
        setImgUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        const ratio = el.naturalHeight / el.naturalWidth;
        setImgRatio(ratio);
        imgRatioRef.current = ratio;
        // Primera colocación automática, cerca del pie de la página visible.
        if (placementsRef.current.length === 0) addPlacement();
      })
      .catch(() => {
        URL.revokeObjectURL(url);
        setError(pick(dict, 't.pdfImage.imageError', 'Could not load this image.'));
      });
  };

  const loadImage = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setError('');
    const url = URL.createObjectURL(f);
    setOrigFile(f);
    setOrigUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setCropState(FULL_CROP);
    setCropOpen(false);
    applyImage(f);
  };

  // Recorte automático: busca el rectángulo que contiene el trazo y descarta el
  // margen. Trata como fondo tanto lo transparente como el blanco casi puro, que
  // es lo que deja un escaneo o una foto de firma sobre papel.
  const autoTrim = async () => {
    if (!origUrl) return;
    setError('');
    try {
      const img = await loadImageEl(origUrl);
      const scale = Math.min(1, TRIM_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      let minX = w;
      let minY = h;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (data[i + 3] < ALPHA_CUT) continue;
          if (data[i] > WHITE_CUT && data[i + 1] > WHITE_CUT && data[i + 2] > WHITE_CUT) continue;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      // Una imagen sin nada que recortar se deja como está en vez de dejarla vacía.
      if (maxX < 0) {
        setError(pick(dict, 't.pdfImage.trimEmpty', 'Nothing to trim: the image looks blank.'));
        return;
      }
      const x0 = clamp((minX - TRIM_PAD) / w, 0, 1);
      const y0 = clamp((minY - TRIM_PAD) / h, 0, 1);
      const x1 = clamp((maxX + 1 + TRIM_PAD) / w, 0, 1);
      const y1 = clamp((maxY + 1 + TRIM_PAD) / h, 0, 1);
      setCropState({ x: x0, y: y0, w: Math.max(MIN_CROP, x1 - x0), h: Math.max(MIN_CROP, y1 - y0) });
    } catch {
      setError(pick(dict, 't.pdfImage.imageError', 'Could not load this image.'));
    }
  };

  const applyCrop = async () => {
    if (!origFile || !origUrl) return;
    const c = cropRef.current;
    try {
      const img = await loadImageEl(origUrl);
      const sx = Math.round(c.x * img.naturalWidth);
      const sy = Math.round(c.y * img.naturalHeight);
      const sw = Math.max(1, Math.round(c.w * img.naturalWidth));
      const sh = Math.max(1, Math.round(c.h * img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      // Siempre PNG: conserva la transparencia de las firmas ya recortadas.
      const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/png'));
      applyImage(new File([blob], `${origFile.name.replace(/\.\w+$/, '')}-crop.png`, { type: 'image/png' }));
      setCropOpen(false);
    } catch {
      setError(pick(dict, 't.pdfImage.imageError', 'Could not load this image.'));
    }
  };

  const startCropDrag = (mode: 'move' | 'nw' | 'ne' | 'sw' | 'se') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const box = cropImgRef.current?.getBoundingClientRect();
    if (!box || !box.width || !box.height) return;
    const start = { ...cropRef.current };
    const sx = e.clientX;
    const sy = e.clientY;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - sx) / box.width;
      const dy = (ev.clientY - sy) / box.height;
      const n = { ...start };
      if (mode === 'move') {
        n.x = clamp(start.x + dx, 0, 1 - start.w);
        n.y = clamp(start.y + dy, 0, 1 - start.h);
      } else {
        if (mode.includes('w')) {
          const nx = clamp(start.x + dx, 0, start.x + start.w - MIN_CROP);
          n.w = start.x + start.w - nx;
          n.x = nx;
        }
        if (mode.includes('e')) n.w = clamp(start.w + dx, MIN_CROP, 1 - start.x);
        if (mode.includes('n')) {
          const ny = clamp(start.y + dy, 0, start.y + start.h - MIN_CROP);
          n.h = start.y + start.h - ny;
          n.y = ny;
        }
        if (mode.includes('s')) n.h = clamp(start.h + dy, MIN_CROP, 1 - start.y);
      }
      setCropState(n);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const pageEl = (page: number) => stageRef.current?.querySelector<HTMLElement>(`[data-page="${page}"]`) ?? null;

  const startDrag = (id: number, mode: DragMode) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pl = placementsRef.current.find((p) => p.id === id);
    const el = pl ? pageEl(pl.page) : null;
    if (!pl || !el) return;
    const r = el.getBoundingClientRect();

    const move = (ev: PointerEvent) => {
      const st = drag.current;
      if (!st) return;
      if (st.mode === 'move') {
        // Detecta la página bajo el cursor para poder arrastrar entre páginas.
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        const pe = under?.closest<HTMLElement>('[data-page]');
        if (!pe) return;
        const pi = Number(pe.dataset.page);
        const rr = pe.getBoundingClientRect();
        updatePlacement(st.id, (p) => {
          const rhDest = p.rw * ratioOf(pi) * imgRatioRef.current;
          const nrx = clamp((ev.clientX - rr.left) / rr.width - st.grabFX * p.rw, 0, Math.max(0, 1 - p.rw));
          const nry = clamp((ev.clientY - rr.top) / rr.height - st.grabFY * rhDest, 0, Math.max(0, 1 - rhDest));
          return { ...p, page: pi, rx: nrx, ry: nry };
        });
      } else if (st.mode === 'resize') {
        updatePlacement(st.id, (p) => {
          const pel = pageEl(p.page);
          if (!pel) return p;
          const rr = pel.getBoundingClientRect();
          const perW = ratioOf(p.page) * imgRatioRef.current || 1;
          // Con la imagen girada, el tirador ya no apunta "a la derecha" en
          // pantalla: se proyecta el desplazamiento del ratón sobre el eje X
          // propio de la imagen para que ensanchar siga sintiéndose natural.
          const t = (rotOf(p) * Math.PI) / 180;
          const dxPx = ev.clientX - st.startClientX;
          const dyPx = ev.clientY - st.startClientY;
          const dx = (dxPx * Math.cos(t) + dyPx * Math.sin(t)) / rr.width;
          const nrw = clamp(st.startRw + dx, MIN_RW, Math.max(MIN_RW, Math.min(1 - p.rx, (1 - p.ry) / perW)));
          return { ...p, rw: nrw };
        });
      } else {
        updatePlacement(st.id, (p) => {
          const pel = pageEl(p.page);
          if (!pel) return p;
          const rr = pel.getBoundingClientRect();
          // Ángulo desde el centro de la imagen hasta el puntero. El tirador
          // nace arriba (−90°), así que se compensa para que 0° sea "sin girar".
          const cx = rr.left + (p.rx + p.rw / 2) * rr.width;
          const cy = rr.top + (p.ry + rhOf(p) / 2) * rr.height;
          let deg = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
          if (ev.shiftKey) deg = Math.round(deg / ROT_SNAP) * ROT_SNAP;
          return { ...p, rot: ((deg % 360) + 360) % 360 };
        });
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      drag.current = null;
      setDragging(false);
      // El `click` que el navegador emite tras soltar debe ignorarse (ver placeAt).
      suppressClick.current = true;
    };

    const imgLeft = r.left + pl.rx * r.width;
    const imgTop = r.top + pl.ry * r.height;
    const imgW = pl.rw * r.width;
    const imgH = rhOf(pl) * r.height;
    drag.current = {
      id,
      mode,
      grabFX: imgW ? (e.clientX - imgLeft) / imgW : 0.5,
      grabFY: imgH ? (e.clientY - imgTop) / imgH : 0.5,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startRw: pl.rw,
      move,
      up,
    };
    setActiveId(id);
    setDragging(true);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const removePlacement = (id: number) => {
    commit(placementsRef.current.filter((p) => p.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  };

  const setActiveSize = (nrw: number) => {
    if (activeId == null) return;
    updatePlacement(activeId, (p) => {
      const perW = ratioOf(p.page) * imgRatioRef.current || 1;
      return { ...p, rw: nrw, rx: clamp(p.rx, 0, Math.max(0, 1 - nrw)), ry: clamp(p.ry, 0, Math.max(0, 1 - nrw * perW)) };
    });
  };

  const apply = async () => {
    if (!file) return;
    if (!imgFile || placements.length === 0) {
      setError(pick(dict, 't.pdfImage.needImage', 'Add an image and place it on the document first.'));
      return;
    }
    setWorking(true);
    setError('');
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const embedded = await embedImage(doc, imgFile);
      const docPages = doc.getPages();
      for (const p of placements) {
        const page = docPages[p.page];
        if (!page) continue;
        const { width: pw, height: ph } = page.getSize();
        const wPt = p.rw * pw;
        const hPt = wPt * imgRatio;

        // Centro deseado, en coordenadas PDF (origen abajo-izquierda).
        const cx = (p.rx + p.rw / 2) * pw;
        const cy = ph - p.ry * ph - hPt / 2;

        // pdf-lib gira alrededor de (x, y) —la esquina inferior izquierda—, no
        // del centro, y su eje Y va al revés que el de CSS (de ahí el signo).
        // Se despeja esa esquina para que el CENTRO caiga donde el usuario lo
        // dejó: (x, y) = centro − R(θ)·(w/2, h/2).
        const t = (-rotOf(p) * Math.PI) / 180;
        const cos = Math.cos(t);
        const sin = Math.sin(t);
        const x = cx - ((wPt / 2) * cos - (hPt / 2) * sin);
        const y = cy - ((wPt / 2) * sin + (hPt / 2) * cos);

        page.drawImage(embedded, { x, y, width: wPt, height: hPt, rotate: degrees(-rotOf(p)), opacity });
      }
      const bytes = await doc.save();
      downloadBlob(bytes, `${file.name.replace(/\.pdf$/i, '')}_image.pdf`);
    } catch {
      setError(pick(dict, 't.pdfImage.error', 'Could not read this PDF (it may be encrypted or corrupt).'));
    } finally {
      setWorking(false);
    }
  };

  const active = placements.find((p) => p.id === activeId) ?? null;

  return (
    <div className="space-y-4">
      {/* Paso 1: cargar PDF (solo hasta que haya documento) */}
      {!file && (
        <>
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
            style={{ padding: '2.5rem 1rem' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
              {rendering
                ? pick(dict, 't.pdfImage.rendering', 'Rendering pages…')
                : pick(dict, 't.pdfImage.dropPdf', 'Drop a PDF here or click to choose')}
            </p>
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
        </>
      )}

      {file && (
        <>
          {/* Barra de acciones */}
          <div className="card" style={{ padding: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.9rem', alignItems: 'center' }}>
            <button type="button" className="btn" onClick={() => imgInputRef.current?.click()} style={{ padding: '0.45rem 0.8rem' }}>
              {imgFile ? pick(dict, 't.pdfImage.replaceImage', 'Change image') : pick(dict, 't.pdfImage.addImage', 'Add image')}
            </button>
            {imgFile && (
              <button type="button" className="btn" onClick={() => addPlacement()} style={{ padding: '0.45rem 0.8rem' }}>
                + {pick(dict, 't.pdfImage.placeAnother', 'Place another')}
              </button>
            )}
            {imgFile && (
              <button
                type="button"
                className={`btn ${cropOpen ? 'btn-primary' : ''}`}
                aria-pressed={cropOpen}
                onClick={() => setCropOpen((v) => !v)}
                style={{ padding: '0.45rem 0.8rem' }}
              >
                {pick(dict, 't.pdfImage.crop', 'Crop')}
              </button>
            )}
            {imgUrl && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                  {pick(dict, 't.pdfImage.image', 'Image')}
                </span>
                <img
                  alt=""
                  src={imgUrl}
                  style={{
                    height: 26,
                    maxWidth: 70,
                    objectFit: 'contain',
                    border: '2px solid var(--color-border-strong)',
                    background: '#fff',
                  }}
                />
              </span>
            )}
            <span className="font-mono text-xs" style={{ marginLeft: 'auto', color: 'var(--color-fg-muted)' }}>
              {total} {pick(dict, 't.pdfImage.total', 'pages')}
              {total > pages.length ? ` · ${pick(dict, 't.pdfImage.capped', 'showing first')} ${pages.length}` : ''}
              {placements.length ? ` · ${placements.length} ${pick(dict, 't.pdfImage.placed', 'placed')}` : ''}
            </span>
          </div>

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

          {/* Controles de la colocación activa */}
          {active && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="label" htmlFor="pi-rot" style={{ marginBottom: 0 }}>
                    {pick(dict, 't.pdfImage.rotation', 'Rotation')} · {Math.round(rotOf(active))}°
                  </label>
                  {rotOf(active) !== 0 && (
                    <button
                      type="button"
                      className="tag"
                      onClick={() => updatePlacement(active.id, (p) => ({ ...p, rot: 0 }))}
                      style={{ cursor: 'pointer', padding: '0 0.4rem' }}
                    >
                      {pick(dict, 't.pdfImage.reset', 'Reset')}
                    </button>
                  )}
                </div>
                <input
                  id="pi-rot"
                  type="range"
                  min={0}
                  max={359}
                  value={Math.round(rotOf(active))}
                  onChange={(e) => updatePlacement(active.id, (p) => ({ ...p, rot: Number(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label className="label" htmlFor="pi-size">
                  {pick(dict, 't.pdfImage.size', 'Size')} · {Math.round(active.rw * 100)}%
                </label>
                <input
                  id="pi-size"
                  type="range"
                  min={4}
                  max={100}
                  value={Math.round(active.rw * 100)}
                  onChange={(e) => setActiveSize(Number(e.target.value) / 100)}
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
            </div>
          )}

          {imgFile && (
            <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
              {pick(dict, 't.pdfImage.dragAcross', 'Drag the image onto any page · drag its corner to resize')}
            </p>
          )}

          {/* Panel de recorte: se trabaja siempre sobre la imagen original */}
          {cropOpen && origUrl && (
            <div className="card" style={{ padding: '0.85rem' }}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button type="button" className="btn" onClick={autoTrim} style={{ padding: '0.4rem 0.7rem' }}>
                  {pick(dict, 't.pdfImage.autoTrim', 'Auto-trim margins')}
                </button>
                <button type="button" className="btn" onClick={() => setCropState(FULL_CROP)} style={{ padding: '0.4rem 0.7rem' }}>
                  {pick(dict, 't.pdfImage.cropReset', 'Whole image')}
                </button>
                <button type="button" className="btn btn-primary" onClick={applyCrop} style={{ padding: '0.4rem 0.7rem' }}>
                  {pick(dict, 't.pdfImage.cropApply', 'Apply crop')}
                </button>
                <button type="button" className="btn" onClick={() => setCropOpen(false)} style={{ padding: '0.4rem 0.7rem' }}>
                  {pick(dict, 't.pdfImage.cropCancel', 'Cancel')}
                </button>
                <span className="font-mono text-xs" style={{ marginLeft: 'auto', color: 'var(--color-fg-muted)' }}>
                  {Math.round(crop.w * 100)}% × {Math.round(crop.h * 100)}%
                </span>
              </div>

              <p className="mb-2 text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                {pick(dict, 't.pdfImage.cropHint', 'Drag inside to move the crop box, or its corners to resize.')}
              </p>

              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  lineHeight: 0,
                  maxWidth: '100%',
                  // El damero deja ver qué zonas de la firma son transparentes.
                  backgroundImage:
                    'linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
                  backgroundColor: '#fff',
                  border: '2px solid var(--color-border-strong)',
                }}
              >
                <img
                  ref={cropImgRef}
                  alt=""
                  src={origUrl}
                  draggable={false}
                  style={{ display: 'block', maxWidth: '100%', maxHeight: 320, userSelect: 'none' }}
                />

                {/* Velo oscuro fuera del recorte, en cuatro franjas. Se hizo así y no
                    con un clip-path porque el polígono degenera cuando el recorte
                    ocupa la imagen entera y el velo acababa tapándola por completo. */}
                {(
                  [
                    { left: 0, top: 0, width: '100%', height: `${crop.y * 100}%` },
                    { left: 0, top: `${(crop.y + crop.h) * 100}%`, width: '100%', bottom: 0 },
                    { left: 0, top: `${crop.y * 100}%`, width: `${crop.x * 100}%`, height: `${crop.h * 100}%` },
                    { left: `${(crop.x + crop.w) * 100}%`, top: `${crop.y * 100}%`, right: 0, height: `${crop.h * 100}%` },
                  ] as React.CSSProperties[]
                ).map((band, i) => (
                  <div key={i} style={{ position: 'absolute', background: 'rgba(0,0,0,.45)', pointerEvents: 'none', ...band }} />
                ))}

                <div
                  onPointerDown={startCropDrag('move')}
                  style={{
                    position: 'absolute',
                    left: `${crop.x * 100}%`,
                    top: `${crop.y * 100}%`,
                    width: `${crop.w * 100}%`,
                    height: `${crop.h * 100}%`,
                    outline: '2px solid var(--color-accent)',
                    cursor: 'move',
                    touchAction: 'none',
                  }}
                >
                  {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
                    <span
                      key={corner}
                      onPointerDown={startCropDrag(corner)}
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        width: 14,
                        height: 14,
                        background: 'var(--color-accent)',
                        border: '2px solid #fff',
                        borderRadius: 2,
                        touchAction: 'none',
                        cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize',
                        [corner.includes('n') ? 'top' : 'bottom']: -7,
                        [corner.includes('w') ? 'left' : 'right']: -7,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Visor del documento (todas las páginas apiladas) */}
          <div
            ref={stageRef}
            className="card"
            style={{
              maxHeight: '70vh',
              overflow: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              background: 'var(--color-bg-raised)',
            }}
          >
            {pages.map((pg, i) => {
              const here = placements.filter((p) => p.page === i);
              return (
                <div
                  key={i}
                  data-page={i}
                  onClick={(e) => placeAt(i, e)}
                  style={{
                    position: 'relative',
                    width: PREVIEW_W,
                    maxWidth: '100%',
                    boxShadow: '0 1px 6px rgba(0,0,0,.25)',
                    cursor: imgFile ? 'crosshair' : 'default',
                  }}
                >
                  <img
                    alt={`${pick(dict, 't.pdfImage.page', 'Page')} ${i + 1}`}
                    src={pg.url}
                    draggable={false}
                    style={{ display: 'block', width: '100%', height: 'auto', userSelect: 'none' }}
                  />
                  <span
                    className="font-mono"
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      fontSize: '0.6rem',
                      padding: '0 4px',
                      background: 'rgba(0,0,0,.55)',
                      color: '#fff',
                      borderRadius: 2,
                    }}
                  >
                    {i + 1}
                  </span>

                  {here.map((p) => {
                    const isActive = p.id === activeId;
                    return (
                      <div
                        key={p.id}
                        onPointerDown={startDrag(p.id, 'move')}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveId(p.id);
                        }}
                        role="button"
                        aria-label={pick(dict, 't.pdfImage.dragAcross', 'Drag the image onto any page, drag its corner to resize')}
                        style={{
                          position: 'absolute',
                          left: `${p.rx * 100}%`,
                          top: `${p.ry * 100}%`,
                          width: `${p.rw * 100}%`,
                          height: `${rhOf(p) * 100}%`,
                          transform: rotOf(p) ? `rotate(${rotOf(p)}deg)` : undefined,
                          cursor: dragging ? 'grabbing' : 'grab',
                          touchAction: 'none',
                          outline: `2px solid ${isActive ? 'var(--color-accent)' : 'rgba(120,120,120,.7)'}`,
                          outlineOffset: 0,
                          boxShadow: isActive ? '0 0 0 1px rgba(255,255,255,.7)' : 'none',
                          // Durante el arrastre, todas las colocaciones dejan pasar el puntero
                          // para que elementFromPoint encuentre la página de debajo.
                          pointerEvents: dragging ? 'none' : 'auto',
                        }}
                      >
                        <img
                          alt=""
                          src={imgUrl}
                          draggable={false}
                          style={{ width: '100%', height: '100%', objectFit: 'fill', opacity, userSelect: 'none', pointerEvents: 'none' }}
                        />
                        {isActive && (
                          <>
                            {/* Tirador de giro: sale por arriba, como en las apps de diseño. */}
                            <span
                              onPointerDown={startDrag(p.id, 'rotate')}
                              aria-hidden="true"
                              style={{
                                position: 'absolute',
                                left: '50%',
                                top: -26,
                                marginLeft: -8,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: 'var(--color-accent)',
                                border: '2px solid #fff',
                                cursor: 'grab',
                                touchAction: 'none',
                                boxShadow: '0 1px 3px rgba(0,0,0,.4)',
                              }}
                            />
                            <span
                              aria-hidden="true"
                              style={{
                                position: 'absolute',
                                left: '50%',
                                top: -12,
                                width: 2,
                                height: 12,
                                marginLeft: -1,
                                background: 'var(--color-accent)',
                                pointerEvents: 'none',
                              }}
                            />
                            <span
                              onPointerDown={startDrag(p.id, 'resize')}
                              aria-hidden="true"
                              style={{
                                position: 'absolute',
                                right: -8,
                                bottom: -8,
                                width: 16,
                                height: 16,
                                borderRadius: 3,
                                background: 'var(--color-accent)',
                                border: '2px solid #fff',
                                cursor: 'nwse-resize',
                                touchAction: 'none',
                                boxShadow: '0 1px 3px rgba(0,0,0,.4)',
                              }}
                            />
                            <button
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                removePlacement(p.id);
                              }}
                              aria-label={pick(dict, 't.pdfImage.remove', 'Remove')}
                              title={pick(dict, 't.pdfImage.remove', 'Remove')}
                              style={{
                                position: 'absolute',
                                right: -10,
                                top: -10,
                                width: 20,
                                height: 20,
                                padding: 0,
                                borderRadius: '50%',
                                border: '2px solid #fff',
                                background: 'var(--color-accent-2, #d33)',
                                color: '#fff',
                                fontSize: 11,
                                lineHeight: 1,
                                cursor: 'pointer',
                              }}
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}

      {file && (
        <button type="button" className="btn btn-primary" onClick={apply} disabled={!imgFile || placements.length === 0 || working}>
          {working ? pick(dict, 't.pdfImage.working', 'Inserting…') : pick(dict, 't.pdfImage.apply', 'Download PDF with the image')}
        </button>
      )}
    </div>
  );
}
