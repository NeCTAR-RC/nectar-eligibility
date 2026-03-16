import type { AssessmentAnswers } from "./types";

export const FLOW_VERSION = 1;
const STORAGE_PREFIX = "nectar-eligibility";
const SESSION_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

export function generateSessionId(): string {
  try {
    let max = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(STORAGE_PREFIX + ":")) continue;
      const id = parseInt(key.slice(STORAGE_PREFIX.length + 1), 10);
      if (id > max) max = id;
    }
    return String(max + 1);
  } catch {
    return "1";
  }
}

export function isSessionId(segment: string): boolean {
  return /^\d+$/.test(segment);
}

function storageKey(sessionId: string): string {
  return `${STORAGE_PREFIX}:${sessionId}`;
}

export function saveToStorage(
  answers: AssessmentAnswers,
  sessionId: string,
): void {
  try {
    const data = { v: FLOW_VERSION, t: Date.now(), ...answers };
    localStorage.setItem(storageKey(sessionId), JSON.stringify(data));
    purgeExpiredSessions();
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

export function loadFromStorage(sessionId: string): AssessmentAnswers | null {
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("v" in parsed) ||
      (parsed as { v: number }).v !== FLOW_VERSION
    ) {
      return null;
    }

    const record = parsed as { v: number; t?: number };
    if (record.t && Date.now() - record.t > SESSION_TTL_MS) {
      localStorage.removeItem(storageKey(sessionId));
      return null;
    }

    const state = parsed as AssessmentAnswers & { v: number };
    return {
      role: state.role ?? null,
      australianAffiliation: state.australianAffiliation ?? null,
      aucklandAffiliation: state.aucklandAffiliation ?? null,
      funding: Array.isArray(state.funding) ? state.funding : [],
      memberOrganisation: state.memberOrganisation ?? null,
      selectedOrganisation: state.selectedOrganisation ?? null,
      acknowledgedRequirements: state.acknowledgedRequirements ?? false,
    };
  } catch {
    return null;
  }
}

export function clearSession(sessionId: string): void {
  try {
    localStorage.removeItem(storageKey(sessionId));
  } catch {
    // Ignore
  }
}

function purgeExpiredSessions(): void {
  try {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key?.startsWith(STORAGE_PREFIX + ":")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as { t?: number };
        if (parsed.t && now - parsed.t > SESSION_TTL_MS) {
          localStorage.removeItem(key);
        }
      } catch {
        // corrupt entry, remove it
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore
  }
}
