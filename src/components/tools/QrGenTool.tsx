import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

type Ec = 'L' | 'M' | 'Q' | 'H';

export default function QrGenTool({ dict }: Props) {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [ec, setEc] = useState<Ec>('M');
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!text) {
      setDataUrl('');
      return;
    }
    QRCode.toDataURL(text, { errorCorrectionLevel: ec, width: size, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, [text, size, ec]);

  return (
    <div className="space-y-4">
      <div>
        <label className="label">{pick(dict, 'ui.input', 'Input')}</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={pick(dict, 't.qrGen.placeholder', '')} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">{pick(dict, 't.qrGen.size', 'Size')}</label>
          <input type="number" min={64} max={1024} step={32} value={size} onChange={(e) => setSize(Number(e.target.value) || 256)} />
        </div>
        <div>
          <label className="label">{pick(dict, 't.qrGen.ec', 'Error correction')}</label>
          <select value={ec} onChange={(e) => setEc(e.target.value as Ec)}>
            <option value="L">L (~7%)</option>
            <option value="M">M (~15%)</option>
            <option value="Q">Q (~25%)</option>
            <option value="H">H (~30%)</option>
          </select>
        </div>
      </div>

      {dataUrl && (
        <div className="card flex flex-col items-center gap-3">
          <img alt="QR" src={dataUrl} style={{ maxWidth: '100%' }} />
          <a className="btn btn-primary" href={dataUrl} download="qrcode.png">
            {pick(dict, 't.qrGen.downloadPng', 'Download PNG')}
          </a>
        </div>
      )}
    </div>
  );
}
