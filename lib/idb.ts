// Minimal IndexedDB helper for storing File/Blob objects
export const DB_NAME = 'toybox_media';
export const STORE_NAME = 'files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFile(file: File | Blob, name?: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const entry = { id, file, name: name || (file instanceof File ? file.name : id), createdAt: Date.now() };
  return new Promise<string>((resolve, reject) => {
    const req = store.add(entry);
    req.onsuccess = () => {
      resolve(id);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getFile(id: string): Promise<Blob | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => {
      const result = req.result;
      if (!result) return resolve(null);
      resolve(result.file as Blob);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getFileUrl(id: string): Promise<string | null> {
  const blob = await getFile(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteFile(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
