// Historial local del editor de imagenes. Vive en IndexedDB y no en
// localStorage porque cada sesion guarda un blob a resolucion completa: una
// sola foto ya supera la cuota de ~5 MB que tiene el almacenamiento de strings.
//
// Privacidad: aqui SOLO se guarda el resultado ya censurado. El original se
// queda en memoria mientras editas y se pierde al cerrar la pestana, asi que
// una contrasena tapada no puede recuperarse desde el disco del navegador.
// El precio es que al reabrir una sesion se continua sobre la imagen censurada
// y las censuras anteriores ya no se pueden deshacer, que es justo lo deseable.

export type EditOp =
  // `fill` ausente = relleno (comportamiento de las sesiones guardadas antes de
  // que existiera el modo contorno, asi que se siguen abriendo igual).
  | { k: 'box'; x: number; y: number; w: number; h: number; color: string; fill?: boolean; width?: number }
  | { k: 'ellipse'; x: number; y: number; w: number; h: number; color: string; fill?: boolean; width?: number }
  | { k: 'polygon'; points: [number, number][]; color: string; fill?: boolean; width?: number }
  | { k: 'arrow'; x1: number; y1: number; x2: number; y2: number; color: string; width: number }
  | { k: 'pixelate'; x: number; y: number; w: number; h: number; size: number }
  | { k: 'blur'; x: number; y: number; w: number; h: number; radius: number }
  | { k: 'text'; x: number; y: number; text: string; color: string; size: number };

export interface EditSession {
  id: string;
  name: string;
  ts: number;
  width: number;
  height: number;
  /** Render aplanado: los pixeles tapados ya no existen en este blob. */
  result: Blob;
  thumb: Blob;
}

/** Metadatos sin el blob grande, para listar sin cargar cada imagen. */
export type SessionSummary = Omit<EditSession, 'result'>;

const DB_NAME = 'tools_image_redact';
// v2 dejo de guardar el original. Al subir de version se vacia el almacen para
// que los originales sin censurar que dejo v1 no sigan en disco.
const DB_VERSION = 2;
const STORE = 'sessions';
export const HISTORY_MAX = 12;

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' }).createIndex('ts', 'ts');
        return;
      }
      if (e.oldVersion < 2) req.transaction?.objectStore(STORE).clear();
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

/** Devuelve las sesiones mas recientes primero, sin el blob del resultado. */
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
