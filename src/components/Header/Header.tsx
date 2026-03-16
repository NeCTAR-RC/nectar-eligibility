import { Link } from "@ardc-ui/react";
import logo from "../../assets/ardc_nectar_research_cloud.svg";
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href="/" className={styles.brand}>
          <img
            src={logo}
            alt="ARDC Nectar Research Cloud"
            className={styles.logo}
          />
          <span className={styles.title}>Eligibility Assessment</span>
        </a>
        <Link
          href="https://support.ehelp.edu.au"
          target="_blank"
          rel="noopener noreferrer"
          variant="outline-primary"
          iconAfter="arrow-up-right-from-square"
          aria-label="Support Centre (opens in a new tab)"
        >
          Support Centre
        </Link>
      </div>
    </header>
  );
}
