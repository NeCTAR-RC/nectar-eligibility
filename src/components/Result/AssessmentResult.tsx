import { Alert } from "@ardc-ui/react";
import type { EligibilityOutcome } from "../../store/types";
import { RESULT_HEADINGS, DISCLAIMERS } from "../../data/result/headings";
import ContentSection from "../ContentSection/ContentSection";

interface Props {
  outcome: EligibilityOutcome;
}

export default function AssessmentResult({ outcome }: Props) {
  const disclaimer = DISCLAIMERS[outcome];

  return (
    <ContentSection
      title="Assessment Result"
      description={RESULT_HEADINGS[outcome]}
    >
      {disclaimer && (
        <Alert tone="warning">
          <strong>DISCLAIMER:</strong> {disclaimer}
        </Alert>
      )}
    </ContentSection>
  );
}
