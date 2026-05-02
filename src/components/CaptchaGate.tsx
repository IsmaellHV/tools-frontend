import { useEffect, useState, type ReactNode } from 'react';
import Turnstile from 'react-turnstile';
import { isUnlocked, markUnlocked } from '~/lib/captcha';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  siteKey: string;
  dict: Dict;
  children: ReactNode;
}

export default function CaptchaGate({ siteKey, dict, children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'failed'>('idle');
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setUnlocked(isUnlocked());
  }, []);

  if (unlocked) return <>{children}</>;

  return (
    <div className="card mx-auto max-w-md text-center">
      <h2 className="mb-1 text-lg font-semibold">{pick(dict, 'gate.title', 'Quick check')}</h2>
      <p className="mb-4 text-sm" style={{ color: 'var(--color-fg-muted)' }}>
        {pick(dict, 'gate.body', '')}
      </p>

      <div className="flex justify-center">
        <Turnstile
          key={nonce}
          sitekey={siteKey}
          action="tools-gate"
          onVerify={() => {
            setStatus('verifying');
            markUnlocked();
            setUnlocked(true);
          }}
          onError={() => setStatus('failed')}
          onExpire={() => setStatus('failed')}
          theme="auto"
        />
      </div>

      {status === 'verifying' && (
        <p className="mt-3 text-sm" style={{ color: 'var(--color-accent)' }}>
          {pick(dict, 'gate.unlocked', 'Unlocked.')}
        </p>
      )}
      {status === 'failed' && (
        <div className="mt-3">
          <p className="mb-2 text-sm" style={{ color: 'var(--color-accent-2)' }}>
            {pick(dict, 'gate.failed', 'Failed.')}
          </p>
          <button className="btn" onClick={() => setNonce((n) => n + 1)}>
            {pick(dict, 'gate.retry', 'Retry')}
          </button>
        </div>
      )}
    </div>
  );
}
