import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

type Result = { ok: true; rows: Record<string, unknown>[]; cols: string[] } | { ok: false; error: string };

export default function JsonExcelTool({ dict }: Props) {
  const [input, setInput] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');

  const parsed: Result = useMemo(() => {
    if (!input.trim()) return { ok: true, rows: [], cols: [] };
    try {
      const v = JSON.parse(input);
      if (!Array.isArray(v)) return { ok: false, error: pick(dict, 't.j2x.notArray', 'Not an array') };
      const rows = v as Record<string, unknown>[];
      const colSet = new Set<string>();
      for (const r of rows) if (r && typeof r === 'object') Object.keys(r).forEach((k) => colSet.add(k));
      return { ok: true, rows, cols: [...colSet] };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }, [input, dict]);

  const download = (kind: 'xlsx' | 'csv') => {
    if (!parsed.ok || parsed.rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(parsed.rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Sheet1');
    XLSX.writeFile(wb, `data.${kind}`, { bookType: kind });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">{pick(dict, 'ui.input', 'Input')}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={pick(dict, 't.j2x.placeholder', '')}
          style={{ minHeight: '10rem' }}
        />
      </div>

      {!parsed.ok && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {parsed.error}
        </p>
      )}

      {parsed.ok && parsed.rows.length > 0 && (
        <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
          {parsed.rows.length} {pick(dict, 't.j2x.rows', 'rows')} · {parsed.cols.length} {pick(dict, 't.j2x.cols', 'cols')}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">{pick(dict, 't.j2x.sheetName', 'Sheet name')}</label>
          <input value={sheetName} onChange={(e) => setSheetName(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <button className="btn btn-primary" onClick={() => download('xlsx')} disabled={!parsed.ok || parsed.rows.length === 0}>
            {pick(dict, 't.j2x.dlXlsx', 'Download .xlsx')}
          </button>
          <button className="btn" onClick={() => download('csv')} disabled={!parsed.ok || parsed.rows.length === 0}>
            {pick(dict, 't.j2x.dlCsv', 'Download .csv')}
          </button>
        </div>
      </div>

      {parsed.ok && parsed.rows.length > 0 && (
        <div className="card overflow-auto" style={{ maxHeight: '300px' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', width: '100%' }}>
            <thead>
              <tr>
                {parsed.cols.map((c) => (
                  <th key={c} style={{ borderBottom: '1px solid var(--color-border)', padding: '4px 8px', textAlign: 'left' }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsed.rows.slice(0, 50).map((row, i) => (
                <tr key={i}>
                  {parsed.cols.map((c) => (
                    <td key={c} style={{ borderBottom: '1px solid var(--color-border)', padding: '4px 8px' }}>
                      {String(row?.[c] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
