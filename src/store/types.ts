export type StepId =
  | "professional-role"
  | "australian-affiliation"
  | "auckland-affiliation"
  | "funding-source"
  | "member-organisation"
  | "eligibility-info"
  | "result";

export type ProfessionalRole =
  | "researcher"
  | "research-support"
  | "librarian-trainer"
  | "manager"
  | "none-of-the-above";

export type YesNo = "yes" | "no";

export type FundingSource =
  | "national-international-grant"
  | "ncris"
  | "government-grant"
  | "industry-grant"
  | "none-of-the-above";

export type EligibilityOutcome = "national" | "local" | "not-eligible";

export interface AssessmentAnswers {
  role: ProfessionalRole | null;
  australianAffiliation: YesNo | null;
  aucklandAffiliation: YesNo | null;
  funding: FundingSource[];
  memberOrganisation: YesNo | null;
  selectedOrganisation: string | null;
  acknowledgedRequirements: boolean;
}

export interface AssessmentState {
  sessionId: string | null;
  answers: AssessmentAnswers;
  outcome: EligibilityOutcome | null;
  sessionExpired: boolean;
}

export interface AssessmentActions {
  setAnswer: <K extends keyof AssessmentAnswers>(
    key: K,
    value: AssessmentAnswers[K],
  ) => void;
  setOutcome: (outcome: EligibilityOutcome | null) => void;
  startOver: () => void;
  initSession: (sessionId: string) => void;
  setSessionExpired: (expired: boolean) => void;
}
