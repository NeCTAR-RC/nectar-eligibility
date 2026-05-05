import { useEffect, useRef } from "react";
import { useAssessmentNav } from "../../store/useAssessmentNav";
import { useHydration } from "../../store/useHydration";
import type { StepId } from "../../store/types";
import PageShell from "../PageShell/PageShell";
import StepNavigation from "./StepNavigation";
import ProfessionalRole from "./steps/ProfessionalRole";
import AustralianAffiliation from "./steps/AustralianAffiliation";
import AucklandAffiliation from "./steps/AucklandAffiliation";
import FundingSource from "./steps/FundingSource";
import MemberOrganisation from "./steps/MemberOrganisation";
import EligibilityInfo from "./steps/EligibilityInfo";
import ResultPage from "../Result/ResultPage";
import SessionAlert from "./SessionAlert";
import styles from "./AssessmentPage.module.scss";
import utils from "../../styles/utilities.module.scss";

type AssessmentStepId = Exclude<StepId, "result">;

const STEP_COMPONENTS: Record<
  AssessmentStepId,
  React.ComponentType<{
    headingRef: React.RefObject<HTMLHeadingElement | null>;
  }>
> = {
  "professional-role": ProfessionalRole,
  "australian-affiliation": AustralianAffiliation,
  "auckland-affiliation": AucklandAffiliation,
  "funding-source": FundingSource,
  "member-organisation": MemberOrganisation,
  "eligibility-info": EligibilityInfo,
};

const STEP_LABELS: Record<AssessmentStepId, string> = {
  "professional-role": "Professional Role",
  "australian-affiliation": "Australian Affiliation",
  "auckland-affiliation": "Auckland Affiliation",
  "funding-source": "Funding Source",
  "member-organisation": "Member Organisation",
  "eligibility-info": "Eligibility Information",
};

export default function AssessmentPage() {
  const { sessionId, currentStepId, stepHistory, isFirstStep } =
    useAssessmentNav();
  useHydration();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevStepRef = useRef(currentStepId);

  useEffect(() => {
    if (prevStepRef.current !== currentStepId) {
      prevStepRef.current = currentStepId;
      headingRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStepId]);

  if (currentStepId === "result") {
    return <ResultPage />;
  }

  const StepComponent = STEP_COMPONENTS[currentStepId];

  return (
    <PageShell
      title={
        <>
          ARDC Nectar Research Cloud
          <br />
          Eligibility Assessment
        </>
      }
      subtitle={
        isFirstStep ? (
          <>
            <p className={styles.introLead}>
              Check your eligibility for cloud resources and services. This
              quick 3–5 question assessment will help determine whether you meet
              the requirements for a national or local allocation on the Nectar
              Cloud.
            </p>
            <p className={styles.introNote}>
              This assessment is for self-guidance only. No personal data or
              sensitive information is stored during this process.
            </p>
          </>
        ) : undefined
      }
    >
      <SessionAlert />
      <div className={styles.stepGroup}>
        {currentStepId !== "eligibility-info" && (
          <p className={styles.questionNumber}>
            Question {stepHistory.length + 1}
          </p>
        )}
        <StepComponent key={sessionId} headingRef={headingRef} />
      </div>
      <StepNavigation />
      <div className={utils.srOnly} aria-live="polite" aria-atomic="true">
        {`Question ${stepHistory.length + 1}: ${STEP_LABELS[currentStepId]}`}
      </div>
    </PageShell>
  );
}
