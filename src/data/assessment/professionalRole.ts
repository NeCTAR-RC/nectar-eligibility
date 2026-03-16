import type { ProfessionalRole } from "../../store/types";

export const PROFESSIONAL_ROLE_QUESTION =
  "What professional position or role best describes you?";

export const ROLE_OPTIONS: { value: ProfessionalRole; label: string }[] = [
  { value: "researcher", label: "Researcher" },
  {
    value: "research-support",
    label: "Research Data/Software/Support Professional",
  },
  { value: "librarian-trainer", label: "Librarian/Trainer" },
  { value: "manager", label: "Manager of People and/or Policy" },
  { value: "none-of-the-above", label: "None of the above" },
];

export const ROLE_LABELS: Record<ProfessionalRole, string> = Object.fromEntries(
  ROLE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ProfessionalRole, string>;
