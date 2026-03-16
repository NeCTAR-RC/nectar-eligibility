import type { EligibilityOutcome } from "../../store/types";
import { RESULT_HEADINGS, DISCLAIMERS } from "../../data/result/headings";
import ContentSection from "../ContentSection/ContentSection";
import styles from "./ResultPage.module.scss";

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
        <div className={styles.disclaimer} role="note">
          <strong>DISCLAIMER:</strong> {disclaimer}
        </div>
      )}
    </ContentSection>
  );
}
