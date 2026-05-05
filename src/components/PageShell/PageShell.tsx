import type { RefObject } from "react";
import styles from "./PageShell.module.scss";

interface PageShellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
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
        <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
          {title}
        </h1>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </header>
      <div className={styles.card}>{children}</div>
    </div>
  );
}
