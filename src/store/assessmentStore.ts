import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { AssessmentState, AssessmentActions } from "./types";
import { INITIAL_ANSWERS, replayAnswers } from "./flowEngine";
import { saveToStorage, loadFromStorage } from "./persistence";

const INITIAL_STATE: AssessmentState = {
  sessionId: null,
  answers: { ...INITIAL_ANSWERS },
  outcome: null,
  sessionExpired: false,
};

export const useAssessmentStore = create<AssessmentState & AssessmentActions>()(
  immer((set) => ({
    ...INITIAL_STATE,

    setAnswer: (key, value) =>
      set((state) => {
        (state.answers[key] as typeof value) = value;
        state.sessionExpired = false;
      }),

    setOutcome: (outcome) =>
      set((state) => {
        state.outcome = outcome;
      }),

    startOver: () =>
      set(() => ({
        ...INITIAL_STATE,
        answers: { ...INITIAL_ANSWERS },
      })),

    setSessionExpired: (expired) =>
      set((state) => {
        state.sessionExpired = expired;
      }),

    initSession: (sessionId) =>
      set(() => {
        const stored = loadFromStorage(sessionId);
        if (stored) {
          const merged = { ...INITIAL_ANSWERS, ...stored };
          const { outcome, trimmedAnswers } = replayAnswers(merged);
          return { sessionId, answers: trimmedAnswers, outcome };
        }
        return { ...INITIAL_STATE, sessionId, answers: { ...INITIAL_ANSWERS } };
      }),
  })),
);

useAssessmentStore.subscribe((state) => {
  if (state.sessionId) {
    saveToStorage(state.answers, state.sessionId);
  }
});
