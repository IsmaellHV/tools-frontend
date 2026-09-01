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
/** Caracteres que se confunden al leer o dictar una contrasena. */
const LOOKALIKES = 'Il1O0o|`\'";:,.';

const MIN_LEN = 4;
const MAX_LEN = 128;
const PRESETS = [12, 20, 32, 64];

interface CharOptions {
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}

type Pools = Record<keyof CharOptions, string>;

const without = (set: string, excluded: Set<string>): string => [...set].filter((c) => !excluded.has(c)).join('');

/** Aplica las exclusiones a cada grupo por separado, para no garantizar un
 *  caracter de un grupo que se ha quedado vacio. */
function buildPools(opts: CharOptions, exclude: string, noLookalikes: boolean): Pools {
  const excluded = new Set([...exclude, ...(noLookalikes ? LOOKALIKES : '')]);
  return {
    upper: opts.upper ? without(UPPER, excluded) : '',
    lower: opts.lower ? without(LOWER, excluded) : '',
    numbers: opts.numbers ? without(NUMBERS, excluded) : '',
    symbols: opts.symbols ? without(SYMBOLS, excluded) : '',
  };
}

// Indice aleatorio criptografico con muestreo por rechazo, para no introducir
// el sesgo que tendria un modulo directo sobre el rango de getRandomValues.
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

