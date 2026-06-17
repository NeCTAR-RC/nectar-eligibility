import { Link } from "@ardc-ui/react";
import type { EligibilityOutcome } from "../../store/types";
import { SERVICES } from "../../data/result/eligibleServices";
import { trackCtaClick } from "../../services/analytics";
import ContentSection from "../ContentSection/ContentSection";
import styles from "./EligibleServices.module.scss";

interface Props {
  outcome: EligibilityOutcome;
  sessionId: string | null;
}

export default function EligibleServices({ outcome, sessionId }: Props) {
  // SERVICES leads with the Nectar Research Cloud for eligible scenarios; the
  // not-eligible list moves it to the end and appends "(Project Trial)" to flag
  // the limited, trial-only access.
  const orderedServices =
    outcome === "not-eligible"
      ? [
          ...SERVICES.filter((s) => s.id !== "nectar-dashboard"),
          ...SERVICES.filter((s) => s.id === "nectar-dashboard"),
        ]
      : SERVICES;

  return (
    <ContentSection title="ARDC Services">
      <div className={styles.grid}>
        {orderedServices.map((service) => {
          const displayName =
            outcome === "not-eligible" && service.id === "nectar-dashboard"
              ? `${service.name} (Project Trial)`
              : service.name;

          return (
            <div key={service.id}>
              <Link
                href={service.href}
                target="_blank"
                variant="link"
                chevronRight
                onPress={() => {
                  if (sessionId) trackCtaClick(outcome, service.id, sessionId);
                }}
              >
                {displayName}
              </Link>
              <p className={styles.description}>{service.description}</p>
            </div>
          );
        })}
      </div>
    </ContentSection>
  );
}
