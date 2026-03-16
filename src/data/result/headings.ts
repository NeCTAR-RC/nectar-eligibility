import type { EligibilityOutcome } from "../../store/types";

export const RESULT_HEADINGS: Record<EligibilityOutcome, string> = {
  national: "You may be eligible for a national allocation.",
  local: "You may be eligible for a local allocation.",
  "not-eligible": "You are not eligible for an allocation on the Nectar Cloud.",
};

export const DISCLAIMERS: Partial<Record<EligibilityOutcome, string>> = {
  national:
    "This result does not guarantee you will receive a Nectar allocation. All research project information must be provided when requesting an allocation and your request will be assessed by a Nectar representative.",
  local:
    "This result does not guarantee you will receive a Nectar allocation. All research project information must be provided when requesting an allocation and your request will be assessed by a Nectar representative from your local Nectar Node.",
};
