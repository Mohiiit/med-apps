// Fully-local data store backed by IndexedDB.
//
// Privacy contract: every record written here lives ONLY in this browser,
// on this device. There is no network code in this module — nothing is ever
// uploaded, synced, or transmitted. Clearing the browser's site data is the
// only thing that removes it (hence the Export buttons in the UI).

const DB_NAME = "med-apps";
const DB_VERSION = 1;
const STORE = "records";

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("appId", "appId", { unique: false });
        os.createIndex("savedAt", "savedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode) {
  return openDB().then((db) => db.transaction(STORE, mode).objectStore(STORE));
}

function makeId() {
  // Local, collision-resistant id without leaking anything off-device.
  const rand =
    globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return rand;
}

export async function saveRecord(appId, appName, data) {
  const store = await tx("readwrite");
  const record = {
    id: makeId(),
    appId,
    appName,
    data,
    savedAt: new Date().toISOString(),
  };
  return new Promise((resolve, reject) => {
    const req = store.add(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function listRecords(appId) {
  const store = await tx("readonly");
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      let rows = req.result || [];
      if (appId) rows = rows.filter((r) => r.appId === appId);
      rows.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1)); // newest first
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteRecord(id) {
  const store = await tx("readwrite");
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAll() {
  const store = await tx("readwrite");
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function countRecords() {
  const store = await tx("readonly");
  return new Promise((resolve, reject) => {
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
