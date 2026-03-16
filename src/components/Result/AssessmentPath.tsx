import type {
  StepId,
  AssessmentAnswers,
  EligibilityOutcome,
} from "../../store/types";
import {
  STEP_QUESTIONS,
  OUTCOME_INFO_TEXT,
  formatAnswer,
} from "../../data/result/pathLabels";
import ContentSection from "../ContentSection/ContentSection";
import styles from "./AssessmentPath.module.scss";

interface Props {
  stepHistory: StepId[];
  answers: AssessmentAnswers;
  outcome: EligibilityOutcome;
}

export default function AssessmentPath({
  stepHistory,
  answers,
  outcome,
}: Props) {
  const questionSteps = stepHistory.filter((s) => s !== "eligibility-info");

  return (
    <ContentSection title="Your Assessment Path">
      <div className={styles.timeline}>
        {questionSteps.map((stepId) => (
          <div key={stepId} className={styles.entry}>
            <p className={styles.question}>{STEP_QUESTIONS[stepId]}</p>
            <p>{formatAnswer(stepId, answers)}</p>
          </div>
        ))}
        <div className={styles.entry}>
          <p className={styles.question}>{OUTCOME_INFO_TEXT[outcome]}</p>
          <p>I understand the requirements</p>
        </div>
      </div>
    </ContentSection>
  );
}
