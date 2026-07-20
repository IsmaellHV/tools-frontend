import { useMemo, useState } from 'react';
import CopyButton from '~/components/CopyButton';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';
import { diffText, toUnifiedText, type Row, type Seg } from '~/lib/diff';

interface Props {
  dict: Dict;
}

type View = 'split' | 'unified';

const CONTEXT = 2;

// Fila colapsada que representa N líneas iguales ocultas.
interface Gap {
  gap: number;
}
type Item = Row | Gap;
const isGap = (x: Item): x is Gap => 'gap' in x;

const bgFor = (type: Row['type'], side: 'l' | 'r'): string | undefined => {
  if (type === 'eq') return undefined;
  if (type === 'mod') return side === 'l' ? 'var(--color-diff-del-bg)' : 'var(--color-diff-add-bg)';
  if (type === 'del') return side === 'l' ? 'var(--color-diff-del-bg)' : 'var(--color-bg-raised)';
  return side === 'r' ? 'var(--color-diff-add-bg)' : 'var(--color-bg-raised)';
};

const CELL: React.CSSProperties = {
  padding: '0.15rem 0.5rem',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  minWidth: 0,
};

const NUM: React.CSSProperties = {
  padding: '0.15rem 0.4rem',
  textAlign: 'right',
  color: 'var(--color-fg-muted)',
  userSelect: 'none',
  borderRight: '1px solid var(--color-border)',
};

function Segments({ segs, text, kind }: { segs?: Seg[]; text?: string; kind: 'add' | 'del' }) {
  if (!segs) return <>{text ?? ''}</>;
  return (
    <>
      {segs.map((s, i) =>
        s.k === 'eq' ? (
          <span key={i}>{s.t}</span>
        ) : (
          <span
            key={i}
            style={{
              background: kind === 'add' ? 'var(--color-diff-add-strong)' : 'var(--color-diff-del-strong)',
              color: kind === 'add' ? 'var(--color-diff-add)' : 'var(--color-diff-del)',
              fontWeight: 700,
            }}
          >
            {s.t}
          </span>
        ),
      )}
    </>
  );
}

