import { useState } from 'react';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  text: string;
  dict: Dict;
  className?: string;
  style?: React.CSSProperties;
}

export default function CopyButton({ text, dict, className = 'btn', style }: Props) {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle');

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('ok');
    } catch {
      setState('err');
    }
    setTimeout(() => setState('idle'), 1500);
  };

  const label =
    state === 'ok'
      ? pick(dict, 'ui.copied', 'Copied!')
      : state === 'err'
        ? pick(dict, 'ui.copyFailed', 'Copy failed')
        : pick(dict, 'ui.copy', 'Copy');

  return (
    <button type="button" className={className} onClick={onClick} disabled={!text} style={style}>
      {label}
    </button>
  );
}
