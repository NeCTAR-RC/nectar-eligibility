import { describe, it, expect, beforeEach } from "vitest";
import type { AssessmentAnswers } from "./types";
import { INITIAL_ANSWERS } from "./flowEngine";
import { saveToStorage, loadFromStorage, clearSession } from "./persistence";

function makeAnswers(
  overrides: Partial<AssessmentAnswers> = {},
): AssessmentAnswers {
  return { ...INITIAL_ANSWERS, ...overrides };
}

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

describe("localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const testSession = "test1";

  it("saveToStorage + loadFromStorage round-trips answers", () => {
    const answers = makeAnswers({
      role: "researcher",
      australianAffiliation: "yes",
      funding: ["ncris", "government-grant"],
    });
    saveToStorage(answers, testSession);
    expect(loadFromStorage(testSession)).toEqual(answers);
  });

  it("loadFromStorage returns null when empty", () => {
    expect(loadFromStorage(testSession)).toBeNull();
  });

  it("loadFromStorage returns null for wrong version", () => {
    const data = { v: 999, ...makeAnswers({ role: "researcher" }) };
    localStorage.setItem(
      `nectar-eligibility:${testSession}`,
      JSON.stringify(data),
    );
    expect(loadFromStorage(testSession)).toBeNull();
  });

  it("loadFromStorage returns null for invalid JSON", () => {
    localStorage.setItem(`nectar-eligibility:${testSession}`, "not-json");
    expect(loadFromStorage(testSession)).toBeNull();
  });

  it("clearSession removes stored data", () => {
    saveToStorage(makeAnswers({ role: "researcher" }), testSession);
    clearSession(testSession);
    expect(loadFromStorage(testSession)).toBeNull();
  });
});
