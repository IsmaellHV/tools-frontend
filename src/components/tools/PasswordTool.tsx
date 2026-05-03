import { useCallback, useEffect, useMemo, useState } from 'react';
import CopyButton from '~/components/CopyButton';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?/~';

const MIN_LEN = 4;
const MAX_LEN = 128;

interface CharOptions {
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}

function buildCharset(opts: CharOptions): string {
  let chars = '';
  if (opts.upper) chars += UPPER;
  if (opts.lower) chars += LOWER;
  if (opts.numbers) chars += NUMBERS;
  if (opts.symbols) chars += SYMBOLS;
  return chars;
}

// Cryptographically strong random index using crypto.getRandomValues
// with rejection sampling to avoid modulo bias.
function secureRandomIndex(max: number): number {
  if (max <= 0) return 0;
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let r: number;
  do {
    crypto.getRandomValues(buf);
    r = buf[0];
  } while (r >= limit);
  return r % max;
}

function generatePassword(length: number, opts: CharOptions): string {
  const chars = buildCharset(opts);
  if (!chars) return '';
  // Guarantee at least one of each selected category, then fill the rest
  const guaranteed: string[] = [];
  if (opts.upper) guaranteed.push(UPPER[secureRandomIndex(UPPER.length)]);
  if (opts.lower) guaranteed.push(LOWER[secureRandomIndex(LOWER.length)]);
  if (opts.numbers) guaranteed.push(NUMBERS[secureRandomIndex(NUMBERS.length)]);
  if (opts.symbols) guaranteed.push(SYMBOLS[secureRandomIndex(SYMBOLS.length)]);

  const out: string[] = [...guaranteed];
  while (out.length < length) {
    out.push(chars[secureRandomIndex(chars.length)]);
  }
  // Trim if guaranteed exceeded length (length < count of selected sets)
  out.length = length;
  // Fisher-Yates shuffle
  for (let i = out.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join('');
}

// Returns a 0..4 strength score based on length + variety.
function passwordStrength(pwd: string, opts: CharOptions): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0;
  const variety =
    Number(opts.upper) + Number(opts.lower) + Number(opts.numbers) + Number(opts.symbols);
  const len = pwd.length;
  // Rough entropy estimate: log2(charsetSize) * length, mapped to bands.
  const charsetSize =
    (opts.upper ? 26 : 0) + (opts.lower ? 26 : 0) + (opts.numbers ? 10 : 0) + (opts.symbols ? SYMBOLS.length : 0);
  const entropy = charsetSize > 0 ? Math.log2(charsetSize) * len : 0;
  if (variety <= 1 && len < 8) return 0;
  if (entropy < 40) return 1;
  if (entropy < 60) return 2;
  if (entropy < 100) return 3;
  return 4;
}

export default function PasswordTool({ dict }: Props) {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState<CharOptions>({ upper: true, lower: true, numbers: true, symbols: false });
  const [pwd, setPwd] = useState('');

  const charsetEmpty = !opts.upper && !opts.lower && !opts.numbers && !opts.symbols;

  const regenerate = useCallback(() => {
    if (charsetEmpty) {
      setPwd('');
      return;
    }
    setPwd(generatePassword(length, opts));
  }, [length, opts, charsetEmpty]);

  // Generate on mount + whenever length or options change
  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const strength = useMemo(() => passwordStrength(pwd, opts), [pwd, opts]);

  const strengthLabels = [
    pick(dict, 't.pwd.strength.veryWeak', 'Very weak'),
    pick(dict, 't.pwd.strength.weak', 'Weak'),
    pick(dict, 't.pwd.strength.fair', 'Fair'),
    pick(dict, 't.pwd.strength.strong', 'Strong'),
    pick(dict, 't.pwd.strength.veryStrong', 'Very strong'),
  ];
  const strengthColors = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#16a34a'];

  const setOpt = (k: keyof CharOptions, v: boolean) => setOpts((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <p style={{ color: 'var(--color-fg-muted)' }}>{pick(dict, 't.pwd.intro', '')}</p>

      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={pwd}
            readOnly
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '15px',
              letterSpacing: '0.02em',
              wordBreak: 'break-all',
              padding: '12px 14px',
              background: 'var(--color-bg-raised)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: '6px',
              color: 'var(--color-fg)',
            }}
          />
          <button
            type="button"
            className="btn"
            onClick={regenerate}
            title={pick(dict, 't.pwd.regenerate', 'Regenerate')}
            aria-label={pick(dict, 't.pwd.regenerate', 'Regenerate')}
            disabled={charsetEmpty}
          >
            ↻
          </button>
          <CopyButton text={pwd} dict={dict} className="btn btn-primary" />
        </div>

        <div style={{ marginTop: 12 }}>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: 'var(--color-border)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${((strength + 1) / 5) * 100}%`,
                height: '100%',
                background: strengthColors[strength],
                transition: 'width 0.25s ease, background 0.25s ease',
              }}
            />
          </div>
          <div
            style={{
              marginTop: 6,
              display: 'flex',
              justifyContent: 'flex-end',
              fontSize: 12,
              color: strengthColors[strength],
              fontWeight: 600,
            }}
          >
            ● {strengthLabels[strength]}
          </div>
          {charsetEmpty && (
            <p style={{ marginTop: 6, fontSize: 12, color: 'var(--color-accent-2, #dc2626)' }}>
              {pick(dict, 't.pwd.errNoChars', 'Select at least one character set.')}
            </p>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <label className="label" style={{ marginBottom: 0, minWidth: 100 }}>
            {pick(dict, 't.pwd.length', 'Length')}
          </label>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              fontSize: 16,
              minWidth: 36,
              textAlign: 'center',
            }}
          >
            {length}
          </span>
          <input
            type="range"
            min={MIN_LEN}
            max={MAX_LEN}
            step={1}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            style={{ flex: 1, minWidth: 180 }}
          />
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <label className="label" style={{ marginBottom: 0, minWidth: 100 }}>
            {pick(dict, 't.pwd.charsUsed', 'Characters used')}
          </label>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Checkbox checked={opts.upper} onChange={(v) => setOpt('upper', v)} label={pick(dict, 't.pwd.upper', 'Uppercase')} />
            <Checkbox checked={opts.lower} onChange={(v) => setOpt('lower', v)} label={pick(dict, 't.pwd.lower', 'Lowercase')} />
            <Checkbox checked={opts.numbers} onChange={(v) => setOpt('numbers', v)} label={pick(dict, 't.pwd.numbers', 'Numbers')} />
            <Checkbox checked={opts.symbols} onChange={(v) => setOpt('symbols', v)} label={pick(dict, 't.pwd.symbols', 'Symbols')} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 16, height: 16 }} />
      <span style={{ fontSize: 14 }}>{label}</span>
    </label>
  );
}
