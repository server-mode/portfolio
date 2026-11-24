/**
 * Shared PIN gate for the admin parts of the site (video list, resource list).
 * The PIN never ships in clear text — only a salted hash does.
 * SHA-256 is used whenever the page runs in a secure context (https / localhost);
 * a small FNV-1a fallback covers plain-http LAN addresses where crypto.subtle
 * is unavailable.
 */
const PIN_SALT = "hh-watchlist-v1";
const PIN_SHA256 = "6dd2971bed04671e7feba410000e976a2feeacc58021a8f0f8d4df7d40e480f2";
const PIN_FNV = "f943d10e";

export const MAX_ATTEMPTS = 5;
export const LOCK_MS = 30_000;

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
