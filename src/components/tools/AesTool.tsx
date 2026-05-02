import { useState } from 'react';
import CryptoJS from 'crypto-js';
import CopyButton from '~/components/CopyButton';
import type { Dict } from '~/lib/dict';
import { pick } from '~/lib/dict';

interface Props {
  dict: Dict;
}

export default function AesTool({ dict }: Props) {
  const [pass, setPass] = useState('');
  const [plain, setPlain] = useState('');
  const [cipher, setCipher] = useState('');
  const [error, setError] = useState('');

  const onEncrypt = () => {
    setError('');
    try {
      const c = CryptoJS.AES.encrypt(plain, pass).toString();
      setCipher(c);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onDecrypt = () => {
    setError('');
    try {
      const bytes = CryptoJS.AES.decrypt(cipher, pass);
      const out = bytes.toString(CryptoJS.enc.Utf8);
      if (!out) throw new Error('decrypt failed');
      setPlain(out);
    } catch {
      setError(pick(dict, 't.aes.errDecrypt', 'Could not decrypt'));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">{pick(dict, 't.aes.passphrase', 'Passphrase')}</label>
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder={pick(dict, 't.aes.passphrasePh', '')} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">{pick(dict, 't.aes.plaintext', 'Plaintext')}</label>
          <textarea value={plain} onChange={(e) => setPlain(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primary" onClick={onEncrypt} disabled={!pass || !plain}>
              {pick(dict, 't.aes.encrypt', 'Encrypt')} →
            </button>
            <CopyButton text={plain} dict={dict} />
          </div>
        </div>

        <div>
          <label className="label">{pick(dict, 't.aes.ciphertext', 'Ciphertext')}</label>
          <textarea value={cipher} onChange={(e) => setCipher(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primary" onClick={onDecrypt} disabled={!pass || !cipher}>
              ← {pick(dict, 't.aes.decrypt', 'Decrypt')}
            </button>
            <CopyButton text={cipher} dict={dict} />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-accent-2)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
