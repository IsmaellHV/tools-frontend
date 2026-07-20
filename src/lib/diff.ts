// Diff de texto 100% local: Myers O(ND) sobre líneas y sobre palabras.
// Sin dependencias — se usa desde el island TextDiffTool.

export type Op = { op: 'eq' | 'del' | 'ins'; a: number; b: number };

// Más allá de esto el trace de Myers (O(D^2) memoria) deja de ser razonable
// en el navegador; el caller hace fallback a un emparejamiento posicional.
export const DIFF_LINE_LIMIT = 4000;

/** Diff de dos secuencias de claves comparables. Devuelve ops en orden. */
export function myersDiff(a: readonly string[], b: readonly string[]): Op[] {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const offset = max;
  const v = new Int32Array(2 * max + 2);
  const trace: Int32Array[] = [];

  let done = false;
  for (let d = 0; d <= max && !done; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]) ? v[offset + k + 1] : v[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) {
        done = true;
        break;
      }
    }
  }

  const ops: Op[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0 && (x > 0 || y > 0); d--) {
    const vv = trace[d];
    const k = x - y;
    const prevK = k === -d || (k !== d && vv[offset + k - 1] < vv[offset + k + 1]) ? k + 1 : k - 1;
    const prevX = vv[offset + prevK];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      x--;
      y--;
      ops.push({ op: 'eq', a: x, b: y });
    }
    if (d > 0) {
      if (x === prevX) {
        y--;
        ops.push({ op: 'ins', a: -1, b: y });
      } else {
        x--;
        ops.push({ op: 'del', a: x, b: -1 });
      }
    }
  }
  ops.reverse();
  return ops;
}

export interface DiffOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
}

export type RowType = 'eq' | 'add' | 'del' | 'mod';
export interface Seg {
  t: string;
  k: 'eq' | 'add' | 'del';
}
export interface Row {
  type: RowType;
  ln?: number; // línea en el texto original (1-based)
  rn?: number; // línea en el texto modificado (1-based)
  left?: string;
  right?: string;
  lSegs?: Seg[];
  rSegs?: Seg[];
}

export interface DiffResult {
  rows: Row[];
  added: number;
  removed: number;
  modified: number;
  same: number;
  truncated: boolean;
}

const lineKey = (s: string, o: DiffOptions): string => {
  let k = s;
  if (o.ignoreWhitespace) k = k.replace(/\s+/g, ' ').trim();
  if (o.ignoreCase) k = k.toLowerCase();
  return k;
};

// Palabras, espacios y signos sueltos: así el resaltado marca `name` dentro de
// `hello(name)` en vez de todo el token.
const tokenize = (s: string): string[] => s.match(/[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu) ?? [];

const tokenKey = (s: string, o: DiffOptions): string => {
  if (/^\s+$/.test(s)) return o.ignoreWhitespace ? ' ' : s;
  return o.ignoreCase ? s.toLowerCase() : s;
};

const pushSeg = (segs: Seg[], k: Seg['k'], t: string) => {
  const last = segs[segs.length - 1];
  if (last && last.k === k) last.t += t;
  else segs.push({ k, t });
};

/** Diff a nivel de palabra dentro de un par de líneas modificadas. */
export function wordDiff(left: string, right: string, o: DiffOptions): { l: Seg[]; r: Seg[] } {
  const at = tokenize(left);
  const bt = tokenize(right);
  const ops = myersDiff(
    at.map((t) => tokenKey(t, o)),
    bt.map((t) => tokenKey(t, o)),
  );
  const l: Seg[] = [];
  const r: Seg[] = [];
  for (const op of ops) {
    if (op.op === 'eq') {
      pushSeg(l, 'eq', at[op.a]);
      pushSeg(r, 'eq', bt[op.b]);
    } else if (op.op === 'del') {
      pushSeg(l, 'del', at[op.a]);
    } else {
      pushSeg(r, 'add', bt[op.b]);
    }
  }
  return { l, r };
}

const splitLines = (s: string): string[] => (s === '' ? [] : s.replace(/\r\n?/g, '\n').split('\n'));

/** Emparejamiento posicional para entradas gigantes (evita el coste de Myers). */
function positionalRows(a: string[], b: string[], o: DiffOptions): DiffResult {
  const rows: Row[] = [];
  let added = 0;
  let removed = 0;
  let modified = 0;
  let same = 0;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const l = a[i];
    const r = b[i];
    if (l !== undefined && r !== undefined) {
      if (lineKey(l, o) === lineKey(r, o)) {
        rows.push({ type: 'eq', ln: i + 1, rn: i + 1, left: l, right: r });
        same++;
      } else {
        const { l: ls, r: rs } = wordDiff(l, r, o);
        rows.push({ type: 'mod', ln: i + 1, rn: i + 1, left: l, right: r, lSegs: ls, rSegs: rs });
        modified++;
      }
    } else if (l !== undefined) {
      rows.push({ type: 'del', ln: i + 1, left: l });
      removed++;
    } else {
      rows.push({ type: 'add', rn: i + 1, right: r });
      added++;
    }
  }
  return { rows, added, removed, modified, same, truncated: true };
}

/** Diff línea a línea con resaltado por palabra en las líneas modificadas. */
export function diffText(aRaw: string, bRaw: string, o: DiffOptions): DiffResult {
  const a = splitLines(aRaw);
  const b = splitLines(bRaw);

  if (a.length + b.length > DIFF_LINE_LIMIT * 2) return positionalRows(a, b, o);

  const ops = myersDiff(
    a.map((l) => lineKey(l, o)),
    b.map((l) => lineKey(l, o)),
  );

  const rows: Row[] = [];
  let added = 0;
  let removed = 0;
  let modified = 0;
  let same = 0;

  let i = 0;
  while (i < ops.length) {
    if (ops[i].op === 'eq') {
      const op = ops[i];
      rows.push({ type: 'eq', ln: op.a + 1, rn: op.b + 1, left: a[op.a], right: b[op.b] });
      same++;
      i++;
      continue;
    }
    // Un bloque contiguo de cambios: se emparejan del↔ins para alinear en 2 columnas.
    const dels: number[] = [];
    const inss: number[] = [];
    while (i < ops.length && ops[i].op !== 'eq') {
      if (ops[i].op === 'del') dels.push(ops[i].a);
      else inss.push(ops[i].b);
      i++;
    }
    const n = Math.max(dels.length, inss.length);
    for (let j = 0; j < n; j++) {
      const d = dels[j];
      const s = inss[j];
      if (d !== undefined && s !== undefined) {
        const { l, r } = wordDiff(a[d], b[s], o);
        rows.push({ type: 'mod', ln: d + 1, rn: s + 1, left: a[d], right: b[s], lSegs: l, rSegs: r });
        modified++;
      } else if (d !== undefined) {
        rows.push({ type: 'del', ln: d + 1, left: a[d] });
        removed++;
      } else {
        rows.push({ type: 'add', rn: s + 1, right: b[s] });
        added++;
      }
    }
  }

  return { rows, added, removed, modified, same, truncated: false };
}

/** Texto unificado estilo `diff -u` (sin cabeceras de hunk) para copiar. */
export function toUnifiedText(rows: readonly Row[]): string {
  return rows
    .flatMap((r) => {
      if (r.type === 'eq') return [`  ${r.left ?? ''}`];
      if (r.type === 'del') return [`- ${r.left ?? ''}`];
      if (r.type === 'add') return [`+ ${r.right ?? ''}`];
      return [`- ${r.left ?? ''}`, `+ ${r.right ?? ''}`];
    })
    .join('\n');
}
