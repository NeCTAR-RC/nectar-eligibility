import type { RefObject } from "react";
import styles from "./PageShell.module.scss";

interface PageShellProps {
  title: React.ReactNode;
  subtitle?: string;
  headingRef?: RefObject<HTMLHeadingElement | null>;
  children: React.ReactNode;
}

export default function PageShell({
  title,
  subtitle,
  headingRef,
  children,
}: PageShellProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h3 ref={headingRef} tabIndex={-1} className={styles.title}>
          {title}
        </h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>
      <div className={styles.body}>
        <div className={styles.card}>{children}</div>
      </div>
    </div>
  );
}
