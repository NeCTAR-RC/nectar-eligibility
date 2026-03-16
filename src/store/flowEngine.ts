import type { StepId, AssessmentAnswers, EligibilityOutcome } from "./types";
import { isSessionId } from "./persistence";

const SESSION_PARAM = "session";

function hasRealFunding(answers: AssessmentAnswers): boolean {
  return (
    answers.funding.length > 0 &&
    !answers.funding.includes("none-of-the-above")
  );
}

export const ALL_STEP_IDS: ReadonlySet<string> = new Set<string>([
  "professional-role",
  "australian-affiliation",
  "auckland-affiliation",
  "funding-source",
  "member-organisation",
  "eligibility-info",
  "result",
]);

export const FIRST_STEP: StepId = "professional-role";

export const INITIAL_ANSWERS: AssessmentAnswers = {
  role: null,
  australianAffiliation: null,
  aucklandAffiliation: null,
  funding: [],
  memberOrganisation: null,
  selectedOrganisation: null,
  acknowledgedRequirements: false,
};

export function resolveNextStep(
  stepId: StepId,
  answers: AssessmentAnswers,
): StepId {
  switch (stepId) {
    case "professional-role":
      return "australian-affiliation";

    case "australian-affiliation":
      return answers.australianAffiliation === "yes"
        ? "funding-source"
        : "auckland-affiliation";

    case "auckland-affiliation":
      return answers.aucklandAffiliation === "yes"
        ? "funding-source"
        : "eligibility-info";

    case "funding-source":
      return hasRealFunding(answers) ? "eligibility-info" : "member-organisation";

    case "member-organisation":
      return "eligibility-info";

    case "eligibility-info":
      return "result";

    default:
      return "result";
  }
}

export function resolveOutcome(
  answers: AssessmentAnswers,
): EligibilityOutcome | null {
  if (
    answers.australianAffiliation === "no" &&
    answers.aucklandAffiliation === "no"
  ) {
    return "not-eligible";
  }

  if (hasRealFunding(answers)) {
    return "national";
  }

  if (answers.memberOrganisation === "yes") {
    return "local";
  }

  if (answers.memberOrganisation === "no") {
    return "not-eligible";
  }

  return null;
}

export function hasAnswerForStep(
  stepId: StepId,
  answers: AssessmentAnswers,
): boolean {
  switch (stepId) {
    case "professional-role":
      return answers.role !== null;
    case "australian-affiliation":
      return answers.australianAffiliation !== null;
    case "auckland-affiliation":
      return answers.aucklandAffiliation !== null;
    case "funding-source":
      return answers.funding.length > 0;
    case "member-organisation":
      return answers.memberOrganisation !== null;
    case "eligibility-info":
      return answers.acknowledgedRequirements;
    default:
      return false;
  }
}

export interface ReplayResult {
  currentStepId: StepId;
  stepHistory: StepId[];
  outcome: EligibilityOutcome | null;
  trimmedAnswers: AssessmentAnswers;
}

/**
 * Replays answers through the flow logic from step 1 to derive
 * the current step, history, outcome, and trimmed answers.
 * Stops at the first step without a valid answer.
 */
export function replayAnswers(answers: AssessmentAnswers): ReplayResult {
  const stepHistory: StepId[] = [];
  let currentStepId: StepId = FIRST_STEP;
  const trimmedAnswers: AssessmentAnswers = { ...INITIAL_ANSWERS };

  while (currentStepId !== "result") {
    if (!hasAnswerForStep(currentStepId, answers)) {
      break;
    }

    copyAnswerForStep(currentStepId, answers, trimmedAnswers);

    stepHistory.push(currentStepId);
    currentStepId = resolveNextStep(currentStepId, trimmedAnswers);
  }

  if (currentStepId === "result" && answers.acknowledgedRequirements) {
    trimmedAnswers.acknowledgedRequirements = true;
  }

  const outcome =
    currentStepId === "eligibility-info" || currentStepId === "result"
      ? resolveOutcome(trimmedAnswers)
      : null;

  return { currentStepId, stepHistory, outcome, trimmedAnswers };
}

/**
 * Converts step history + current step into a URL path
 * with the session ID as a query parameter.
 */
export function buildPathFromHistory(
  stepHistory: StepId[],
  currentStepId: StepId,
  sessionId: string,
): string {
  const allSteps = [...stepHistory, currentStepId];
  const segments = allSteps.filter((s) => s !== FIRST_STEP);
  const path = segments.length === 0 ? "/" : `/${segments.join("/")}`;
  return `${path}?${SESSION_PARAM}=${sessionId}`;
}

export interface ParsedPath {
  sessionId: string | null;
  steps: StepId[];
}

export function parsePathSegments(
  pathname: string,
  search: string,
): ParsedPath {
  const params = new URLSearchParams(search);
  const raw = params.get(SESSION_PARAM);
  const sessionId = raw && isSessionId(raw) ? raw : null;

  const parts = pathname.split("/").filter((s) => s.length > 0);
  const steps = parts.filter((s) => ALL_STEP_IDS.has(s)) as StepId[];

  return { sessionId, steps };
}

export interface ValidatePathResult {
  currentStepId: StepId;
  stepHistory: StepId[];
  truncated: boolean;
}

/**
 * Validates URL path segments against the flow engine and stored answers.
 * Walks from FIRST_STEP, checking each segment is the expected next step
 * and that the preceding step has an answer. Stops at the first invalid segment.
 */
export function validatePathSegments(
  segments: StepId[],
  answers: AssessmentAnswers,
): ValidatePathResult {
  if (segments.length === 0) {
    return { currentStepId: FIRST_STEP, stepHistory: [], truncated: false };
  }

  const validHistory: StepId[] = [FIRST_STEP];
  let expectedNext = hasAnswerForStep(FIRST_STEP, answers)
    ? resolveNextStep(FIRST_STEP, answers)
    : null;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (expectedNext === null || segment !== expectedNext) {
      return {
        currentStepId: validHistory[validHistory.length - 1],
        stepHistory: validHistory.slice(0, -1),
        truncated: true,
      };
    }

    validHistory.push(segment);

    if (segment === "result" || !hasAnswerForStep(segment, answers)) {
      break;
    }

    expectedNext = resolveNextStep(segment, answers);
  }

  const currentStepId = validHistory[validHistory.length - 1];
  return {
    currentStepId,
    stepHistory: validHistory.slice(0, -1),
    truncated: segments.length > validHistory.length - 1,
  };
}

function copyAnswerForStep(
  stepId: StepId,
  from: AssessmentAnswers,
  to: AssessmentAnswers,
): void {
  switch (stepId) {
    case "professional-role":
      to.role = from.role;
      break;
    case "australian-affiliation":
      to.australianAffiliation = from.australianAffiliation;
      break;
    case "auckland-affiliation":
      to.aucklandAffiliation = from.aucklandAffiliation;
      break;
    case "funding-source":
      to.funding = [...from.funding];
      break;
    case "member-organisation":
      to.memberOrganisation = from.memberOrganisation;
      to.selectedOrganisation = from.selectedOrganisation;
      break;
    case "eligibility-info":
      to.acknowledgedRequirements = from.acknowledgedRequirements;
      break;
  }
}
