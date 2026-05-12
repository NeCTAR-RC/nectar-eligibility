import {
  ToggleButtonGroup,
  ToggleButtonGroupItem,
  Combobox,
  ComboboxItem,
  Label,
} from "@ardc-ui/react";
import { useAssessmentStore } from "../../../store/assessmentStore";
import { organisations } from "../../../data/organisations";
import {
  MEMBER_ORGANISATION_QUESTION,
  MEMBER_ORGANISATION_DESCRIPTION,
} from "../../../data/assessment/memberOrganisation";
import type { YesNo } from "../../../store/types";
import ContentSection from "../../ContentSection/ContentSection";
import styles from "./MemberOrganisation.module.scss";
import utils from "../../../styles/utilities.module.scss";

interface Props {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}

export default function MemberOrganisation({ headingRef }: Props) {
  const answer = useAssessmentStore((s) => s.answers.memberOrganisation);
  const selectedOrg = useAssessmentStore((s) => s.answers.selectedOrganisation);
  const setAnswer = useAssessmentStore((s) => s.setAnswer);

  const selectedKeys = answer ? new Set([answer]) : new Set<string>();

  return (
    <ContentSection
      title={MEMBER_ORGANISATION_QUESTION}
      description={MEMBER_ORGANISATION_DESCRIPTION}
      headingRef={headingRef}
    >
      <ToggleButtonGroup
        className={utils.fitContent}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => {
          const selected = [...keys][0] as YesNo | undefined;
          if (selected) {
            setAnswer("memberOrganisation", selected);
            if (selected === "no") {
              setAnswer("selectedOrganisation", null);
            }
          }
        }}
        aria-label={MEMBER_ORGANISATION_QUESTION}
      >
        <ToggleButtonGroupItem id="yes">Yes</ToggleButtonGroupItem>
        <ToggleButtonGroupItem id="no">No</ToggleButtonGroupItem>
      </ToggleButtonGroup>

      {answer === "yes" && (
        <div className={styles.orgSelection}>
          <Combobox
            placeholder="Type to search..."
            selectedKey={selectedOrg}
            onSelectionChange={(key) =>
              setAnswer("selectedOrganisation", key as string | null)
            }
          >
            <Label>Select organisation (optional)</Label>
            {organisations.map((org) => (
              <ComboboxItem key={org.id} id={org.id}>
                {org.name}
              </ComboboxItem>
            ))}
          </Combobox>
        </div>
      )}
    </ContentSection>
  );
}
