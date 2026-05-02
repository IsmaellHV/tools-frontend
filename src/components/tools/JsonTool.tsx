import { useMemo, useState } from 'react';
import CopyButton from '~/components/CopyButton';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

type View = 'tree' | 'raw';

interface NodeProps {
  name?: string;
  value: unknown;
  depth: number;
}

function valueColor(v: unknown): string {
  if (typeof v === 'string') return 'var(--color-accent-2)';
  if (typeof v === 'number' || typeof v === 'boolean') return 'var(--color-accent)';
  if (v === null) return 'var(--color-fg-muted)';
  return 'var(--color-fg)';
}

function Node({ name, value, depth }: NodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const isObj = value !== null && typeof value === 'object';
  const isArr = Array.isArray(value);

  if (!isObj) {
    return (
      <div style={{ paddingLeft: depth * 14 }}>
        {name !== undefined && <span style={{ color: 'var(--color-fg-muted)' }}>{JSON.stringify(name)}: </span>}
        <span style={{ color: valueColor(value) }}>{typeof value === 'string' ? `"${value}"` : String(value)}</span>
      </div>
    );
  }

  const entries = isArr ? (value as unknown[]).map((v, i) => [String(i), v] as const) : Object.entries(value as Record<string, unknown>);
  const open_ch = isArr ? '[' : '{';
  const close_ch = isArr ? ']' : '}';

  return (
    <div style={{ paddingLeft: depth * 14 }}>
      <div className="cursor-pointer select-none" onClick={() => setOpen((o) => !o)}>
        <span style={{ color: 'var(--color-fg-muted)' }}>
          {name !== undefined ? `${JSON.stringify(name)}: ` : ''}
          {open ? '▾' : '▸'} {open_ch} {!open && `${entries.length} ${isArr ? 'items' : 'keys'}`} {!open && close_ch}
        </span>
      </div>
      {open && (
        <>
          {entries.map(([k, v]) => (
            <Node key={k} name={isArr ? undefined : k} value={v} depth={depth + 1} />
          ))}
          <div style={{ paddingLeft: 0, color: 'var(--color-fg-muted)' }}>{close_ch}</div>
        </>
      )}
    </div>
  );
}

export default function JsonTool({ dict }: Props) {
  const [input, setInput] = useState('');
  const [view, setView] = useState<View>('tree');

  const parsed = useMemo(() => {
    if (!input.trim()) return { ok: true as const, value: undefined };
    try {
      return { ok: true as const, value: JSON.parse(input) as unknown };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [input]);

  const formatted = parsed.ok && parsed.value !== undefined ? JSON.stringify(parsed.value, null, 2) : '';

  return (
    <div className="space-y-4">
      <div>
        <label className="label">{pick(dict, 'ui.input', 'Input')}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={pick(dict, 't.json.placeholder', '')}
          style={{ minHeight: '10rem' }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="btn"
          disabled={!parsed.ok || parsed.value === undefined}
          onClick={() => parsed.ok && parsed.value !== undefined && setInput(JSON.stringify(parsed.value, null, 2))}
        >
          {pick(dict, 't.json.format', 'Format')}
        </button>
        <button
          className="btn"
          disabled={!parsed.ok || parsed.value === undefined}
          onClick={() => parsed.ok && parsed.value !== undefined && setInput(JSON.stringify(parsed.value))}
        >
          {pick(dict, 't.json.minify', 'Minify')}
        </button>
        <button className={`btn ${view === 'tree' ? 'btn-primary' : ''}`} onClick={() => setView('tree')}>
          {pick(dict, 't.json.tree', 'Tree')}
        </button>
        <button className={`btn ${view === 'raw' ? 'btn-primary' : ''}`} onClick={() => setView('raw')}>
          {pick(dict, 't.json.raw', 'Raw')}
        </button>
        <CopyButton text={formatted} dict={dict} />
        <button className="btn" onClick={() => setInput('')} disabled={!input}>
          {pick(dict, 'ui.clear', 'Clear')}
        </button>
      </div>

      {!parsed.ok && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {parsed.error}
        </p>
      )}

      {parsed.ok && parsed.value !== undefined && (
        <div className="card overflow-auto" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          {view === 'tree' ? <Node value={parsed.value} depth={0} /> : <pre style={{ margin: 0 }}>{formatted}</pre>}
        </div>
      )}
    </div>
  );
}
