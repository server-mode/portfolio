export type WatchVideo = { id: string; title: string; author: string; url: string };

export type AddedVideo = WatchVideo & {
  groupId: string;
  groupTitle: string;
  addedAt: number;
};

export type WatchStore = { added: AddedVideo[]; removed: string[] };

export const EMPTY_STORE: WatchStore = { added: [], removed: [] };

const STORE_KEY = "hh-watchlist-v1";
const PIN_SALT = "hh-watchlist-v1";

/**
 * The PIN is never stored in clear text — only a salted hash is shipped.
 * SHA-256 is used when the page runs in a secure context (https / localhost);
 * a small FNV-1a fallback covers plain-http LAN addresses where
 * crypto.subtle is unavailable.
 */
const PIN_SHA256 = "6dd2971bed04671e7feba410000e976a2feeacc58021a8f0f8d4df7d40e480f2";
const PIN_FNV = "f943d10e";

export const MAX_ATTEMPTS = 5;
export const LOCK_MS = 30_000;

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** Accepts youtu.be short links, /watch?v=, /shorts/, /embed/ or a bare id. */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (ID_RE.test(value)) return value;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && ID_RE.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v && ID_RE.test(v)) return v;
    const match = url.pathname.match(/\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  return null;
}

function weakHash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (!/^\d{6}$/.test(pin)) return false;
  const payload = PIN_SALT + pin;

  try {
    if (globalThis.crypto?.subtle) {
      const digest = await globalThis.crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(payload),
      );
      return toHex(digest) === PIN_SHA256;
    }
  } catch {
    /* fall through to the weak hash */
  }

  return weakHash(payload) === PIN_FNV;
}

export function loadWatchStore(): WatchStore {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return EMPTY_STORE;
    const parsed = JSON.parse(raw) as Partial<WatchStore>;
    return {
      added: Array.isArray(parsed.added) ? parsed.added.filter((v) => v && v.id) : [],
      removed: Array.isArray(parsed.removed)
        ? parsed.removed.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return EMPTY_STORE;
  }
}

export function saveWatchStore(store: WatchStore): void {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* storage full or blocked */
  }
}

/** Best-effort title/author lookup; fails silently (CORS, offline, removed video). */
export async function fetchVideoMeta(
  id: string,
): Promise<{ title: string; author: string } | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${id}`,
      )}&format=json`,
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { title?: string; author_name?: string };
    return {
      title: typeof data.title === "string" ? data.title : "",
      author: typeof data.author_name === "string" ? data.author_name : "",
    };
  } catch {
    return null;
  }
}
