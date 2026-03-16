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

    if (nextStepId === "eligibility-info" || nextStepId === "result") {
      useAssessmentStore.getState().setOutcome(resolveOutcome(answers));
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
    if (segments.length <= 1) {
      navigate(`/?session=${sessionId}`);
    } else {
      navigate(`/${segments.slice(0, -1).join("/")}?session=${sessionId}`);
    }
  }

  function handleStartOver() {
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
