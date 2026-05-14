import type { EligibilityOutcome } from "../store/types";

export interface EligibilityInfoContent {
  heading: string;
  body: string;
  requirementsHeading: string;
  requirements: React.ReactNode[];
}

export const ELIGIBILITY_INFO_CONTENT: Record<
  EligibilityOutcome,
  EligibilityInfoContent
> = {
  national: {
    heading: "You may be eligible for a national allocation.",
    body: "It looks like you may be eligible for a national allocation on the Nectar Cloud. But there are some other requirements you must consider before applying for an allocation.",
    requirementsHeading: "Requirements for Nectar Project Allocations:",
    requirements: [
      <>
        You need{" "}
        <a
          href="https://support.ehelp.edu.au/support/solutions/articles/6000055377"
          target="_blank"
          rel="noopener noreferrer"
        >
          AAF or Tuakiri account
        </a>{" "}
        credentials to log into the Nectar Dashboard.
      </>,
      <>
        You must follow the{" "}
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
        You must have an{" "}
        <a
          href="https://support.ehelp.edu.au/support/solutions/articles/6000277260"
          target="_blank"
          rel="noopener noreferrer"
        >
          ORCID account to link to your Nectar account
        </a>
        .
      </>,
      "You must agree to the terms of the service.",
    ],
  },
  local: {
    heading: "You may be eligible for a local allocation.",
    body: "It looks like you may be eligible for a local allocation, pending your institution and the ARDC Nectar node's discretion. But there are some other requirements you must consider before applying for an allocation.",
    requirementsHeading: "Requirements for Nectar Project Allocations:",
    requirements: [
      <>
        You need AAF or Tuakiri account credentials to{" "}
        <a
          href="https://support.ehelp.edu.au/support/solutions/articles/6000055377"
          target="_blank"
          rel="noopener noreferrer"
        >
          log into the Nectar Dashboard
        </a>
        .
      </>,
      <>
        You must follow the{" "}
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
        You must have an{" "}
        <a
          href="https://support.ehelp.edu.au/support/solutions/articles/6000277260"
          target="_blank"
          rel="noopener noreferrer"
        >
          ORCID account to link to your Nectar account
        </a>
        .
      </>,
      "You must agree to the terms of the service.",
    ],
  },
  "not-eligible": {
    heading: "You are not eligible for an allocation on the Nectar Cloud.",
    body: "The selections you have made in this assessment indicate that you are not eligible for an allocation on the Nectar Cloud. However, you may still be able to access the Nectar Cloud with a 6 month project trial or use other ARDC services powered by the Nectar Cloud, providing you meet the requirements.",
    requirementsHeading:
      "Requirements for a project trial or ARDC services powered by the Nectar Cloud:",
    requirements: [
      <>
        You will need an{" "}
        <a
          href="https://support.ehelp.edu.au/support/solutions/articles/6000055377"
          target="_blank"
          rel="noopener noreferrer"
        >
          AAF or Tuakiri account
        </a>{" "}
        to log in.
      </>,
      "You must agree to the terms of the service.",
    ],
  },
};
