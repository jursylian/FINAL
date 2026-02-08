const KEY = "recentSearches";
const DEFAULT_LIMIT = 15;

function safeParse(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readRecent() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  return safeParse(raw);
}

function writeRecent(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function getRecent() {
  const items = readRecent();
  return items
    .filter((item) => item && item.userId)
    .sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0));
}

export function addRecent(rawItem, limit = DEFAULT_LIMIT) {
  if (!rawItem || !rawItem.userId) return getRecent();
  const now = Date.now();
  const item = { ...rawItem, lastOpenedAt: now };
  const items = readRecent().filter((i) => i.userId !== item.userId);
  const next = [item, ...items].slice(0, limit);
  writeRecent(next);
  return next;
}

export function removeRecent(userId) {
  if (!userId) return getRecent();
  const next = readRecent().filter((item) => item.userId !== userId);
  writeRecent(next);
  return next;
}

export function clearRecent() {
  if (typeof window === "undefined") return [];
  window.localStorage.removeItem(KEY);
  return [];
}
