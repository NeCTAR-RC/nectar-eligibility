import type {
  StepId,
  AssessmentAnswers,
  EligibilityOutcome,
} from "../../store/types";
import { AUSTRALIAN_AFFILIATION_QUESTION } from "../assessment/australianAffiliation";
import { AUCKLAND_AFFILIATION_QUESTION } from "../assessment/aucklandAffiliation";
import { FUNDING_SOURCE_QUESTION } from "../assessment/fundingSource";
import { MEMBER_ORGANISATION_QUESTION } from "../assessment/memberOrganisation";
import { PROFESSIONAL_ROLE_QUESTION } from "../assessment/professionalRole";
import { ELIGIBILITY_INFO_CONTENT } from "../eligibilityInfo";

import { ROLE_LABELS } from "../assessment/professionalRole";
import { FUNDING_LABELS } from "../assessment/fundingSource";
import { organisations } from "../organisations";

export function formatAnswer(
  stepId: StepId,
  answers: AssessmentAnswers,
): string {
  switch (stepId) {
    case "professional-role":
      return answers.role ? ROLE_LABELS[answers.role] : "";
    case "australian-affiliation":
      return answers.australianAffiliation === "yes" ? "Yes" : "No";
    case "auckland-affiliation":
      return answers.aucklandAffiliation === "yes" ? "Yes" : "No";
    case "funding-source":
      return answers.funding.map((f) => FUNDING_LABELS[f]).join(", ");
    case "member-organisation": {
      if (answers.memberOrganisation === "yes") {
        if (answers.selectedOrganisation) {
          const org = organisations.find(
            (o) => o.id === answers.selectedOrganisation,
          );
          if (org) return org.name;
        }
        return "Yes, my affiliated organisation is listed as a Nectar member";
      }
      return "No, my affiliated organisation is not in the list";
    }
    default:
      return "";
  }
}

export const STEP_QUESTIONS: Record<string, string> = {
  "professional-role": PROFESSIONAL_ROLE_QUESTION,
  "australian-affiliation": AUSTRALIAN_AFFILIATION_QUESTION,
  "auckland-affiliation": AUCKLAND_AFFILIATION_QUESTION,
  "funding-source": FUNDING_SOURCE_QUESTION,
  "member-organisation": MEMBER_ORGANISATION_QUESTION,
};

export const OUTCOME_INFO_TEXT: Record<EligibilityOutcome, string> =
  Object.fromEntries(
    Object.entries(ELIGIBILITY_INFO_CONTENT).map(([k, v]) => [k, v.body]),
  ) as Record<EligibilityOutcome, string>;
