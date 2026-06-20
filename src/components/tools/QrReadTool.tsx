import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import CopyButton from '~/components/CopyButton';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

interface HistoryItem {
  value: string;
  ts: number;
  name?: string;
}

const HISTORY_KEY = 'tools_qr_history';
const HISTORY_MAX = 25;

const isUrl = (v: string): boolean => /^https?:\/\//i.test(v.trim());

const decodeImage = (url: string): Promise<string | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, data.width, data.height);
      resolve(code ? code.data : null);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

const loadHistory = (): HistoryItem[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryItem[]).filter((x) => x && typeof x.value === 'string') : [];
  } catch {
    return [];
  }
};

const saveHistory = (items: HistoryItem[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    /* quota / private mode — ignore */
  }
};

export default function QrReadTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [editingTs, setEditingTs] = useState<number | null>(null);

  // Hidrata el historial desde localStorage al montar.
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const pushHistory = useCallback((value: string) => {
    setHistory((prev) => {
      // No duplicar el item mas reciente (re-leer el mismo QR no spamea).
      if (prev[0]?.value === value) return prev;
      const next = [{ value, ts: Date.now() }, ...prev].slice(0, HISTORY_MAX);
      saveHistory(next);
      return next;
    });
  }, []);

  // Pipeline comun para File/Blob venga de input, drop o portapapeles.
  const processBlob = useCallback(
    (blob: Blob) => {
      setError('');
      setResult('');
      const reader = new FileReader();
      reader.onload = async () => {
        const url = String(reader.result || '');
        setPreview(url);
        const value = await decodeImage(url);
        if (value) {
          setResult(value);
          pushHistory(value);
        } else {
          setError(pick(dict, 't.qrRead.notFound', 'No QR found.'));
        }
      };
      reader.readAsDataURL(blob);
    },
    [dict, pushHistory],
  );

  // Boton "Pegar": lee el portapapeles via Async Clipboard API.
  const pasteFromClipboard = useCallback(async () => {
    setError('');
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find((tp) => tp.startsWith('image/'));
        if (imgType) {
          const blob = await item.getType(imgType);
          processBlob(blob);
          return;
        }
      }
      setError(pick(dict, 't.qrRead.pasteEmpty', 'No image in clipboard.'));
    } catch {
      setError(pick(dict, 't.qrRead.pasteError', 'Could not read clipboard.'));
    }
  }, [dict, processBlob]);

  // Ctrl/Cmd + V en cualquier parte del tool: captura imagen del portapapeles.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) {
            e.preventDefault();
            processBlob(f);
            return;
          }
        }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [processBlob]);

  const removeItem = (ts: number) => {
    setHistory((prev) => {
      const next = prev.filter((x) => x.ts !== ts);
      saveHistory(next);
      return next;
    });
  };

  // Asigna/edita el nombre de un item del historial.
  const saveName = (ts: number, raw: string) => {
    const name = raw.trim();
    setHistory((prev) => {
      const next = prev.map((x) => (x.ts === ts ? { ...x, name: name || undefined } : x));
      saveHistory(next);
      return next;
    });
    setEditingTs(null);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const fmtTime = (ts: number): string => {
    try {
      return new Date(ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return '';
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
          if (f && f.type.startsWith('image/')) processBlob(f);
        }}
      >
        <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
          {pick(dict, 't.qrRead.drop', 'Drop QR')}
        </p>
        <p className="mt-1 font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
          {pick(dict, 't.qrRead.pasteHint', 'or paste an image — Ctrl / Cmd + V')}
        </p>
      </div>

      {/* Input fuera del div clickable: evita que su click programatico burbujee
          de vuelta al onClick del div (click reentrante que Chrome bloquea). */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) processBlob(f);
          e.target.value = '';
        }}
      />

      <div>
        <button type="button" className="btn" onClick={pasteFromClipboard}>
          {pick(dict, 'ui.paste', 'Paste')}
        </button>
      </div>

      {preview && (
        <div className="card flex justify-center">
          <img alt="" src={preview} style={{ maxHeight: '300px', maxWidth: '100%' }} />
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}

      {result && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="label" style={{ marginBottom: 0 }}>
              {pick(dict, 't.qrRead.result', 'Result')}
            </label>
            <div className="flex items-center gap-2">
              {isUrl(result) && (
                <a className="btn" href={result.trim()} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  {pick(dict, 't.qrRead.open', 'Open link')}
                </a>
              )}
              <CopyButton text={result} dict={dict} />
            </div>
          </div>
          <textarea readOnly value={result} />
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label" style={{ marginBottom: 0 }}>
            {pick(dict, 't.qrRead.history', 'History')}
          </label>
          {history.length > 0 && (
            <button type="button" className="btn" onClick={clearHistory} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
              {pick(dict, 't.qrRead.clearHistory', 'Clear')}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            // {pick(dict, 't.qrRead.historyEmpty', 'Nothing decoded yet.')}
          </p>
        ) : (
          <ul className="space-y-2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {history.map((item) => (
              <li
                key={item.ts}
                className="card"
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.8rem' }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  {editingTs === item.ts ? (
                    <input
                      autoFocus
                      defaultValue={item.name ?? ''}
                      placeholder={pick(dict, 't.qrRead.namePlaceholder', 'Name this code…')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveName(item.ts, e.currentTarget.value);
                        else if (e.key === 'Escape') setEditingTs(null);
                      }}
                      onBlur={(e) => saveName(item.ts, e.currentTarget.value)}
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', marginBottom: '0.3rem' }}
                    />
                  ) : (
                    item.name && (
                      <p
                        className="text-sm"
                        title={item.name}
                        style={{ margin: 0, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {item.name}
                      </p>
                    )
                  )}
                  <p
                    className="font-mono text-sm"
                    title={item.value}
                    style={{
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: item.name ? 'var(--color-fg-muted)' : 'var(--color-fg)',
                    }}
                  >
                    {item.value}
                  </p>
                  <p className="font-mono text-xs" style={{ margin: 0, color: 'var(--color-fg-muted)' }}>
                    {fmtTime(item.ts)}
                  </p>
                </div>
                {editingTs !== item.ts && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setEditingTs(item.ts)}
                    title={pick(dict, 't.qrRead.rename', 'Rename')}
                    aria-label={pick(dict, 't.qrRead.rename', 'Rename')}
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', flexShrink: 0 }}
                  >
                    ✎
                  </button>
                )}
                {isUrl(item.value) && (
                  <a
                    className="btn"
                    href={item.value.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={pick(dict, 't.qrRead.open', 'Open link')}
                    aria-label={pick(dict, 't.qrRead.open', 'Open link')}
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', textDecoration: 'none', flexShrink: 0 }}
                  >
                    ↗
                  </a>
                )}
                <CopyButton text={item.value} dict={dict} style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', flexShrink: 0 }} />
                <button
                  type="button"
                  className="btn"
                  onClick={() => removeItem(item.ts)}
                  title={pick(dict, 't.qrRead.remove', 'Remove')}
                  aria-label={pick(dict, 't.qrRead.remove', 'Remove')}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', flexShrink: 0 }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
