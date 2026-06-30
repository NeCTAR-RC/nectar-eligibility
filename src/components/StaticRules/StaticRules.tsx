import {
  PROFESSIONAL_ROLE_QUESTION,
  ROLE_OPTIONS,
} from "../../data/assessment/professionalRole";
import { AUSTRALIAN_AFFILIATION_QUESTION } from "../../data/assessment/australianAffiliation";
import { AUCKLAND_AFFILIATION_QUESTION } from "../../data/assessment/aucklandAffiliation";
import {
  FUNDING_SOURCE_QUESTION,
  FUNDING_OPTIONS,
} from "../../data/assessment/fundingSource";
import { FUNDING_SOURCE_DESCRIPTION } from "../../data/assessment/fundingSourceDescription";
import {
  MEMBER_ORGANISATION_QUESTION,
  MEMBER_ORGANISATION_DESCRIPTION,
} from "../../data/assessment/memberOrganisation";
import { organisations } from "../../data/organisations";
import { ELIGIBILITY_INFO_CONTENT } from "../../data/eligibilityInfo";
import { DISCLAIMERS } from "../../data/result/headings";
import { NEXT_STEPS, NEXT_STEPS_SUBTITLE } from "../../data/result/nextSteps";
import { OUTCOME_ACTIONS } from "../../data/result/actions";
import { SERVICES } from "../../data/result/eligibleServices";
import type { EligibilityOutcome } from "../../store/types";

const OUTCOMES: EligibilityOutcome[] = ["national", "local", "not-eligible"];

// Static, no-JavaScript text version of the eligibility rules. Rendered to HTML
// at build time by scripts/prerender.mjs and injected into the <noscript> of
// index.html, so clients without JavaScript (including LLM page fetchers) get a
// readable, themed version that they can use to determine eligibility. All
// content is imported from the same data modules the interactive app uses, so it
// cannot drift. Styled by the .static-rules block in src/styles/_static-rules.scss.
export default function StaticRules() {
  return (
    <div className="static-rules" data-static-rules>
      <h2 className="title">ARDC Nectar Research Cloud: Eligibility rules</h2>
      <p className="note">
        You are seeing this text version because JavaScript is turned off. The
        full eligibility rules are below so you can work out your eligibility
        without it. To use the guided, step-by-step assessment instead, enable
        JavaScript and reload this page.
      </p>

      <section>
        <h3>How eligibility is determined</h3>
        <p>
          Answer the questions in order. Some questions are only reached
          depending on your earlier answers.
        </p>
        <ol>
          <li>
            <strong>{PROFESSIONAL_ROLE_QUESTION}</strong> (for information only;
            this does not affect the outcome)
            <ul>
              {ROLE_OPTIONS.map((option) => (
                <li key={option.value}>{option.label}</li>
              ))}
            </ul>
          </li>
          <li>
            <strong>{AUSTRALIAN_AFFILIATION_QUESTION}</strong>
            <ul>
              <li>Yes: continue to question 4.</li>
              <li>No: continue to question 3.</li>
            </ul>
          </li>
          <li>
            <strong>{AUCKLAND_AFFILIATION_QUESTION}</strong>
            <ul>
              <li>Yes: continue to question 4.</li>
              <li>No: you are not eligible for an allocation.</li>
            </ul>
          </li>
          <li>
            <strong>{FUNDING_SOURCE_QUESTION}</strong>
            <p className="note">{FUNDING_SOURCE_DESCRIPTION}</p>
            <ul>
              {FUNDING_OPTIONS.map((option) => (
                <li key={option.value}>{option.label}</li>
              ))}
            </ul>
            <p>
              If you select any option other than &ldquo;None of the
              above&rdquo;, you may be eligible for a national allocation. If
              you select only &ldquo;None of the above&rdquo;, continue to
              question 5.
            </p>
          </li>
          <li>
            <strong>{MEMBER_ORGANISATION_QUESTION}</strong>
            <p className="note">{MEMBER_ORGANISATION_DESCRIPTION}</p>
            <p>
              <strong>Member organisations:</strong>
            </p>
            <ul>
              {organisations.map((organisation) => (
                <li key={organisation.id}>{organisation.name}</li>
              ))}
            </ul>
            <p>
              If you (or your collaborators) are affiliated with one of these,
              you may be eligible for a local allocation. Otherwise, you are not
              eligible for an allocation.
            </p>
          </li>
        </ol>
      </section>

      <section>
        <h3>Outcomes</h3>
        {OUTCOMES.map((outcome) => {
          const info = ELIGIBILITY_INFO_CONTENT[outcome];
          const disclaimer = DISCLAIMERS[outcome];
          const nextStepsSubtitle = NEXT_STEPS_SUBTITLE[outcome];
          const action = OUTCOME_ACTIONS[outcome];
          return (
            <div className="card outcome" key={outcome}>
              <h4>{info.heading}</h4>
              <p>{info.body}</p>
              {disclaimer ? <p className="note">{disclaimer}</p> : null}
              <h5>{info.requirementsHeading}</h5>
              <ul>
                {info.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
              {nextStepsSubtitle ? <p>{nextStepsSubtitle}</p> : null}
              <ul>
                {NEXT_STEPS[outcome].map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
              <p>
                <a
                  href={action.primary.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {action.primary.label}
                </a>
              </p>
            </div>
          );
        })}
      </section>

      <section>
        <h3>ARDC Nectar services</h3>
        <ul>
          {SERVICES.map((service) => (
            <li key={service.id}>
              <a href={service.href} target="_blank" rel="noopener noreferrer">
                {service.name}
              </a>
              {`: ${service.description}`}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
