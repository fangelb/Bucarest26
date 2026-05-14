// firebase.js — Firebase Realtime Database via REST API (sense SDK)
// Configura VITE_FIREBASE_URL al fitxer .env

const DB = import.meta.env.VITE_FIREBASE_URL || '';

export const hasFirebase = () => Boolean(DB);

export async function fbGet(path) {
  if (!DB) return null;
  try {
    const r = await fetch(`${DB}/${path}.json`, { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export async function fbSet(path, data) {
  if (!DB) return false;
  try {
    const r = await fetch(`${DB}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.ok;
  } catch { return false; }
}

export async function fbPatch(path, data) {
  if (!DB) return false;
  try {
    const r = await fetch(`${DB}/${path}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.ok;
  } catch { return false; }
}

// LocalStorage helpers (fallback si no hi ha Firebase)
export const lsGet = (key, def = null) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
};

export const lsSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};
