import { RadioGroup, RadioGroupItem } from "@ardc-ui/react";
import { useAssessmentStore } from "../../../store/assessmentStore";
import type { ProfessionalRole as ProfessionalRoleType } from "../../../store/types";
import {
  PROFESSIONAL_ROLE_QUESTION,
  ROLE_OPTIONS,
} from "../../../data/assessment/professionalRole";
import ContentSection from "../../ContentSection/ContentSection";

interface Props {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}

export default function ProfessionalRole({ headingRef }: Props) {
  const role = useAssessmentStore((s) => s.answers.role);
  const setAnswer = useAssessmentStore((s) => s.setAnswer);

  return (
    <ContentSection title={PROFESSIONAL_ROLE_QUESTION} headingRef={headingRef}>
      <RadioGroup
        value={role}
        onChange={(value) => setAnswer("role", value as ProfessionalRoleType)}
        aria-label={PROFESSIONAL_ROLE_QUESTION}
      >
        {ROLE_OPTIONS.map((opt) => (
          <RadioGroupItem key={opt.value} value={opt.value}>
            {opt.label}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </ContentSection>
  );
}
