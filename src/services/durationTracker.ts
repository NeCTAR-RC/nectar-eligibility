// Active-engagement timer for the eligibility assessment.
//
// Tracks how long a user spends actively working on the assessment, persisting
// the accumulator across page reloads so resumed sessions don't lose pre-reload
// time. Bounds every quiet period (hidden tab, idle, page reload, laptop sleep)
// at IDLE_CAP_MS so a single long absence can't dominate the metric.

const STORAGE_PREFIX = "nectar-eligibility";
const TIMING_SUFFIX = ":timing";

// Max time a single inter-tick gap can contribute to the accumulator.
// Tune here if 2 minutes proves too tight or too loose in production data.
export const IDLE_CAP_MS = 2 * 60 * 1000;

// How often the accumulator updates while the timer is running.
const TICK_INTERVAL_MS = 5 * 1000;

interface TimingRecord {
  activeMs: number;
  lastTickAt: number | null;
}

let currentSessionId: string | null = null;
let activeMs = 0;
let lastTickAt: number | null = null;
let tickHandle: ReturnType<typeof setInterval> | null = null;
let pageHideListenerRegistered = false;

function storageKey(sessionId: string): string {
  return `${STORAGE_PREFIX}:${sessionId}${TIMING_SUFFIX}`;
}

function load(sessionId: string): TimingRecord {
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    if (!raw) return { activeMs: 0, lastTickAt: null };
    const parsed = JSON.parse(raw) as Partial<TimingRecord>;
    return {
      activeMs: typeof parsed.activeMs === "number" ? parsed.activeMs : 0,
      lastTickAt:
        typeof parsed.lastTickAt === "number" ? parsed.lastTickAt : null,
    };
  } catch {
    return { activeMs: 0, lastTickAt: null };
  }
}

function persist(sessionId: string): void {
  try {
    const record: TimingRecord = { activeMs, lastTickAt };
    localStorage.setItem(storageKey(sessionId), JSON.stringify(record));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded)
  }
}

// Add the gap since lastTickAt to the accumulator, clamped to IDLE_CAP_MS.
// Treats every quiet period the same — hidden tab, idle, reload, sleep — so
// one long absence can never dominate the metric.
function accumulate(): void {
  if (lastTickAt === null) return;
  const gap = Date.now() - lastTickAt;
  activeMs += Math.min(gap, IDLE_CAP_MS);
  lastTickAt = Date.now();
}

function startInterval(sessionId: string): void {
  if (tickHandle !== null) return;
  tickHandle = setInterval(() => {
    accumulate();
    persist(sessionId);
  }, TICK_INTERVAL_MS);
}

function stopInterval(): void {
  if (tickHandle === null) return;
  clearInterval(tickHandle);
  tickHandle = null;
}

// Register a page-unload listener so the most recent activity is persisted
// before the browser tears the page down. On the next visit the reload gap
// will be capped, so we don't strictly need the final flush — but it shrinks
// the lost-precision window for short reloads.
export function init(): void {
  if (pageHideListenerRegistered) return;
  if (typeof window === "undefined") return;
  window.addEventListener("pagehide", () => {
    if (currentSessionId === null) return;
    accumulate();
    persist(currentSessionId);
  });
  pageHideListenerRegistered = true;
}

export function startOrResume(sessionId: string): void {
  if (currentSessionId === sessionId && tickHandle !== null) return;

  if (currentSessionId !== null && currentSessionId !== sessionId) {
    accumulate();
    persist(currentSessionId);
    stopInterval();
  }

  const loaded = load(sessionId);
  currentSessionId = sessionId;
  activeMs = loaded.activeMs;
  lastTickAt = loaded.lastTickAt;

  // First visit OR resume: in both cases we want to start counting from now.
  // For a resume, the gap between loaded.lastTickAt and now is added on the
  // first tick (or flush), capped by IDLE_CAP_MS.
  if (lastTickAt === null) {
    lastTickAt = Date.now();
  } else {
    accumulate();
  }
  persist(sessionId);
  startInterval(sessionId);
}

export function switchSession(newSessionId: string): void {
  if (currentSessionId === newSessionId) return;
  if (currentSessionId !== null) {
    accumulate();
    persist(currentSessionId);
    stopInterval();
  }
  currentSessionId = null;
  activeMs = 0;
  lastTickAt = null;
  // Don't auto-start: the new session's timer starts on its first
  // step_completed via startOrResume, matching the previous behaviour.
}

export function flushAndGetSeconds(sessionId: string): number {
  if (currentSessionId !== sessionId) {
    // Cross-tab edge case: a different tab completed the assessment for this
    // session. Read whatever was last persisted.
    const loaded = load(sessionId);
    return Math.round(loaded.activeMs / 1000);
  }
  accumulate();
  persist(sessionId);
  return Math.round(activeMs / 1000);
}

export function clear(sessionId: string): void {
  if (currentSessionId === sessionId) {
    stopInterval();
    currentSessionId = null;
    activeMs = 0;
    lastTickAt = null;
  }
  try {
    localStorage.removeItem(storageKey(sessionId));
  } catch {
    // Ignore
  }
}
