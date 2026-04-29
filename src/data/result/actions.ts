import type { EligibilityOutcome } from "../../store/types";

export interface OutcomeActions {
  primary: { label: string; href: string };
}

export const OUTCOME_ACTIONS: Record<EligibilityOutcome, OutcomeActions> = {
  national: {
    primary: {
      label: "Apply for an allocation",
      href: "https://dashboard.rc.nectar.org.au/allocation/",
    },
  },
  local: {
    primary: {
      label: "Apply for an allocation",
      href: "https://dashboard.rc.nectar.org.au/allocation/",
    },
  },
  "not-eligible": {
    primary: {
      label: "Explore resources for researchers",
      href: "https://ardc.edu.au/researcher/",
    },
  },
};
