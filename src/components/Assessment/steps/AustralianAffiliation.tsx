import { ToggleButtonGroup, ToggleButtonGroupItem } from "@ardc-ui/react";
import { useAssessmentStore } from "../../../store/assessmentStore";
import type { YesNo } from "../../../store/types";
import { AUSTRALIAN_AFFILIATION_QUESTION } from "../../../data/assessment/australianAffiliation";
import ContentSection from "../../ContentSection/ContentSection";
import utils from "../../../styles/utilities.module.scss";

interface Props {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}

export default function AustralianAffiliation({ headingRef }: Props) {
  const answer = useAssessmentStore((s) => s.answers.australianAffiliation);
  const setAnswer = useAssessmentStore((s) => s.setAnswer);

  const selectedKeys = answer ? new Set([answer]) : new Set<string>();

  return (
    <ContentSection
      title={AUSTRALIAN_AFFILIATION_QUESTION}
      headingRef={headingRef}
    >
      <ToggleButtonGroup
        className={utils.fitContent}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => {
          const selected = [...keys][0] as YesNo | undefined;
          if (selected) setAnswer("australianAffiliation", selected);
        }}
        aria-label={AUSTRALIAN_AFFILIATION_QUESTION}
      >
        <ToggleButtonGroupItem id="yes">Yes</ToggleButtonGroupItem>
        <ToggleButtonGroupItem id="no">No</ToggleButtonGroupItem>
      </ToggleButtonGroup>
    </ContentSection>
  );
}
