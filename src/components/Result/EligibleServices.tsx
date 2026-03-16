import { Link } from "@ardc-ui/react";
import type { EligibilityOutcome } from "../../store/types";
import { SERVICES } from "../../data/result/eligibleServices";
import ContentSection from "../ContentSection/ContentSection";
import styles from "./EligibleServices.module.scss";

interface Props {
  outcome: EligibilityOutcome;
}

export default function EligibleServices({ outcome }: Props) {
  const title =
    outcome === "not-eligible" ? "ARDC Services" : "Eligible Services";

  return (
    <ContentSection title={title}>
      <div className={styles.grid}>
        {SERVICES.map((service) => {
          const displayName =
            outcome === "not-eligible" && service.name === "Nectar Dashboard"
              ? "Nectar Dashboard (Project Trial)"
              : service.name;

          return (
            <div key={service.name}>
              <Link
                href={service.href}
                target="_blank"
                variant="link"
                chevronRight
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
