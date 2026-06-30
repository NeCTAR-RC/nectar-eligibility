import { Link } from "@ardc-ui/react";
import type { EligibilityOutcome } from "../../store/types";
import { trackCtaClick } from "../../services/analytics";
import styles from "./FeedbackSection.module.scss";

// Short experience survey for the Eligibility Assessment Tool.
const SURVEY_URL = "https://forms.gle/1Z1EYSUJmd6YWFjk8";

interface Props {
  outcome: EligibilityOutcome;
  sessionId: string | null;
}

export default function FeedbackSection({ outcome, sessionId }: Props) {
  function handleSurveyClick() {
    // @ardc-ui/react Links stop click propagation, so GA4 auto outbound-click
    // tracking never fires, so track explicitly (see CLAUDE.md house rule).
    if (sessionId) trackCtaClick(outcome, "feedback-survey", sessionId);
  }

  return (
    <section className={styles.banner} aria-labelledby="feedback-heading">
      <div className={styles.content}>
        <p className={styles.eyebrow}>We want your feedback</p>
        <h2 id="feedback-heading" className={styles.heading}>
          Help us improve the Eligibility Assessment Tool
        </h2>
        <p className={styles.body}>
          Take a short 5-minute survey to tell us about your experience. Your
          input helps us make the tool easier to use for the research community.
        </p>
      </div>
      <Link
        href={SURVEY_URL}
        target="_blank"
        variant="primary"
        tone="navigation"
        iconAfter="arrow-up-right-from-square"
        aria-label="Start the survey (opens in a new tab)"
        onPress={handleSurveyClick}
      >
        Start the survey
      </Link>
    </section>
  );
}
