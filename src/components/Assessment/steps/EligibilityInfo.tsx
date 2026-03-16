import { CheckboxGroup, CheckboxGroupItem } from "@ardc-ui/react";
import { useAssessmentStore } from "../../../store/assessmentStore";
import { ELIGIBILITY_INFO_CONTENT } from "../../../data/eligibilityInfo";
import CheckIcon from "../../../assets/icons/CheckIcon";
import XIcon from "../../../assets/icons/XIcon";
import styles from "./EligibilityInfo.module.scss";

interface Props {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}

const OUTCOME_ICONS = {
  national: <CheckIcon className={`${styles.icon} ${styles.iconSuccess}`} />,
  local: <CheckIcon className={`${styles.icon} ${styles.iconSuccess}`} />,
  "not-eligible": <XIcon className={`${styles.icon} ${styles.iconDanger}`} />,
};

export default function EligibilityInfo({ headingRef }: Props) {
  const outcome = useAssessmentStore((s) => s.outcome);
  const acknowledged = useAssessmentStore(
    (s) => s.answers.acknowledgedRequirements,
  );
  const setAnswer = useAssessmentStore((s) => s.setAnswer);

  if (!outcome) return null;

  const content = ELIGIBILITY_INFO_CONTENT[outcome];

  return (
    <div className={styles.info}>
      <div className={styles.header}>
        {OUTCOME_ICONS[outcome]}
        <h5 ref={headingRef} tabIndex={-1}>
          {content.heading}
        </h5>
      </div>
      <p>
        <strong>{content.body}</strong>
      </p>
      <div className={styles.requirementsGroup}>
        <p>{content.requirementsHeading}</p>
        <ol className={styles.requirements}>
          {content.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ol>
      </div>
      <CheckboxGroup
        value={acknowledged ? ["acknowledged"] : []}
        onChange={(values) =>
          setAnswer("acknowledgedRequirements", values.includes("acknowledged"))
        }
        aria-label="Acknowledge requirements"
      >
        <CheckboxGroupItem value="acknowledged">
          I understand the requirements.
        </CheckboxGroupItem>
      </CheckboxGroup>
    </div>
  );
}
