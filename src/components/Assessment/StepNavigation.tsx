import { Button } from "@ardc-ui/react";
import { useAssessmentNav } from "../../store/useAssessmentNav";
import styles from "./StepNavigation.module.scss";

export default function StepNavigation() {
  const {
    isFirstStep,
    canContinue,
    currentStepId,
    goToNextStep,
    goToPreviousStep,
    handleStartOver,
  } = useAssessmentNav();

  // The requirements step is the only one that leads to the result page,
  // so its Continue button names the destination.
  const continueLabel =
    currentStepId === "eligibility-info" ? "Continue to summary" : "Continue";

  return (
    <nav className={styles.nav} aria-label="Assessment navigation">
      <div className={styles.buttons}>
        <Button
          variant="secondary"
          onPress={goToPreviousStep}
          isDisabled={isFirstStep}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          onPress={goToNextStep}
          isDisabled={!canContinue}
        >
          {continueLabel}
        </Button>
      </div>
      {!isFirstStep && (
        <div className={styles.startOver}>
          <Button variant="link" iconBefore="rotate" onPress={handleStartOver}>
            Start over
          </Button>
        </div>
      )}
    </nav>
  );
}
