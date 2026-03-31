import type { StepId, AssessmentAnswers } from "./types";

/**
 * Returns a string representation of the user's answer for a given step.
 * Used by analytics to record what the user selected.
 */
export function answerValueForStep(
  stepId: StepId,
  answers: AssessmentAnswers,
): string {
  switch (stepId) {
    case "professional-role":
      return answers.role ?? "";
    case "australian-affiliation":
      return answers.australianAffiliation ?? "";
    case "auckland-affiliation":
      return answers.aucklandAffiliation ?? "";
    case "funding-source":
      return answers.funding.join(", ");
    case "member-organisation":
      return answers.selectedOrganisation
        ? `${answers.memberOrganisation}, ${answers.selectedOrganisation}`
        : (answers.memberOrganisation ?? "");
    case "eligibility-info":
      return answers.acknowledgedRequirements ? "acknowledged" : "";
    default:
      return "";
  }
}
