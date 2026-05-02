import { useMemo, useState } from 'react';
import CopyButton from '~/components/CopyButton';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

const b64urlDecode = (s: string): string => {
  const norm = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = norm.length % 4 === 0 ? '' : '='.repeat(4 - (norm.length % 4));
  const bin = atob(norm + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

interface Decoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  exp?: number;
}

const fmtDuration = (ms: number): string => {
  const sign = ms < 0 ? '-' : '';
  const s = Math.abs(Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${sign}${d}d ${h}h ${m}m`;
  if (h > 0) return `${sign}${h}h ${m}m`;
  if (m > 0) return `${sign}${m}m ${sec}s`;
  return `${sign}${sec}s`;
};

export default function JwtTool({ dict }: Props) {
  const [token, setToken] = useState('');

  const decoded = useMemo<{ ok: true; data: Decoded } | { ok: false; error: string } | null>(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split('.');
    if (parts.length !== 3) return { ok: false, error: pick(dict, 't.jwt.invalid', 'Invalid JWT') };
    try {
      const header = JSON.parse(b64urlDecode(parts[0])) as Record<string, unknown>;
      const payload = JSON.parse(b64urlDecode(parts[1])) as Record<string, unknown>;
      const exp = typeof payload.exp === 'number' ? payload.exp : undefined;
      return { ok: true, data: { header, payload, signature: parts[2], exp } };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }, [token, dict]);

  const now = Date.now();
  const expMs = decoded?.ok && decoded.data.exp ? decoded.data.exp * 1000 : null;
  const expired = expMs !== null && expMs < now;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="label" style={{ marginBottom: 0 }}>
            JWT
          </label>
          <button className="btn" onClick={() => setToken('')} disabled={!token}>
            {pick(dict, 'ui.clear', 'Clear')}
          </button>
        </div>
        <textarea value={token} onChange={(e) => setToken(e.target.value)} placeholder={pick(dict, 't.jwt.placeholder', '')} />
      </div>

      {decoded && !decoded.ok && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {decoded.error}
        </p>
      )}

      {decoded?.ok && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="label" style={{ marginBottom: 0 }}>
                  {pick(dict, 't.jwt.header', 'Header')}
                </label>
                <CopyButton text={JSON.stringify(decoded.data.header, null, 2)} dict={dict} />
              </div>
              <pre className="card overflow-auto" style={{ fontSize: '0.8rem', margin: 0 }}>
                {JSON.stringify(decoded.data.header, null, 2)}
              </pre>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="label" style={{ marginBottom: 0 }}>
                  {pick(dict, 't.jwt.payload', 'Payload')}
                </label>
                <CopyButton text={JSON.stringify(decoded.data.payload, null, 2)} dict={dict} />
              </div>
              <pre className="card overflow-auto" style={{ fontSize: '0.8rem', margin: 0 }}>
                {JSON.stringify(decoded.data.payload, null, 2)}
              </pre>
            </div>
          </div>

          {expMs !== null && (
            <div className="card">
              <p style={{ color: expired ? 'var(--color-accent-2)' : 'var(--color-accent)' }}>
                {expired ? pick(dict, 't.jwt.expired', 'Expired') : pick(dict, 't.jwt.expIn', 'Expires in')} ·{' '}
                <strong>{fmtDuration(expMs - now)}</strong>
              </p>
              <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                {pick(dict, 't.jwt.expAt', 'Expires at')}: {new Date(expMs).toISOString()}
              </p>
            </div>
          )}

          <div>
            <label className="label">{pick(dict, 't.jwt.signature', 'Signature')}</label>
            <input readOnly value={decoded.data.signature} />
          </div>
        </>
      )}
    </div>
  );
}
