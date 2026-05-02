import { useRef, useState } from 'react';
import jsQR from 'jsqr';
import CopyButton from '~/components/CopyButton';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

export default function QrReadTool({ dict }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleFile = (file: File) => {
    setError('');
    setResult('');
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || '');
      setPreview(url);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(data.data, data.width, data.height);
        if (code) setResult(code.data);
        else setError(pick(dict, 't.qrRead.notFound', 'No QR found.'));
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div
        className="card cursor-pointer text-center"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f && f.type.startsWith('image/')) handleFile(f);
        }}
      >
        <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
          {pick(dict, 't.qrRead.drop', 'Drop QR')}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
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
            <CopyButton text={result} dict={dict} />
          </div>
          <textarea readOnly value={result} />
        </div>
      )}
    </div>
  );
}
