// Session-level captcha gate for static site.
//
// We can't verify Turnstile tokens server-side here (the site is fully static),
// so the gate is best-effort: solving the captcha sets a sessionStorage flag
// for a TTL, which unlocks the tools UI for the rest of the session. This
// raises the bar for casual scraping/abuse without pretending to be airtight.

const KEY = 'tools_gate_unlocked_at';
const TTL_MS = 1000 * 60 * 60; // 1h

export function isUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < TTL_MS;
  } catch {
    return false;
  }
}

export function markUnlocked(): void {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* sessionStorage unavailable — gate remains until reload, fine */
  }
}

export function clearUnlocked(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
