import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const SESSION = "session1";
const OTHER_SESSION = "session2";
const TIMING_KEY = `nectar-eligibility:${SESSION}:timing`;

// Reset the module's internal state between tests by re-importing it. Each
// test gets a fresh tracker with no in-progress session.
async function loadFresh() {
  vi.resetModules();
  return await import("./durationTracker");
}

function readTimingRecord(
  sessionId: string,
): { activeMs: number; lastTickAt: number | null } | null {
  const raw = localStorage.getItem(`nectar-eligibility:${sessionId}:timing`);
  return raw ? JSON.parse(raw) : null;
}

describe("durationTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("startOrResume — first visit", () => {
    it("initialises activeMs to 0 and persists a record", async () => {
      const tracker = await loadFresh();
      tracker.startOrResume(SESSION);

      const record = readTimingRecord(SESSION);
      expect(record).not.toBeNull();
      expect(record!.activeMs).toBe(0);
      expect(record!.lastTickAt).toBe(Date.now());
    });
  });

  describe("tick interval", () => {
    it("advances activeMs by the elapsed time when below the cap", async () => {
      const tracker = await loadFresh();
      tracker.startOrResume(SESSION);

      // Advance 5s — one tick fires
      vi.advanceTimersByTime(5_000);

      const record = readTimingRecord(SESSION);
      expect(record!.activeMs).toBe(5_000);
    });

    it("clamps a single large gap to IDLE_CAP_MS", async () => {
      const tracker = await loadFresh();
      tracker.startOrResume(SESSION);

      // Advance way past the cap. setInterval will fire many ticks during
      // jest fake-timer advancement, but the gap clamp applies per tick. Use
      // flushAndGetSeconds to read the final clamped value.
      vi.setSystemTime(Date.now() + 60 * 60 * 1000); // jump 1 hour
      const seconds = tracker.flushAndGetSeconds(SESSION);

      expect(seconds).toBe(tracker.IDLE_CAP_MS / 1000);
    });
  });

  describe("resume from persisted record", () => {
    it("loads activeMs and adds the reload gap, capped", async () => {
      // Pre-seed a timing record as if a previous visit ran for 30s and
      // closed the page 10 minutes ago.
      const past = Date.now() - 10 * 60 * 1000;
      localStorage.setItem(
        TIMING_KEY,
        JSON.stringify({ activeMs: 30_000, lastTickAt: past }),
      );

      const tracker = await loadFresh();
      tracker.startOrResume(SESSION);

      const seconds = tracker.flushAndGetSeconds(SESSION);
      // 30s pre-existing + 2-min cap (reload gap was 10min, clamped)
      expect(seconds).toBe(30 + tracker.IDLE_CAP_MS / 1000);
    });

    it("resumed gap below the cap is fully counted", async () => {
      const past = Date.now() - 30_000; // 30s ago
      localStorage.setItem(
        TIMING_KEY,
        JSON.stringify({ activeMs: 60_000, lastTickAt: past }),
      );

      const tracker = await loadFresh();
      tracker.startOrResume(SESSION);

      const seconds = tracker.flushAndGetSeconds(SESSION);
      // 60s pre-existing + 30s reload gap, no cap hit
      expect(seconds).toBe(90);
    });
  });

  describe("flushAndGetSeconds", () => {
    it("rounds to the nearest second", async () => {
      const tracker = await loadFresh();
      tracker.startOrResume(SESSION);

      vi.advanceTimersByTime(1_400);
      expect(tracker.flushAndGetSeconds(SESSION)).toBe(1);

      vi.advanceTimersByTime(700);
      expect(tracker.flushAndGetSeconds(SESSION)).toBe(2);
    });

    it("reads from storage when called for a non-active session", async () => {
      const tracker = await loadFresh();
      localStorage.setItem(
        `nectar-eligibility:${OTHER_SESSION}:timing`,
        JSON.stringify({ activeMs: 12_500, lastTickAt: null }),
      );

      // No startOrResume for OTHER_SESSION — should still return the
      // persisted value.
      expect(tracker.flushAndGetSeconds(OTHER_SESSION)).toBe(13);
    });
  });

  describe("clear", () => {
    it("removes the storage entry and stops the active timer", async () => {
      const tracker = await loadFresh();
      tracker.startOrResume(SESSION);
      vi.advanceTimersByTime(5_000);

      tracker.clear(SESSION);

      expect(localStorage.getItem(TIMING_KEY)).toBeNull();

      // After clear, advancing time shouldn't accumulate anything; a
      // subsequent startOrResume should start fresh at 0.
      vi.advanceTimersByTime(10_000);
      tracker.startOrResume(SESSION);
      const record = readTimingRecord(SESSION);
      expect(record!.activeMs).toBe(0);
    });
  });

  describe("switchSession", () => {
    it("flushes the old session before clearing in-memory state", async () => {
      const tracker = await loadFresh();
      tracker.startOrResume(SESSION);
      vi.advanceTimersByTime(7_000);

      tracker.switchSession(OTHER_SESSION);

      // Old session's accumulator was persisted before the switch
      const oldRecord = readTimingRecord(SESSION);
      expect(oldRecord!.activeMs).toBe(7_000);
    });

    it("does not auto-start the new session's timer", async () => {
      const tracker = await loadFresh();
      tracker.startOrResume(SESSION);
      tracker.switchSession(OTHER_SESSION);

      // No timing record written for the new session yet (it starts on the
      // first step_completed via startOrResume).
      expect(readTimingRecord(OTHER_SESSION)).toBeNull();
    });
  });

  describe("startOrResume idempotency", () => {
    it("calling twice for the same active session does not reset activeMs", async () => {
      const tracker = await loadFresh();
      tracker.startOrResume(SESSION);
      vi.advanceTimersByTime(5_000);

      tracker.startOrResume(SESSION); // second call should be a no-op

      const seconds = tracker.flushAndGetSeconds(SESSION);
      expect(seconds).toBe(5);
    });
  });
});
