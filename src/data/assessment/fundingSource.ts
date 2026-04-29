import type { FundingSource } from "../../store/types";

export const FUNDING_SOURCE_QUESTION =
  "Are you (or your collaborators) funded by:";

export const FUNDING_OPTIONS: { value: FundingSource; label: string }[] = [
  {
    value: "national-international-grant",
    label: "A national or international research grant",
  },
  {
    value: "ncris",
    label:
      "A National Collaborative Research Infrastructure Strategy (NCRIS) capability (e.g. ARDC)",
  },
  {
    value: "government-grant",
    label: "A federal or state government department grant",
  },
  {
    value: "industry-grant",
    label: "A grant from industry supporting research",
  },
  { value: "none-of-the-above", label: "None of the above" },
];

export const FUNDING_LABELS: Record<FundingSource, string> = Object.fromEntries(
  FUNDING_OPTIONS.map((o) => [o.value, o.label]),
) as Record<FundingSource, string>;
