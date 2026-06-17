import type { EligibilityOutcome } from "../../store/types";
import { NEXT_STEPS, NEXT_STEPS_SUBTITLE } from "../../data/result/nextSteps";
import ContentSection from "../ContentSection/ContentSection";
import styles from "./NextSteps.module.scss";

interface Props {
  outcome: EligibilityOutcome;
}

export default function NextSteps({ outcome }: Props) {
  const steps = NEXT_STEPS[outcome];
  const subtitle = NEXT_STEPS_SUBTITLE[outcome];

  return (
    <ContentSection
      title="Next Steps"
      description={subtitle ? <em>{subtitle}</em> : undefined}
    >
      <ul className={styles.list}>
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ul>
    </ContentSection>
  );
}
