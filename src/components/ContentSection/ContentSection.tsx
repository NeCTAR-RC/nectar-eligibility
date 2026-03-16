import styles from "./ContentSection.module.scss";

interface Props {
  title: React.ReactNode;
  description?: React.ReactNode;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
  className?: string;
  children?: React.ReactNode;
}

export default function ContentSection({
  title,
  description,
  headingRef,
  className,
  children,
}: Props) {
  const sectionClass = className
    ? `${styles.section} ${className}`
    : styles.section;

  return (
    <div className={sectionClass}>
      <div className={styles.heading}>
        <h5 ref={headingRef} tabIndex={headingRef ? -1 : undefined}>
          {title}
        </h5>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
