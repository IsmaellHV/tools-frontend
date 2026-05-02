import { useMemo, useState } from 'react';
import CopyButton from '~/components/CopyButton';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

type Mode = 'encode' | 'decode';

const encode = (s: string): string => {
  // UTF-8 safe base64 encode
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

const decode = (s: string): string => {
  const bin = atob(s.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

export default function Base64Tool({ dict }: Props) {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    if (!input) return { ok: true, value: '' };
    try {
      return { ok: true, value: mode === 'encode' ? encode(input) : decode(input) };
    } catch {
      return { ok: false, value: pick(dict, 'ui.invalid', 'Invalid input') };
    }
  }, [input, mode, dict]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={`btn ${mode === 'encode' ? 'btn-primary' : ''}`} onClick={() => setMode('encode')}>
          {pick(dict, 't.b64.encode', 'Encode')}
        </button>
        <button className={`btn ${mode === 'decode' ? 'btn-primary' : ''}`} onClick={() => setMode('decode')}>
          {pick(dict, 't.b64.decode', 'Decode')}
        </button>
      </div>

      <div>
        <label className="label">{pick(dict, 'ui.input', 'Input')}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? pick(dict, 't.b64.placeholderEnc', '') : pick(dict, 't.b64.placeholderDec', '')}
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="label" style={{ marginBottom: 0 }}>
            {pick(dict, 'ui.output', 'Output')}
          </label>
          <div className="flex gap-2">
            <CopyButton text={result.ok ? result.value : ''} dict={dict} />
            <button className="btn" onClick={() => setInput('')} disabled={!input}>
              {pick(dict, 'ui.clear', 'Clear')}
            </button>
          </div>
        </div>
        <textarea readOnly value={result.value} style={result.ok ? undefined : { color: 'var(--color-accent-2)' }} />
      </div>
    </div>
  );
}
