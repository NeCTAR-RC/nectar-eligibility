import { Alert } from "@ardc-ui/react";
import { useAssessmentStore } from "../../store/assessmentStore";

/**
 * Tells the reader their saved assessment could not be restored.
 *
 * `role="alert"` overrides Alert's default `note` role: the message arrives
 * after a redirect rather than with the page, so it has to be announced when
 * it appears.
 */
export default function SessionAlert() {
  const sessionExpired = useAssessmentStore((s) => s.sessionExpired);

  if (!sessionExpired) return null;

  return (
    <Alert tone="info" role="alert">
      Your previous session could not be restored. A new assessment has been
      started.
    </Alert>
  );
}
