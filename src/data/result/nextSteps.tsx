import type { EligibilityOutcome } from "../../store/types";

const ELIGIBLE_STEPS: React.ReactNode[] = [
  <>
    Review the{" "}
    <a
      href="https://support.ehelp.edu.au/support/solutions/articles/6000277743"
      target="_blank"
      rel="noopener noreferrer"
    >
      Sensitive Data Guidelines
    </a>
    .
  </>,
  <>
    Ensure you have institutional credentials to log in to the Nectar Dashboard
    (via an{" "}
    <a
      href="https://support.ehelp.edu.au/support/solutions/articles/6000055377"
      target="_blank"
      rel="noopener noreferrer"
    >
      AAF or Tuakiri account
    </a>
    ).
  </>,
  <>
    <a
      href="https://support.ehelp.edu.au/support/solutions/articles/6000277260"
      target="_blank"
      rel="noopener noreferrer"
    >
      Connect your ORCID
    </a>{" "}
    to your Nectar account.
  </>,
  <>
    Learn about{" "}
    <a
      href="https://support.ehelp.edu.au/support/solutions/articles/6000171494"
      target="_blank"
      rel="noopener noreferrer"
    >
      project allocation and expiry
    </a>
    .
  </>,
];

const ELIGIBLE_STEPS_SUBTITLE =
  "Before applying for an allocation, complete any of the following steps that you have not already completed.";

export const NEXT_STEPS_SUBTITLE: Partial<Record<EligibilityOutcome, string>> =
  {
    national: ELIGIBLE_STEPS_SUBTITLE,
    local: ELIGIBLE_STEPS_SUBTITLE,
  };

export const NEXT_STEPS: Record<EligibilityOutcome, React.ReactNode[]> = {
  national: ELIGIBLE_STEPS,
  local: ELIGIBLE_STEPS,
  "not-eligible": [
    <>
      You can still log in to the dashboard with institutional credentials (via
      an{" "}
      <a
        href="https://support.ehelp.edu.au/support/solutions/articles/6000055377"
        target="_blank"
        rel="noopener noreferrer"
      >
        AAF or Tuakiri account
      </a>
      ) and start a{" "}
      <a
        href="https://support.ehelp.edu.au/support/solutions/articles/6000068044"
        target="_blank"
        rel="noopener noreferrer"
      >
        6 month project trial
      </a>
      .
    </>,
    <>
      Depending on your specific cloud needs, you may like to try other eligible{" "}
      <a
        href="https://ardc.edu.au/services/ardc-nectar-research-cloud/"
        target="_blank"
        rel="noopener noreferrer"
      >
        ARDC Nectar Research Cloud Services
      </a>
      , available to users with AAF or Tuakiri account credentials, but you must
      first review the terms of the service.
    </>,
    <>
      We recommend you refer to your institution&apos;s cloud offerings, or{" "}
      <a
        href="https://ardc.edu.au/researcher/"
        target="_blank"
        rel="noopener noreferrer"
      >
        explore other ARDC resources available to researchers
      </a>
      .
    </>,
  ],
};
