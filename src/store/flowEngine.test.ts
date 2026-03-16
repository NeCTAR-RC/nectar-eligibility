import { describe, it, expect } from "vitest";
import type { AssessmentAnswers } from "./types";
import {
  INITIAL_ANSWERS,
  resolveNextStep,
  resolveOutcome,
  hasAnswerForStep,
  replayAnswers,
} from "./flowEngine";

function makeAnswers(
  overrides: Partial<AssessmentAnswers> = {},
): AssessmentAnswers {
  return { ...INITIAL_ANSWERS, ...overrides };
}

// ---------------------------------------------------------------------------
// resolveNextStep
// ---------------------------------------------------------------------------

describe("resolveNextStep", () => {
  it("professional-role always goes to australian-affiliation", () => {
    expect(resolveNextStep("professional-role", makeAnswers())).toBe(
      "australian-affiliation",
    );
  });

  it("australian-affiliation YES goes to funding-source", () => {
    expect(
      resolveNextStep(
        "australian-affiliation",
        makeAnswers({ australianAffiliation: "yes" }),
      ),
    ).toBe("funding-source");
  });

  it("australian-affiliation NO goes to auckland-affiliation", () => {
    expect(
      resolveNextStep(
        "australian-affiliation",
        makeAnswers({ australianAffiliation: "no" }),
      ),
    ).toBe("auckland-affiliation");
  });

  it("auckland-affiliation YES goes to funding-source", () => {
    expect(
      resolveNextStep(
        "auckland-affiliation",
        makeAnswers({ aucklandAffiliation: "yes" }),
      ),
    ).toBe("funding-source");
  });

  it("auckland-affiliation NO goes to eligibility-info", () => {
    expect(
      resolveNextStep(
        "auckland-affiliation",
        makeAnswers({ aucklandAffiliation: "no" }),
      ),
    ).toBe("eligibility-info");
  });

  it("funding-source with real funding goes to eligibility-info", () => {
    expect(
      resolveNextStep(
        "funding-source",
        makeAnswers({ funding: ["national-international-grant"] }),
      ),
    ).toBe("eligibility-info");
  });

  it("funding-source with multiple real funding goes to eligibility-info", () => {
    expect(
      resolveNextStep(
        "funding-source",
        makeAnswers({ funding: ["ncris", "government-grant"] }),
      ),
    ).toBe("eligibility-info");
  });

  it("funding-source with none-of-the-above goes to member-organisation", () => {
    expect(
      resolveNextStep(
        "funding-source",
        makeAnswers({ funding: ["none-of-the-above"] }),
      ),
    ).toBe("member-organisation");
  });

  it("funding-source with no funding goes to member-organisation", () => {
    expect(
      resolveNextStep("funding-source", makeAnswers({ funding: [] })),
    ).toBe("member-organisation");
  });

  it("member-organisation always goes to eligibility-info", () => {
    expect(resolveNextStep("member-organisation", makeAnswers())).toBe(
      "eligibility-info",
    );
  });

  it("eligibility-info always goes to result", () => {
    expect(resolveNextStep("eligibility-info", makeAnswers())).toBe("result");
  });
});

// ---------------------------------------------------------------------------
// resolveOutcome
// ---------------------------------------------------------------------------

