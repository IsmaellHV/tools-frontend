import { useState, useRef } from 'react';
import CopyButton from '~/components/CopyButton';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

type Mode = 'toB64' | 'toImg';

const fmtSize = (n: number): string => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
};

export default function Base64ImageTool({ dict }: Props) {
  const [mode, setMode] = useState<Mode>('toB64');
  const [dataUrl, setDataUrl] = useState('');
  const [size, setSize] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    setSize(file.size);
    const reader = new FileReader();
    reader.onload = () => setDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={`btn ${mode === 'toB64' ? 'btn-primary' : ''}`} onClick={() => setMode('toB64')}>
          {pick(dict, 't.b64img.toB64', 'Image → Base64')}
        </button>
        <button className={`btn ${mode === 'toImg' ? 'btn-primary' : ''}`} onClick={() => setMode('toImg')}>
          {pick(dict, 't.b64img.toImg', 'Base64 → Image')}
        </button>
      </div>

      {mode === 'toB64' ? (
        <div
          className="card cursor-pointer text-center"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f && f.type.startsWith('image/')) onFile(f);
          }}
        >
          <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
            {pick(dict, 't.b64img.dropImage', 'Drop an image')}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </div>
      ) : (
        <div>
          <label className="label">Base64 / data URL</label>
          <textarea
            value={dataUrl}
            onChange={(e) => setDataUrl(e.target.value)}
            placeholder={pick(dict, 't.b64img.dataUrlPlaceholder', '')}
          />
        </div>
      )}

      {dataUrl && (
        <>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="label" style={{ marginBottom: 0 }}>
                {pick(dict, 't.b64img.preview', 'Preview')} {size > 0 && `· ${fmtSize(size)}`}
              </label>
              <div className="flex gap-2">
                <CopyButton text={dataUrl} dict={dict} />
                <button
                  className="btn"
                  onClick={() => {
                    setDataUrl('');
                    setSize(0);
                  }}
                >
                  {pick(dict, 'ui.clear', 'Clear')}
                </button>
              </div>
            </div>
            <div className="card flex justify-center">
              <img alt="" src={dataUrl} style={{ maxWidth: '100%', maxHeight: '400px' }} />
            </div>
          </div>

          {mode === 'toB64' && (
            <div>
              <label className="label">data URL</label>
              <textarea readOnly value={dataUrl} style={{ minHeight: '6rem', fontSize: '0.75rem' }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
