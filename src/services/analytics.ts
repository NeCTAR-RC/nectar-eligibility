import ReactGA from "react-ga4";
import type { StepId, EligibilityOutcome } from "../store/types";
import * as durationTracker from "./durationTracker";

let initialized = false;

const COMPLETED_FLAG = "nectar-eligibility:has-completed";
const DOWNLOADED_FLAG = "nectar-eligibility:has-downloaded-pdf";

export function initializeAnalytics(): void {
  if (initialized) return;

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as
    string | undefined;
  const debugMode = import.meta.env.VITE_GA_DEBUG_MODE === "true";

  if (!measurementId) {
    console.warn("[Analytics] No measurement ID provided, skipping init");
    return;
  }

  try {
    ReactGA.initialize(measurementId, {
      gaOptions: { debug_mode: debugMode },
    });
    initialized = true;
    if (debugMode) {
      console.log("[Analytics] Initialized (debug mode)");
    }
  } catch (error) {
    console.error("[Analytics] Failed to initialize:", error);
  }
}

function send(eventName: string, params: Record<string, string | number>) {
  if (!initialized) return;
  ReactGA.event(eventName, params);
}

// --- Assessment flow events ---

export function trackStepCompleted(
  stepId: StepId,
  answerValue: string,
  questionNumber: number,
  sessionId: string,
): void {
  // Start (or resume from localStorage) the active-engagement timer for this
  // session on the first step completion.
  durationTracker.startOrResume(sessionId);

  send("step_completed", {
    step_id: stepId,
    answer_value: answerValue,
    question_number: questionNumber,
    session_id: sessionId,
  });
}

export function trackStepBack(
  fromStep: StepId,
  toStep: StepId,
  sessionId: string,
): void {
  send("step_back", {
    from_step: fromStep,
    to_step: toStep,
    session_id: sessionId,
  });
}

export function trackAssessmentComplete(
  outcome: EligibilityOutcome,
  path: StepId[],
  sessionId: string,
): void {
  const durationSeconds = durationTracker.flushAndGetSeconds(sessionId);

  let isRepeat = false;
  try {
    isRepeat = localStorage.getItem(COMPLETED_FLAG) === "true";
    localStorage.setItem(COMPLETED_FLAG, "true");
  } catch {
    // localStorage unavailable
  }

  send("assessment_complete", {
    outcome,
    path: path.join(" > "),
    session_id: sessionId,
    is_repeat: isRepeat ? "true" : "false",
    duration_seconds: durationSeconds,
  });

  durationTracker.clear(sessionId);
}

export function trackAssessmentAbandoned(
  lastStep: StepId,
  sessionId: string,
): void {
  send("assessment_abandoned", {
    last_step: lastStep,
    session_id: sessionId,
  });

  durationTracker.clear(sessionId);
}

export function trackAssessmentRestarted(
  outcome: EligibilityOutcome,
  sessionId: string,
): void {
  send("assessment_restarted", {
    outcome,
    session_id: sessionId,
  });

  durationTracker.clear(sessionId);
}

export function trackResultViewed(
  outcome: EligibilityOutcome,
  sessionId: string,
): void {
  send("result_viewed", {
    outcome,
    session_id: sessionId,
  });
}

// --- Result page events ---

export function trackPdfDownload(
  outcome: EligibilityOutcome,
  sessionId: string,
): void {
  let isFirstDownload = false;
  try {
    isFirstDownload = localStorage.getItem(DOWNLOADED_FLAG) !== "true";
    localStorage.setItem(DOWNLOADED_FLAG, "true");
  } catch {
    // localStorage unavailable
  }

  send("pdf_download", {
    outcome,
    session_id: sessionId,
    is_first_download: isFirstDownload ? "true" : "false",
  });
}

export function trackCtaClick(
  outcome: EligibilityOutcome,
  ctaLabel: string,
  sessionId: string,
): void {
  send("cta_click", {
    outcome,
    cta_label: ctaLabel,
    session_id: sessionId,
  });
}

// --- Session lifecycle events ---

export function trackSessionRestored(sessionId: string): void {
  send("session_restored", { session_id: sessionId });
}

export function trackSessionExpired(sessionId: string): void {
  send("session_expired", { session_id: sessionId });
}
