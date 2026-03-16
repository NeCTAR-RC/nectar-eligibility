import { useAssessmentStore } from "../../store/assessmentStore";
import styles from "./SessionAlert.module.scss";

export default function SessionAlert() {
  const sessionExpired = useAssessmentStore((s) => s.sessionExpired);

  if (!sessionExpired) return null;

  return (
    <div role="alert" className={styles.alert}>
      Your previous session could not be restored. A new assessment has been
      started.
    </div>
  );
}
