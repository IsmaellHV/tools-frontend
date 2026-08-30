// Historial local del editor de imagenes. Vive en IndexedDB y no en
// localStorage porque cada sesion guarda blobs a resolucion completa: una sola
// foto ya supera la cuota de ~5 MB que tiene el almacenamiento de strings.
//
// Nota de privacidad: `original` son los pixeles SIN censurar. Se guarda para
// poder seguir editando una sesion anterior, pero por eso la lista se pinta con
// `thumb` (el render ya censurado) y la herramienta ofrece borrado explicito.

export type EditOp =
  | { k: 'box'; x: number; y: number; w: number; h: number; color: string }
  | { k: 'pixelate'; x: number; y: number; w: number; h: number; size: number }
  | { k: 'blur'; x: number; y: number; w: number; h: number; radius: number }
  | { k: 'text'; x: number; y: number; text: string; color: string; size: number };

export interface EditSession {
  id: string;
  name: string;
  ts: number;
  width: number;
  height: number;
  original: Blob;
  thumb: Blob;
  ops: EditOp[];
}

/** Metadatos sin los blobs pesados, para listar sin cargar cada original. */
export type SessionSummary = Omit<EditSession, 'original' | 'ops'>;

const DB_NAME = 'tools_image_redact';
const DB_VERSION = 1;
const STORE = 'sessions';
export const HISTORY_MAX = 12;

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' }).createIndex('ts', 'ts');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const tx = async <T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const req = run(t.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
};

/** Devuelve las sesiones mas recientes primero, sin los blobs originales. */
export async function listSessions(): Promise<SessionSummary[]> {
  try {
    const all = await tx<EditSession[]>('readonly', (s) => s.getAll() as IDBRequest<EditSession[]>);
    return all
      .sort((a, b) => b.ts - a.ts)
      .map(({ id, name, ts, width, height, thumb }) => ({ id, name, ts, width, height, thumb }));
  } catch {
    return [];
  }
}

export async function getSession(id: string): Promise<EditSession | null> {
  try {
    return (await tx<EditSession | undefined>('readonly', (s) => s.get(id) as IDBRequest<EditSession | undefined>)) ?? null;
  } catch {
    return null;
  }
}

/** Guarda (o pisa) una sesion y poda las mas viejas para no crecer sin limite. */
export async function saveSession(session: EditSession): Promise<void> {
  try {
    await tx('readwrite', (s) => s.put(session) as IDBRequest<IDBValidKey>);
    const rest = await listSessions();
    for (const old of rest.slice(HISTORY_MAX)) await deleteSession(old.id);
  } catch {
    /* cuota llena o modo privado: el editor sigue funcionando sin historial */
  }
}

export async function deleteSession(id: string): Promise<void> {
  try {
    await tx('readwrite', (s) => s.delete(id) as unknown as IDBRequest<undefined>);
  } catch {
    /* ignore */
  }
}

export async function clearSessions(): Promise<void> {
  try {
    await tx('readwrite', (s) => s.clear() as unknown as IDBRequest<undefined>);
  } catch {
    /* ignore */
  }
}
