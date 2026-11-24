export type WatchVideo = { id: string; title: string; author: string; url: string };

export type AddedVideo = WatchVideo & {
  groupId: string;
  groupTitle: string;
  addedAt: number;
};

export type WatchGroup = { id: string; title: string; note: string };

export type WatchStore = {
  added: AddedVideo[];
  removed: string[];
  groups: WatchGroup[];
  removedGroups: string[];
  moved: Record<string, string>;
};

export const EMPTY_STORE: WatchStore = {
  added: [],
  removed: [],
  groups: [],
  removedGroups: [],
  moved: {},
};

export { LOCK_MS, MAX_ATTEMPTS, verifyPin } from "./pin";

const STORE_KEY = "hh-watchlist-v1";

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

export function loadWatchStore(): WatchStore {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return EMPTY_STORE;
    const parsed = JSON.parse(raw) as Partial<WatchStore>;

    const moved: Record<string, string> = {};
    if (parsed.moved && typeof parsed.moved === "object") {
      for (const [key, value] of Object.entries(parsed.moved)) {
        if (typeof value === "string") moved[key] = value;
      }
    }

    return {
      added: Array.isArray(parsed.added)
        ? parsed.added.filter((video) => video && video.id)
        : [],
      removed: Array.isArray(parsed.removed)
        ? parsed.removed.filter((id): id is string => typeof id === "string")
        : [],
      groups: Array.isArray(parsed.groups)
        ? parsed.groups
            .filter((group) => group && group.id)
            .map((group) => ({
              id: String(group.id),
              title: String(group.title ?? ""),
              note: String(group.note ?? ""),
            }))
        : [],
      removedGroups: Array.isArray(parsed.removedGroups)
        ? parsed.removedGroups.filter((id): id is string => typeof id === "string")
        : [],
      moved,
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
