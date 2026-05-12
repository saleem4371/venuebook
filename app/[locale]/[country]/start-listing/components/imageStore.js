// ─────────────────────────────────────────────────────────────────────────────
//  imageStore — thin IndexedDB wrapper for persisting image blobs across
//  page refreshes and step navigations in the listing wizard.
//
//  Keys follow the pattern: `{category}/{imageId}`
//  e.g. "venue/img-1714300000000-abc12"
// ─────────────────────────────────────────────────────────────────────────────

const DB_NAME    = "vb_listing_images";
const STORE_NAME = "blobs";
const DB_VERSION = 1;

let _db = null;

async function getDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => {
      _db = req.result;
      // Invalidate cached reference if the connection closes unexpectedly
      _db.onclose = () => { _db = null; };
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

// ── Save a Blob / File under a key ──────────────────────────────────────────

export async function saveBlob(key, blob) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

// ── Retrieve a Blob by key (returns null if not found) ──────────────────────

export async function getBlob(key) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror   = () => reject(req.error);
  });
}

// ── Delete a single blob by key ──────────────────────────────────────────────

export async function deleteBlob(key) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

// ── Delete all blobs whose key starts with a prefix ─────────────────────────
//  Used by clearDraft to purge all images for a given category.

export async function deleteByPrefix(prefix) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, "readwrite");
    const st  = tx.objectStore(STORE_NAME);
    const req = st.openCursor();

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return;
      if (String(cursor.key).startsWith(prefix)) cursor.delete();
      cursor.continue();
    };

    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}
