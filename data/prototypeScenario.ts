import type { Scenario } from "@/lib/types";

function cleanSubject(question: string) {
  return question
    .replace(/^what if\s+/i, "")
    .replace(/[?]+$/, "")
    .trim();
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function createPrototypeScenario(question: string, id: string): Scenario {
  const subject = cleanSubject(question) || "one event changed";
  const title = titleCase(subject);
  const currentYear = new Date().getFullYear();

  return {
    id,
    title: `The Riple Where ${title}`,
    prompt: question,
    depth: "standard",
    summary: `A single change—${subject}—creates immediate reactions, secondary consequences, and longer-term shifts. These events are generic prototype content until AI generation is connected.`,
    pointOfDivergence: {
      title,
      date: "Starting point",
      description:
        "This is a prototype timeline generated from your prompt. The production version will use an AI endpoint to research context and create scenario-specific consequences.",
      whyThisDate: "Used as a placeholder divergence until a researched date is available.",
      immediateChange: `The condition ${subject} takes hold and forces nearby actors to respond.`
    },
    historicalContext: {
      overview:
        "The current MVP carries your prompt into the explorer and demonstrates the intended cause-and-effect experience without calling an AI service.",
      keyConditions: ["Existing institutions continue operating", "Incentives remain recognizable"],
      importantActors: ["Directly affected people", "Related organizations"],
      structuralForces: ["Market or cultural demand", "Path dependency from prior history"]
    },
    coreAssumptions: [
      "The requested change occurs successfully.",
      "People and organizations react according to their incentives.",
      "Later consequences become less certain over time."
    ],
    plausibility: {
      score: 55,
      label: "Moderate",
      explanation: "Prototype content is illustrative rather than historically grounded."
    },
    timeline: Array.from({ length: 8 }, (_, index) => {
      const year = currentYear + index;
      return {
        id: `event-${index + 1}`,
        date: String(year),
        era: index < 2 ? "Immediate aftermath" : index < 5 ? "Medium-term adaptation" : "Long-term drift",
        category: (["Society", "Business", "Technology", "Politics", "Culture", "Economics", "Daily life", "War and diplomacy"] as const)[index],
        title:
          index === 0
            ? "The original change occurs"
            : index === 1
              ? "The first major consequences appear"
              : `Structural riple ${index + 1}`,
        summary:
          index === 0
            ? `The timeline diverges when ${subject}.`
            : "Institutions, markets, and habits adjust as earlier consequences compound.",
        details: {
          directConsequence:
            "A concrete local condition changes and forces an immediate response from nearby actors.",
          institutionalResponse:
            "Organizations reallocate attention, resources, or rules to manage the new condition.",
          secondOrderEffects: [
            "Competitors and substitutes gain room to move.",
            "Public expectations begin to recalibrate.",
            "Secondary markets or cultural niches fill emerging gaps."
          ],
          winners: ["Actors positioned to adapt quickly"],
          losers: ["Actors dependent on the prior arrangement"],
          whatRemainsUnchanged: ["Broader demographic and geographic constraints"],
          uncertainties: ["How quickly later adaptations lock in"],
          historicalLogic:
            "Systems rarely vanish when one node is removed; they redistribute pressure and opportunity."
        },
        confidence: {
          score: Math.max(30, 90 - index * 8),
          label: index < 2 ? "High" : index < 5 ? "Moderate" : "Low",
          reason: "Confidence declines as the timeline moves farther from the divergence."
        },
        detailState: "ready",
        toneNote: null,
        sourceRefs: []
      };
    }),
    alternateOutcomes: [
      {
        title: "Muted adaptation",
        probability: "Most likely",
        description: "Existing systems absorb the shock with limited long-run transformation."
      },
      {
        title: "Cascading restructuring",
        probability: "Plausible",
        description: "Secondary effects compound until a different institutional equilibrium emerges."
      }
    ],
    finalState: {
      politics: "Authority and regulation adjust around the new incentives.",
      culture: "Narratives and habits reorganize without erasing prior traditions.",
      economics: "Capital and labor reallocate toward surviving opportunities.",
      technology: "Technical development continues under altered demand signals.",
      dailyLife: "Everyday routines change at the margins before larger norms shift.",
      globalEffects: "International consequences remain contingent and uneven."
    },
    sources: [],
    generation: {
      foundation: "complete",
      eventDetails: {},
      conclusion: "complete",
      sources: "complete"
    }
  };
}