export default function TextDiffTool({ dict }: Props) {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [view, setView] = useState<View>('split');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [onlyDiff, setOnlyDiff] = useState(false);

  const result = useMemo(
    () => diffText(left, right, { ignoreCase, ignoreWhitespace }),
    [left, right, ignoreCase, ignoreWhitespace],
  );

  const changed = result.added + result.removed + result.modified;
  const hasInput = left.length > 0 || right.length > 0;

  // Colapsa tramos largos de líneas iguales dejando CONTEXT líneas de contexto.
  const items = useMemo<Item[]>(() => {
    if (!onlyDiff) return result.rows as Item[];
    const out: Item[] = [];
    const rows = result.rows;
    let i = 0;
    while (i < rows.length) {
      if (rows[i].type !== 'eq') {
        out.push(rows[i]);
        i++;
        continue;
      }
      let j = i;
      while (j < rows.length && rows[j].type === 'eq') j++;
      const run = j - i;
      const head = i === 0 ? 0 : CONTEXT;
      const tail = j === rows.length ? 0 : CONTEXT;
      if (run <= head + tail) {
        for (let k = i; k < j; k++) out.push(rows[k]);
      } else {
        for (let k = i; k < i + head; k++) out.push(rows[k]);
        out.push({ gap: run - head - tail });
        for (let k = j - tail; k < j; k++) out.push(rows[k]);
      }
      i = j;
    }
    return out;
  }, [result.rows, onlyDiff]);

  const swap = () => {
    setLeft(right);
    setRight(left);
  };

  const clearAll = () => {
    setLeft('');
    setRight('');
  };

  const gapLabel = (n: number) =>
    `⋯ ${n} ${n === 1 ? pick(dict, 't.textDiff.unchangedLine', 'unchanged line') : pick(dict, 't.textDiff.unchangedLines', 'unchanged lines')}`;

  const linesOf = (s: string) => (s === '' ? 0 : s.replace(/\r\n?/g, '\n').split('\n').length);

  const pane = (
    value: string,
    setValue: (v: string) => void,
    labelKey: 't.textDiff.original' | 't.textDiff.changed',
    labelFallback: string,
    placeholderKey: 't.textDiff.placeholderA' | 't.textDiff.placeholderB',
    placeholderFallback: string,
    accent: string,
  ) => (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="label" style={{ marginBottom: 0, color: accent }}>
          {pick(dict, labelKey, labelFallback)}
        </label>
        <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
          {linesOf(value)} {pick(dict, 't.textDiff.lines', 'lines')}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={pick(dict, placeholderKey, placeholderFallback)}
        spellCheck={false}
        style={{ minHeight: 180, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {pane(left, setLeft, 't.textDiff.original', 'Original', 't.textDiff.placeholderA', 'Paste the original text…', 'var(--color-diff-del)')}
        {pane(right, setRight, 't.textDiff.changed', 'Changed', 't.textDiff.placeholderB', 'Paste the modified text…', 'var(--color-diff-add)')}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={`btn ${view === 'split' ? 'btn-primary' : ''}`} aria-pressed={view === 'split'} onClick={() => setView('split')} style={{ padding: '0.4rem 0.7rem' }}>
          {pick(dict, 't.textDiff.viewSplit', 'Side by side')}
        </button>
        <button type="button" className={`btn ${view === 'unified' ? 'btn-primary' : ''}`} aria-pressed={view === 'unified'} onClick={() => setView('unified')} style={{ padding: '0.4rem 0.7rem' }}>
          {pick(dict, 't.textDiff.viewUnified', 'Inline')}
        </button>
        <span style={{ flex: 1 }} />
        <button type="button" className="btn" onClick={swap} disabled={!hasInput} style={{ padding: '0.4rem 0.7rem' }}>
          ⇄ {pick(dict, 't.textDiff.swap', 'Swap')}
        </button>
        <CopyButton text={toUnifiedText(result.rows)} dict={dict} />
        <button type="button" className="btn" onClick={clearAll} disabled={!hasInput} style={{ padding: '0.4rem 0.7rem' }}>
          {pick(dict, 'ui.clear', 'Clear')}
        </button>
      </div>

      <div className="flex flex-wrap gap-4" style={{ fontSize: '0.85rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} style={{ width: 'auto' }} />
          {pick(dict, 't.textDiff.ignoreCase', 'Ignore case')}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} style={{ width: 'auto' }} />
          {pick(dict, 't.textDiff.ignoreWhitespace', 'Ignore whitespace')}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} style={{ width: 'auto' }} />
          {pick(dict, 't.textDiff.onlyDiff', 'Only differences')}
        </label>
      </div>

      {hasInput && (
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="tag" style={{ borderColor: 'var(--color-diff-add)', color: 'var(--color-diff-add)' }}>
            +{result.added} {pick(dict, 't.textDiff.added', 'added')}
          </span>
          <span className="tag" style={{ borderColor: 'var(--color-diff-del)', color: 'var(--color-diff-del)' }}>
            −{result.removed} {pick(dict, 't.textDiff.removed', 'removed')}
          </span>
          <span className="tag" style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
            ~{result.modified} {pick(dict, 't.textDiff.modified', 'modified')}
          </span>
          <span className="tag" style={{ color: 'var(--color-fg-muted)' }}>
            ={result.same} {pick(dict, 't.textDiff.same', 'unchanged')}
          </span>
          {result.truncated && (
            <span className="tag" style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
              {pick(dict, 't.textDiff.tooLarge', 'Very large input — lines compared position by position.')}
            </span>
          )}
        </div>
      )}

      {hasInput && changed === 0 && (
        <p className="card font-mono text-sm" style={{ color: 'var(--color-diff-add)', borderColor: 'var(--color-diff-add)' }}>
          ✓ {pick(dict, 't.textDiff.identical', 'Both texts are identical.')}
        </p>
      )}

      {hasInput && changed > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: view === 'split' ? '3.2rem minmax(0, 1fr) 3.2rem minmax(0, 1fr)' : '3.2rem 3.2rem minmax(0, 1fr)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                lineHeight: 1.5,
                minWidth: view === 'split' ? 520 : 320,
              }}
            >
              {items.map((it, idx) => {
                if (isGap(it)) {
                  return (
                    <div
                      key={`g${idx}`}
                      style={{
                        gridColumn: '1 / -1',
                        padding: '0.2rem 0.5rem',
                        background: 'var(--color-bg-raised)',
                        color: 'var(--color-fg-muted)',
                        borderTop: '1px solid var(--color-border)',
                        borderBottom: '1px solid var(--color-border)',
                        textAlign: 'center',
                      }}
                    >
                      {gapLabel(it.gap)}
                    </div>
                  );
                }

                if (view === 'split') {
                  return (
                    <div key={idx} style={{ display: 'contents' }}>
                      <div style={{ ...NUM, background: bgFor(it.type, 'l') }}>{it.ln ?? ''}</div>
                      <div style={{ ...CELL, background: bgFor(it.type, 'l'), color: it.type === 'del' || it.type === 'mod' ? 'var(--color-fg)' : undefined }}>
                        {it.type === 'add' ? '' : <Segments segs={it.lSegs} text={it.left} kind="del" />}
                      </div>
                      <div style={{ ...NUM, background: bgFor(it.type, 'r'), borderLeft: '2px solid var(--color-border-strong)' }}>{it.rn ?? ''}</div>
                      <div style={{ ...CELL, background: bgFor(it.type, 'r') }}>
                        {it.type === 'del' ? '' : <Segments segs={it.rSegs} text={it.right} kind="add" />}
                      </div>
                    </div>
                  );
                }

                // Inline: una línea por lado; 'mod' se expande en - y +.
                const lines: { sign: string; ln?: number; rn?: number; body: React.ReactNode; bg?: string }[] = [];
                if (it.type === 'eq') lines.push({ sign: ' ', ln: it.ln, rn: it.rn, body: it.left });
                if (it.type === 'del' || it.type === 'mod')
                  lines.push({ sign: '−', ln: it.ln, body: <Segments segs={it.lSegs} text={it.left} kind="del" />, bg: 'var(--color-diff-del-bg)' });
                if (it.type === 'add' || it.type === 'mod')
                  lines.push({ sign: '+', rn: it.rn, body: <Segments segs={it.rSegs} text={it.right} kind="add" />, bg: 'var(--color-diff-add-bg)' });

                return (
                  <div key={idx} style={{ display: 'contents' }}>
                    {lines.map((l, k) => (
                      <div key={k} style={{ display: 'contents' }}>
                        <div style={{ ...NUM, background: l.bg }}>{l.ln ?? ''}</div>
                        <div style={{ ...NUM, background: l.bg }}>{l.rn ?? ''}</div>
                        <div style={{ ...CELL, background: l.bg }}>
                          <span style={{ color: l.sign === '+' ? 'var(--color-diff-add)' : l.sign === '−' ? 'var(--color-diff-del)' : 'var(--color-fg-muted)', fontWeight: 700 }}>{l.sign} </span>
                          {l.body}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!hasInput && (
        <p className="font-mono text-sm" style={{ color: 'var(--color-fg-muted)' }}>
          // {pick(dict, 't.textDiff.empty', 'Paste text on both sides to see the differences.')}
        </p>
      )}
    </div>
  );
}
