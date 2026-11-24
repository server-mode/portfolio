export type ResourceKind = "skill" | "mcp" | "repo" | "dataset" | "other";

export type Resource = {
  id: string;
  url: string;
  title: string;
  desc: string;
  kind: ResourceKind;
  addedAt?: number;
  stars?: number;
  lang?: string;
};

export type ResourceStore = { added: Resource[]; removed: string[] };

export const EMPTY_RESOURCE_STORE: ResourceStore = { added: [], removed: [] };

const STORE_KEY = "hh-resources-v1";

export function loadResourceStore(): ResourceStore {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return EMPTY_RESOURCE_STORE;
    const parsed = JSON.parse(raw) as Partial<ResourceStore>;
    return {
      added: Array.isArray(parsed.added) ? parsed.added.filter((item) => item && item.url) : [],
      removed: Array.isArray(parsed.removed)
        ? parsed.removed.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return EMPTY_RESOURCE_STORE;
  }
}

export function saveResourceStore(store: ResourceStore): void {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* storage blocked */
  }
}

export function normalizeUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function githubRepo(url: string): { owner: string; repo: string } | null {
  if (hostOf(url) !== "github.com") return null;
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const [owner, repo] = parts;
    if (
      ["topics", "orgs", "users", "sponsors", "marketplace", "collections", "features"].includes(
        owner,
      )
    ) {
      return null;
    }
    return { owner, repo: repo.replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

export function fallbackTitle(url: string): string {
  const repo = githubRepo(url);
  if (repo) return `${repo.owner}/${repo.repo}`;
  try {
    const segments = new URL(url).pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? hostOf(url);
    return decodeURIComponent(last).replace(/[-_]+/g, " ").replace(/\.(git|html?)$/, "");
  } catch {
    return url;
  }
}

export function faviconFor(url: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostOf(url))}&sz=64`;
}

/** Owners of GitHub repos have a reliable avatar — nicer fallback than a favicon. */
export function avatarFor(url: string): string | null {
  const repo = githubRepo(url);
  return repo ? `https://github.com/${repo.owner}.png?size=80` : null;
}

/** Social preview for a repo (GitHub renders one per repo) or a YouTube thumbnail. */
export function previewImageFor(url: string): string | null {
  const repo = githubRepo(url);
  if (repo) return `https://opengraph.githubassets.com/1/${repo.owner}/${repo.repo}`;

  const youtube = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/,
  );
  if (youtube) return `https://i.ytimg.com/vi/${youtube[1]}/hqdefault.jpg`;

  return null;
}

export function formatStars(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return String(value);
}

export async function fetchRepoMeta(
  owner: string,
  repo: string,
): Promise<{ title: string; desc: string; stars: number; lang: string } | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      full_name?: string;
      description?: string | null;
      stargazers_count?: number;
      language?: string | null;
    };
    return {
      title: typeof data.full_name === "string" ? data.full_name : `${owner}/${repo}`,
      desc: typeof data.description === "string" ? data.description : "",
      stars: typeof data.stargazers_count === "number" ? data.stargazers_count : 0,
      lang: typeof data.language === "string" ? data.language : "",
    };
  } catch {
    return null;
  }
}
