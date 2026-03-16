import { Link } from "@ardc-ui/react";
import ncrisLogo from "../../assets/ncris-provider.svg";
import ardcLogo from "../../assets/ardc-logo.svg";
import styles from "./Footer.module.scss";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.mainRow}>
        <div className={styles.mainGrid}>
          <div className={styles.logoColumn}>
            <div className={styles.logos}>
              <a
                href="https://www.education.gov.au/ncris"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={ncrisLogo}
                  width="176"
                  height="127"
                  alt="National Collaborative Research Infrastructure Strategy"
                />
              </a>
              <a
                href="https://ardc.edu.au/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={ardcLogo}
                  width="176"
                  height="57"
                  alt="Australian Research Data Commons"
                />
              </a>
            </div>
            <p className={styles.logoDescription}>
              The Australian Research Data Commons is enabled by NCRIS.
            </p>
          </div>

          <div className={styles.newsletterColumn}>
            <h4 className={styles.heading}>ARDC Connect Newsletter</h4>
            <p>
              Subscribe to the ARDC Connect Newsletter to keep up-to-date with
              the latest digital research news, events, resources, career
              opportunities and more.
            </p>
            <Link
              href="https://ardc.edu.au/news-and-events/subscribe/"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              iconAfter="arrow-up-right-from-square"
              chevronRight
              aria-label="Subscribe to ARDC newsletter (opens in a new tab)"
            >
              Subscribe
            </Link>
          </div>

          <nav className={styles.linksColumn} aria-label="Footer links">
            <h4 className={styles.heading}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a
                  href="https://dashboard.rc.nectar.org.au/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nectar Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="https://support.nectar.org.au/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nectar Support
                </a>
              </li>
              <li>
                <a
                  href="https://ardc.edu.au/services/ardc-nectar-research-cloud/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  About Nectar
                </a>
              </li>
              <li>
                <a
                  href="https://ardc.edu.au/services/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ARDC Services for Research
                </a>
              </li>
              <li>
                <a
                  href="https://ardc.edu.au/contact-us/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact ARDC
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className={styles.acknowledgementRow}>
        <div className={styles.acknowledgement}>
          <p>
            We acknowledge and celebrate the First Australians on whose
            traditional lands we live and work, and we pay our respects to
            Elders past, present and emerging.
          </p>
        </div>
      </div>

      <div className={styles.copyrightRow}>
        <div className={styles.copyrightBar}>
          <span className={styles.copyrightText}>
            Copyright &copy; {year} ARDC.{" "}
            <a
              href="https://www.acnc.gov.au/charity/charities/eca273f3-f5be-e911-a98a-000d3ad02a61/profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              ACN 633 798 857
            </a>
          </span>
          <a
            href="https://ardc.edu.au/terms-and-conditions/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Terms and Conditions
          </a>
          <a
            href="https://ardc.edu.au/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Privacy Policy
          </a>
          <a
            href="https://ardc.edu.au/accessibility-statement-for-ardc/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Accessibility Statement
          </a>
        </div>
      </div>
    </footer>
  );
}