describe("resolveOutcome", () => {
  it("returns not-eligible when both AU and Auckland are no", () => {
    expect(
      resolveOutcome(
        makeAnswers({
          australianAffiliation: "no",
          aucklandAffiliation: "no",
        }),
      ),
    ).toBe("not-eligible");
  });

  it("returns national when has real funding (AU yes)", () => {
    expect(
      resolveOutcome(
        makeAnswers({
          australianAffiliation: "yes",
          funding: ["national-international-grant"],
        }),
      ),
    ).toBe("national");
  });

  it("returns national when has real funding (Auckland yes)", () => {
    expect(
      resolveOutcome(
        makeAnswers({
          australianAffiliation: "no",
          aucklandAffiliation: "yes",
          funding: ["ncris"],
        }),
      ),
    ).toBe("national");
  });

  it("returns national with multiple funding sources", () => {
    expect(
      resolveOutcome(
        makeAnswers({
          australianAffiliation: "yes",
          funding: ["ncris", "government-grant", "industry-grant"],
        }),
      ),
    ).toBe("national");
  });

  it("returns local when member org is yes and no real funding", () => {
    expect(
      resolveOutcome(
        makeAnswers({
          australianAffiliation: "yes",
          funding: ["none-of-the-above"],
          memberOrganisation: "yes",
        }),
      ),
    ).toBe("local");
  });

  it("returns local when Auckland yes + no real funding + member org yes", () => {
    expect(
      resolveOutcome(
        makeAnswers({
          australianAffiliation: "no",
          aucklandAffiliation: "yes",
          funding: ["none-of-the-above"],
          memberOrganisation: "yes",
        }),
      ),
    ).toBe("local");
  });

  it("returns not-eligible when member org is no and no real funding", () => {
    expect(
      resolveOutcome(
        makeAnswers({
          australianAffiliation: "yes",
          funding: ["none-of-the-above"],
          memberOrganisation: "no",
        }),
      ),
    ).toBe("not-eligible");
  });

  it("returns null when no affiliation answers yet", () => {
    expect(resolveOutcome(makeAnswers())).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// hasAnswerForStep
// ---------------------------------------------------------------------------

describe("hasAnswerForStep", () => {
  it("professional-role: true when role set", () => {
    expect(
      hasAnswerForStep(
        "professional-role",
        makeAnswers({ role: "researcher" }),
      ),
    ).toBe(true);
  });

  it("professional-role: false when role null", () => {
    expect(hasAnswerForStep("professional-role", makeAnswers())).toBe(false);
  });

  it("funding-source: true when funding has entries", () => {
    expect(
      hasAnswerForStep(
        "funding-source",
        makeAnswers({ funding: ["none-of-the-above"] }),
      ),
    ).toBe(true);
  });

  it("funding-source: false when funding empty", () => {
    expect(hasAnswerForStep("funding-source", makeAnswers())).toBe(false);
  });

  it("eligibility-info: true when acknowledged", () => {
    expect(
      hasAnswerForStep(
        "eligibility-info",
        makeAnswers({ acknowledgedRequirements: true }),
      ),
    ).toBe(true);
  });

  it("australian-affiliation: true when answered", () => {
    expect(
      hasAnswerForStep(
        "australian-affiliation",
        makeAnswers({ australianAffiliation: "yes" }),
      ),
    ).toBe(true);
  });

  it("australian-affiliation: false when null", () => {
    expect(hasAnswerForStep("australian-affiliation", makeAnswers())).toBe(
      false,
    );
  });

  it("auckland-affiliation: true when answered", () => {
    expect(
      hasAnswerForStep(
        "auckland-affiliation",
        makeAnswers({ aucklandAffiliation: "no" }),
      ),
    ).toBe(true);
  });

  it("auckland-affiliation: false when null", () => {
    expect(hasAnswerForStep("auckland-affiliation", makeAnswers())).toBe(false);
  });

  it("member-organisation: true when answered", () => {
    expect(
      hasAnswerForStep(
        "member-organisation",
        makeAnswers({ memberOrganisation: "yes" }),
      ),
    ).toBe(true);
  });

  it("member-organisation: false when null", () => {
    expect(hasAnswerForStep("member-organisation", makeAnswers())).toBe(false);
  });

  it("eligibility-info: false when not acknowledged", () => {
    expect(hasAnswerForStep("eligibility-info", makeAnswers())).toBe(false);
  });

  it("result: always false", () => {
    expect(hasAnswerForStep("result", makeAnswers())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// replayAnswers — full flow paths
// ---------------------------------------------------------------------------

describe("replayAnswers", () => {
  it("stops at first unanswered step", () => {
    const result = replayAnswers(makeAnswers({ role: "researcher" }));
    expect(result.currentStepId).toBe("australian-affiliation");
    expect(result.stepHistory).toEqual(["professional-role"]);
    expect(result.outcome).toBeNull();
  });

  it("replays national allocation path (AU yes + real funding)", () => {
    const result = replayAnswers(
      makeAnswers({
        role: "researcher",
        australianAffiliation: "yes",
        funding: ["national-international-grant"],
        acknowledgedRequirements: true,
      }),
    );
    expect(result.currentStepId).toBe("result");
    expect(result.outcome).toBe("national");
    expect(result.stepHistory).toEqual([
      "professional-role",
      "australian-affiliation",
      "funding-source",
      "eligibility-info",
    ]);
  });

  it("replays national allocation path (Auckland yes + real funding)", () => {
    const result = replayAnswers(
      makeAnswers({
        role: "librarian-trainer",
        australianAffiliation: "no",
        aucklandAffiliation: "yes",
        funding: ["ncris"],
        acknowledgedRequirements: true,
      }),
    );
    expect(result.currentStepId).toBe("result");
    expect(result.outcome).toBe("national");
    expect(result.stepHistory).toEqual([
      "professional-role",
      "australian-affiliation",
      "auckland-affiliation",
      "funding-source",
      "eligibility-info",
    ]);
  });

  it("replays local allocation path (no funding + member org yes)", () => {
    const result = replayAnswers(
      makeAnswers({
        role: "manager",
        australianAffiliation: "yes",
        funding: ["none-of-the-above"],
        memberOrganisation: "yes",
        acknowledgedRequirements: true,
      }),
    );
    expect(result.currentStepId).toBe("result");
    expect(result.outcome).toBe("local");
    expect(result.stepHistory).toEqual([
      "professional-role",
      "australian-affiliation",
      "funding-source",
      "member-organisation",
      "eligibility-info",
    ]);
  });

  it("replays not-eligible path (AU no + Auckland no)", () => {
    const result = replayAnswers(
      makeAnswers({
        role: "researcher",
        australianAffiliation: "no",
        aucklandAffiliation: "no",
        acknowledgedRequirements: true,
      }),
    );
    expect(result.currentStepId).toBe("result");
    expect(result.outcome).toBe("not-eligible");
    expect(result.stepHistory).toEqual([
      "professional-role",
      "australian-affiliation",
      "auckland-affiliation",
      "eligibility-info",
    ]);
  });

  it("replays not-eligible path (no funding + member org no)", () => {
    const result = replayAnswers(
      makeAnswers({
        role: "research-support",
        australianAffiliation: "yes",
        funding: ["none-of-the-above"],
        memberOrganisation: "no",
        acknowledgedRequirements: true,
      }),
    );
    expect(result.currentStepId).toBe("result");
    expect(result.outcome).toBe("not-eligible");
    expect(result.stepHistory).toEqual([
      "professional-role",
      "australian-affiliation",
      "funding-source",
      "member-organisation",
      "eligibility-info",
    ]);
  });

  it("replays local allocation path via Auckland (no funding + member org yes)", () => {
    const result = replayAnswers(
      makeAnswers({
        role: "researcher",
        australianAffiliation: "no",
        aucklandAffiliation: "yes",
        funding: ["none-of-the-above"],
        memberOrganisation: "yes",
        acknowledgedRequirements: true,
      }),
    );
    expect(result.currentStepId).toBe("result");
    expect(result.outcome).toBe("local");
    expect(result.stepHistory).toEqual([
      "professional-role",
      "australian-affiliation",
      "auckland-affiliation",
      "funding-source",
      "member-organisation",
      "eligibility-info",
    ]);
  });

  it("trims irrelevant answers from different branch", () => {
    const result = replayAnswers(
      makeAnswers({
        role: "researcher",
        australianAffiliation: "yes",
        aucklandAffiliation: "yes", // should be trimmed — AU is yes
        funding: ["government-grant"],
        acknowledgedRequirements: true,
      }),
    );
    expect(result.trimmedAnswers.aucklandAffiliation).toBeNull();
    expect(result.outcome).toBe("national");
  });

  it("trims member org answer when has real funding", () => {
    const result = replayAnswers(
      makeAnswers({
        role: "researcher",
        australianAffiliation: "yes",
        funding: ["industry-grant"],
        memberOrganisation: "yes", // should be trimmed — has real funding
        acknowledgedRequirements: true,
      }),
    );
    expect(result.trimmedAnswers.memberOrganisation).toBeNull();
  });
});
