import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAssessmentStore } from "./assessmentStore";
import {
  FIRST_STEP,
  resolveNextStep,
  resolveOutcome,
  hasAnswerForStep,
  parsePathSegments,
  validatePathSegments,
} from "./flowEngine";
import { clearSession, generateSessionId } from "./persistence";
import type { StepId } from "./types";
import { answerValueForStep } from "./answerValue";
import {
  trackStepCompleted,
  trackStepBack,
  trackAssessmentComplete,
  trackAssessmentAbandoned,
  trackAssessmentRestarted,
  trackResultViewed,
} from "../services/analytics";
import { switchSession as switchDurationSession } from "../services/durationTracker";

export function useAssessmentNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = useAssessmentStore((s) => s.answers);
  const storeSessionId = useAssessmentStore((s) => s.sessionId);

  const { sessionId, steps: segments } = parsePathSegments(
    location.pathname,
    location.search,
  );

  // Switch sessions when browser back/forward lands on a different session
  useEffect(() => {
    if (sessionId && sessionId !== storeSessionId) {
      useAssessmentStore.getState().initSession(sessionId);
      switchDurationSession(sessionId);
    }
  }, [sessionId, storeSessionId]);

  // Skip validation until the store has been initialized with this session's data
  const sessionReady = storeSessionId === sessionId;
  const pathInvalid =
    sessionReady &&
    segments.length > 0 &&
    validatePathSegments(segments, answers).truncated;

  const currentStepId: StepId =
    !pathInvalid && segments.length > 0
      ? segments[segments.length - 1]
      : FIRST_STEP;

  const stepHistory: StepId[] =
    !pathInvalid && segments.length > 0
      ? [FIRST_STEP, ...segments.slice(0, -1)]
      : [];

  const isFirstStep = currentStepId === FIRST_STEP;
  const canContinue = hasAnswerForStep(currentStepId, answers);

  useEffect(() => {
    if (pathInvalid && sessionId) {
      clearSession(sessionId);
      useAssessmentStore.getState().setSessionExpired(true);
      navigate(`/?session=${sessionId}`, { replace: true });
    }
  }, [pathInvalid, sessionId, navigate]);

  function goToNextStep() {
    if (!sessionId) return;
    const nextStepId = resolveNextStep(currentStepId, answers);

    trackStepCompleted(
      currentStepId,
      answerValueForStep(currentStepId, answers),
      stepHistory.length + 1,
      sessionId,
    );

    if (nextStepId === "eligibility-info" || nextStepId === "result") {
      useAssessmentStore.getState().setOutcome(resolveOutcome(answers));
    }

    // Eligibility info is where users see their outcome — treat arrival as
    // assessment completion. Firing here (rather than on departure) means
    // users who see their outcome but abandon before acknowledging the
    // requirements are still counted.
    if (nextStepId === "eligibility-info") {
      const outcome = useAssessmentStore.getState().outcome;
      if (outcome) {
        trackAssessmentComplete(
          outcome,
          [...stepHistory, currentStepId, nextStepId],
          sessionId,
        );
      }
    }

    // Reaching the result page (past the requirements gate) is the engagement
    // signal — fire here rather than from the result page's mount effect so
    // analytics-event firing for assessment lifecycle stays in one place.
    if (nextStepId === "result") {
      const outcome = useAssessmentStore.getState().outcome;
      if (outcome) {
        trackResultViewed(outcome, sessionId);
      }
    }

    if (isFirstStep) {
      navigate(`/${nextStepId}?session=${sessionId}`);
    } else {
      const basePath = location.pathname.replace(/\/+$/, "") || "";
      navigate(`${basePath}/${nextStepId}?session=${sessionId}`);
    }
  }

  function goToPreviousStep() {
    if (!sessionId) return;

    const toStep: StepId =
      segments.length <= 1 ? FIRST_STEP : segments[segments.length - 2];
    trackStepBack(currentStepId, toStep, sessionId);

    if (segments.length <= 1) {
      navigate(`/?session=${sessionId}`);
    } else {
      navigate(`/${segments.slice(0, -1).join("/")}?session=${sessionId}`);
    }
  }

  function handleStartOver() {
    if (sessionId) {
      const outcome = useAssessmentStore.getState().outcome;
      if (currentStepId === "result" && outcome) {
        trackAssessmentRestarted(outcome, sessionId);
      } else {
        trackAssessmentAbandoned(currentStepId, sessionId);
      }
    }

    const newId = generateSessionId();
    useAssessmentStore.getState().initSession(newId);
    navigate(`/?session=${newId}`);
  }

  return {
    sessionId,
    currentStepId,
    stepHistory,
    isFirstStep,
    canContinue,
    goToNextStep,
    goToPreviousStep,
    handleStartOver,
  };
}