function generatePassword(length: number, pools: Pools): string {
  const groups = Object.values(pools).filter(Boolean);
  const all = groups.join('');
  if (!all) return '';
  // Un caracter garantizado por grupo activo y no vacio; el resto, libre.
  const out = groups.map((g) => g[secureRandomIndex(g.length)]);
  while (out.length < length) out.push(all[secureRandomIndex(all.length)]);
  out.length = length; // por si hay mas grupos que longitud pedida
  for (let i = out.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join('');
}

const charKind = (c: string): 'digit' | 'symbol' | 'letter' =>
  NUMBERS.includes(c) ? 'digit' : SYMBOLS.includes(c) || !/[a-z]/i.test(c) ? 'symbol' : 'letter';

const KIND_COLOR: Record<ReturnType<typeof charKind>, string> = {
  letter: 'var(--color-fg)',
  digit: 'var(--color-accent)',
  symbol: 'var(--color-accent-2)',
};

export default function PasswordTool({ dict }: Props) {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState<CharOptions>({ upper: true, lower: true, numbers: true, symbols: true });
  const [exclude, setExclude] = useState('');
  const [noLookalikes, setNoLookalikes] = useState(false);
  const [pwd, setPwd] = useState('');

  const t = (k: string, fb: string) => pick(dict, k as Parameters<typeof pick>[1], fb);

  const pools = useMemo(() => buildPools(opts, exclude, noLookalikes), [opts, exclude, noLookalikes]);
  const alphabet = useMemo(() => Object.values(pools).join(''), [pools]);
  const noneSelected = !opts.upper && !opts.lower && !opts.numbers && !opts.symbols;

  const regenerate = useCallback(() => setPwd(generatePassword(length, pools)), [length, pools]);
  useEffect(() => regenerate(), [regenerate]);

  // Entropia real del alfabeto que queda tras excluir, no del teorico.
  const bits = alphabet.length > 1 ? Math.round(Math.log2(alphabet.length) * length) : 0;
  const level = bits === 0 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 100 ? 3 : 4;
  const labels = [
    t('t.pwd.strength.veryWeak', 'Very weak'),
    t('t.pwd.strength.weak', 'Weak'),
    t('t.pwd.strength.fair', 'Fair'),
    t('t.pwd.strength.strong', 'Strong'),
    t('t.pwd.strength.veryStrong', 'Very strong'),
  ];
  const levelColor = ['#dc2626', '#f97316', '#eab308', '#22c55e', 'var(--color-accent-2)'][level];

  const setOpt = (k: keyof CharOptions, v: boolean) => setOpts((p) => ({ ...p, [k]: v }));
  const SETS: { k: keyof CharOptions; label: string; sample: string }[] = [
    { k: 'upper', label: t('t.pwd.upper', 'Uppercase'), sample: 'A-Z' },
    { k: 'lower', label: t('t.pwd.lower', 'Lowercase'), sample: 'a-z' },
    { k: 'numbers', label: t('t.pwd.numbers', 'Numbers'), sample: '0-9' },
    { k: 'symbols', label: t('t.pwd.symbols', 'Symbols'), sample: '!@#' },
  ];

  return (
    <div className="space-y-4">
      <p style={{ color: 'var(--color-fg-muted)' }}>{t('t.pwd.intro', '')}</p>

      {/* La contrasena se trata como tipografia, no como un campo de formulario:
          cada caracter se colorea por tipo para poder dictarla o teclearla sin dudar. */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '1.4rem 1.25rem',
            background: 'var(--color-bg-raised)',
            borderBottom: '2px solid var(--color-border-strong)',
            minHeight: 116,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {pwd ? (
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 'clamp(1rem, 2.4vw, 1.6rem)',
                fontWeight: 700,
                lineHeight: 1.45,
                letterSpacing: '0.04em',
                wordBreak: 'break-all',
              }}
            >
              {[...pwd].map((c, i) => (
                <span key={i} style={{ color: KIND_COLOR[charKind(c)] }}>
                  {c}
                </span>
              ))}
            </p>
          ) : (
            <p style={{ margin: 0, color: '#dc2626', fontSize: 14 }}>
              {noneSelected ? t('t.pwd.errNoChars', 'Select at least one character set.') : t('t.pwd.errAllExcluded', 'You excluded every available character.')}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: '0.85rem 1.25rem' }}>
          {/* La entropia en bits dice mas que una etiqueta difusa y es la medida
              que de verdad cambia al excluir caracteres. */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, fontSize: 26, color: levelColor }}>{bits}</span>
            <span className="label" style={{ marginBottom: 0 }}>{t('t.pwd.bits', 'bits')}</span>
          </div>

          <div style={{ display: 'flex', gap: 4 }} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{
                  width: 26,
                  height: 10,
                  border: '2px solid var(--color-border-strong)',
                  background: i <= level && bits > 0 ? levelColor : 'transparent',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: levelColor }}>{bits > 0 ? labels[level] : ''}</span>

          <span style={{ flex: 1 }} />
          <button type="button" className="btn" onClick={regenerate} disabled={!pwd} title={t('t.pwd.regenerate', 'Regenerate')}>
            ↻ {t('t.pwd.regenerate', 'Regenerate')}
          </button>
          <CopyButton text={pwd} dict={dict} className="btn btn-primary" />
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label className="label" style={{ marginBottom: 0, minWidth: 92 }} htmlFor="pwd-len">
            {t('t.pwd.length', 'Length')}
          </label>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, fontSize: 20, minWidth: 40 }}>{length}</span>
          <input
            id="pwd-len"
            type="range"
            min={MIN_LEN}
            max={MAX_LEN}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            style={{ flex: 1, minWidth: 160, width: 'auto' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                className={`btn ${length === n ? 'btn-primary' : ''}`}
                aria-pressed={length === n}
                onClick={() => setLength(n)}
                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className="label" style={{ marginBottom: 0, minWidth: 92 }}>{t('t.pwd.charsUsed', 'Characters used')}</span>
          {SETS.map((s) => (
            <button
              key={s.k}
              type="button"
              className={`btn ${opts[s.k] ? 'btn-primary' : ''}`}
              aria-pressed={opts[s.k]}
              onClick={() => setOpt(s.k, !opts[s.k])}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
            >
              {s.label}
              {/* .btn fuerza uppercase y convertia la muestra "a-z" en "A-Z". */}
              <span style={{ opacity: 0.6, marginLeft: 6, fontFamily: 'var(--font-mono, monospace)', textTransform: 'none' }}>{s.sample}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label className="label" style={{ marginBottom: 0, minWidth: 92 }} htmlFor="pwd-exclude">
            {t('t.pwd.exclude', 'Exclude')}
          </label>
          <input
            id="pwd-exclude"
            type="text"
            value={exclude}
            onChange={(e) => setExclude(e.target.value)}
            placeholder={t('t.pwd.excludePlaceholder', 'Characters you never want, e.g. 0OIl')}
            spellCheck={false}
            autoComplete="off"
            style={{ flex: 1, minWidth: 180, width: 'auto', fontFamily: 'var(--font-mono, monospace)' }}
          />
          <button
            type="button"
            className={`btn ${noLookalikes ? 'btn-primary' : ''}`}
            aria-pressed={noLookalikes}
            onClick={() => setNoLookalikes((v) => !v)}
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
            title={LOOKALIKES}
          >
            {t('t.pwd.lookalikes', 'No look-alikes')}
          </button>
        </div>

        <p className="mt-3 font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
          <span style={{ color: KIND_COLOR.letter }}>Aa</span> {t('t.pwd.legendLetters', 'letters')} ·{' '}
          <span style={{ color: KIND_COLOR.digit }}>09</span> {t('t.pwd.legendDigits', 'digits')} ·{' '}
          <span style={{ color: KIND_COLOR.symbol }}>#!</span> {t('t.pwd.legendSymbols', 'symbols')} ·{' '}
          {t('t.pwd.alphabet', 'alphabet')}: {alphabet.length}
        </p>
      </div>
    </div>
  );
}
