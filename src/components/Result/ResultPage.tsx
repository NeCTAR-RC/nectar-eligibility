import { useRef, useState } from "react";
import { Button, Link } from "@ardc-ui/react";
import { useAssessmentStore } from "../../store/assessmentStore";
import { useAssessmentNav } from "../../store/useAssessmentNav";
import { OUTCOME_ACTIONS } from "../../data/result/actions";
import { downloadPdf } from "../../pdf/html2pdf/downloadPdf";
import { trackPdfDownload, trackCtaClick } from "../../services/analytics";
import PageShell from "../PageShell/PageShell";
import AssessmentResult from "./AssessmentResult";
import NextSteps from "./NextSteps";
import EligibleServices from "./EligibleServices";
import AssessmentPath from "./AssessmentPath";
import FeedbackSection from "./FeedbackSection";
import styles from "./ResultPage.module.scss";

export default function ResultPage() {
  const outcome = useAssessmentStore((s) => s.outcome);
  const answers = useAssessmentStore((s) => s.answers);
  const { sessionId, stepHistory, handleStartOver } = useAssessmentNav();
  const downloadBtnRef = useRef<HTMLButtonElement>(null);
  const startOverRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!outcome) return null;

  const actions = OUTCOME_ACTIONS[outcome];

  async function handleDownloadPdf() {
    if (sessionId && outcome) {
      trackPdfDownload(outcome, sessionId);
    }
    const elementsToHide = [
      downloadBtnRef.current,
      startOverRef.current,
      feedbackRef.current,
    ].filter(Boolean) as HTMLElement[];
    setDownloading(true);
    try {
      await downloadPdf(elementsToHide);
    } finally {
      setDownloading(false);
    }
  }

  function handleCtaClick() {
    if (sessionId && outcome) {
      trackCtaClick(outcome, actions.primary.label, sessionId);
    }
  }

  return (
    <>
      <PageShell
        title="Assessment Summary"
        subtitle="You have completed the assessment for resource allocation and services on the ARDC Nectar Research Cloud. Based on the information you provided, the following recommendations and options are available to you."
      >
        <AssessmentResult outcome={outcome} />
        <NextSteps outcome={outcome} />
        <EligibleServices outcome={outcome} sessionId={sessionId} />
        <AssessmentPath
          stepHistory={stepHistory}
          answers={answers}
          outcome={outcome}
        />

        <nav className={styles.actions} aria-label="Result actions">
          <div className={styles.buttons}>
            {downloading ? (
              <Button
                ref={downloadBtnRef}
                variant="secondary"
                isDisabled
                state="loading"
                loadingText="Generating…"
              >
                Download Summary
              </Button>
            ) : (
              <Button
                ref={downloadBtnRef}
                variant="secondary"
                iconBefore="pdf"
                onPress={handleDownloadPdf}
              >
                Download Summary
              </Button>
            )}
            <Link
              href={actions.primary.href}
              target="_blank"
              variant="primary"
              onPress={handleCtaClick}
            >
              {actions.primary.label}
            </Link>
          </div>
          <div ref={startOverRef} className={styles.startOver}>
            <Button
              variant="link"
              iconBefore="rotate"
              onPress={handleStartOver}
            >
              Start over
            </Button>
          </div>
        </nav>
      </PageShell>

      <div ref={feedbackRef} className={styles.feedback}>
        <FeedbackSection outcome={outcome} sessionId={sessionId} />
      </div>
    </>
  );
}
