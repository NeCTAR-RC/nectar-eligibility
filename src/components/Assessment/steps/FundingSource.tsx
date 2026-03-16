import { CheckboxGroup, CheckboxGroupItem } from "@ardc-ui/react";
import { useAssessmentStore } from "../../../store/assessmentStore";
import type { FundingSource as FundingSourceType } from "../../../store/types";
import {
  FUNDING_SOURCE_QUESTION,
  FUNDING_OPTIONS,
} from "../../../data/assessment/fundingSource";
import ContentSection from "../../ContentSection/ContentSection";

interface Props {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}

export default function FundingSource({ headingRef }: Props) {
  const funding = useAssessmentStore((s) => s.answers.funding);
  const setAnswer = useAssessmentStore((s) => s.setAnswer);

  const handleChange = (newValues: string[]) => {
    const wasNoneSelected = funding.includes("none-of-the-above");
    const isNoneNowSelected = newValues.includes("none-of-the-above");

    if (isNoneNowSelected && !wasNoneSelected) {
      setAnswer("funding", ["none-of-the-above"]);
    } else if (isNoneNowSelected && newValues.length > 1) {
      setAnswer(
        "funding",
        newValues.filter(
          (v) => v !== "none-of-the-above",
        ) as FundingSourceType[],
      );
    } else {
      setAnswer("funding", newValues as FundingSourceType[]);
    }
  };

  return (
    <ContentSection
      title={FUNDING_SOURCE_QUESTION}
      description="Check all that apply."
      headingRef={headingRef}
    >
      <CheckboxGroup
        value={funding}
        onChange={handleChange}
        aria-label={FUNDING_SOURCE_QUESTION}
      >
        {FUNDING_OPTIONS.map((opt) => (
          <CheckboxGroupItem key={opt.value} value={opt.value}>
            {opt.label}
          </CheckboxGroupItem>
        ))}
      </CheckboxGroup>
    </ContentSection>
  );
}
