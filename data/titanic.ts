import type { Scenario } from "@/lib/types";

export const titanicScenario: Scenario = {
  id: "titanic-never-sank",
  title: "The Unsinkable Titanic",
  depth: "standard",
  prompt: "What if the Titanic never sank?",
  summary:
    "Titanic completes its maiden voyage and becomes a commercial triumph. White Star Line gains prestige, maritime safety reforms arrive more slowly, and the ship later becomes entangled in wartime transport and postwar luxury travel.",
  pointOfDivergence: {
    title: "Titanic avoids the iceberg",
    date: "1912-04-14",
    description:
      "A lookout spots the iceberg early enough for the bridge crew to change course without a collision.",
    whyThisDate: "The night of 14 April 1912 is the documented moment of the near-collision.",
    immediateChange:
      "The ship continues to New York without the mass-casualty disaster that reshaped maritime regulation and public memory."
  },
  historicalContext: {
    overview:
      "In 1912, ocean liners were symbols of national prestige and industrial power. Safety regulations were inconsistent, radio procedures were still evolving, and public confidence in large passenger ships was extremely high.",
    keyConditions: [
      "Olympic-class liners competed on luxury and size",
      "Wireless staffing rules were incomplete",
      "Public faith in industrial engineering was high"
    ],
    importantActors: ["White Star Line", "Board of Trade", "North Atlantic shipping rivals"],
    structuralForces: [
      "Transatlantic migration and tourism demand",
      "National prestige competition",
      "Incremental rather than catastrophe-driven regulation"
    ]
  },
  coreAssumptions: [
    "Titanic completes its maiden voyage safely.",
    "No equally famous passenger-ship disaster occurs immediately afterward.",
    "White Star Line keeps Titanic in service through the 1910s."
  ],
  plausibility: {
    score: 68,
    label: "Moderate",
    explanation:
      "Avoiding the iceberg is physically plausible, but the cascade of later reforms and cultural memory becomes increasingly contingent."
  },
  timeline: [
    {
      id: "event-1",
      date: "1912",
      era: "Immediate aftermath",
      category: "Business",
      title: "Titanic arrives in New York",
      summary: "The ship completes its maiden voyage and becomes an international engineering icon.",
      details: {
        directConsequence:
          "Press coverage focuses on luxury and scale rather than disaster, strengthening public belief that the new generation of ocean liners is exceptionally safe.",
        institutionalResponse:
          "White Star Line capitalizes on publicity while regulators face weaker political pressure for sudden reform.",
        secondOrderEffects: [
          "Bookings rise across the Olympic-class fleet",
          "Lifeboat and wireless debates continue without a defining scandal",
          "Competitors intensify luxury marketing rather than safety differentiation"
        ],
        winners: ["White Star Line", "Atlantic luxury travel promoters"],
        losers: ["Reform advocates lacking a catalytic disaster"],
        whatRemainsUnchanged: ["Broader industrial shipping capacity and migration flows"],
        uncertainties: ["Whether a later accident still forces reform"],
        historicalLogic:
          "Without a focusing tragedy, maritime safety remains an elite technical debate rather than a public imperative."
      },
      confidence: {
        score: 88,
        label: "High",
        reason: "Close to the divergence and tightly constrained by commercial incentives."
      },
      detailState: "ready",
      toneNote: null,
      sourceRefs: []
    },
    {
      id: "event-2",
      date: "1913",
      era: "Immediate aftermath",
      category: "Politics",
      title: "Safety reforms arrive more slowly",
      summary:
        "International maritime regulation advances through incremental incidents rather than one defining catastrophe.",
      details: {
        directConsequence:
          "Governments still debate wireless staffing, lifeboat capacity, and ice patrols, but urgency is lower.",
        institutionalResponse:
          "Industry lobbying keeps standards closer to pre-1912 practice for longer.",
        secondOrderEffects: [
          "Ice patrol funding grows more gradually",
          "Ship design continues to emphasize capacity and prestige",
          "Public risk perception remains optimistic"
        ],
        winners: ["Major Atlantic shipping lines"],
        losers: ["Passengers on under-equipped vessels"],
        whatRemainsUnchanged: ["Existing board-of-trade inspection frameworks"],
        uncertainties: ["Timing of the next major maritime accident"],
        historicalLogic:
          "Regulation often tracks visible failure; without it, path dependency favors the status quo."
      },
      confidence: {
        score: 74,
        label: "High",
        reason: "Consistent with how maritime law historically responded to disasters."
      },
      detailState: "ready",
      toneNote: null,
      sourceRefs: []
    },
    {
      id: "event-3",
      date: "1914",
      era: "Medium-term adaptation",
      category: "Society",
      title: "Public confidence in liners holds",
      summary: "Popular culture treats Titanic as proof of industrial mastery rather than hubris.",
      details: {
        directConsequence:
          "Books, posters, and press features celebrate the ship's survival and scale.",
        institutionalResponse:
          "Tourism boards and shipping lines reinforce a narrative of safe modern travel.",
        secondOrderEffects: [
          "Less immediate folklore of tragedy",
          "Different emotional associations with the name Titanic",
          "Slower growth of a safety-first consumer discourse"
        ],
        winners: ["Luxury travel marketers"],
        losers: ["Critics of industrial overconfidence"],
        whatRemainsUnchanged: ["Class divisions aboard liners"],
        uncertainties: ["Whether another disaster rewrites the narrative"],
        historicalLogic:
          "Cultural memory follows available symbols; survival produces a different symbol set."
      },
      confidence: {
        score: 66,
        label: "Moderate",
        reason: "Cultural reception is plausible but harder to pin down than commercial incentives."
      },
      detailState: "ready",
      toneNote: null,
      sourceRefs: []
    },
    {
      id: "event-4",
      date: "1915",
      era: "Medium-term adaptation",
      category: "War and diplomacy",
      title: "Titanic is requisitioned for wartime service",
      summary:
        "The British government converts Titanic into a troop transport and hospital ship during World War I.",
      details: {
        directConsequence:
          "Titanic's size and speed make it valuable for moving troops and medical personnel.",
        institutionalResponse:
          "Military escort protocols and wartime conversion strip luxury interiors for utility.",
        secondOrderEffects: [
          "Propaganda value attaches to the ship's service",
          "Exposure to mines and submarines rises",
          "White Star's civilian schedule contracts"
        ],
        winners: ["Wartime logistics planners"],
        losers: ["Civilian luxury travelers"],
        whatRemainsUnchanged: ["Broader Allied need for large transports"],
        uncertainties: ["Whether the ship survives submarine warfare"],
        historicalLogic:
          "Large liners were routinely commandeered; survival into 1914 makes requisition likely."
      },
      confidence: {
        score: 62,
        label: "Moderate",
        reason: "Pattern matches Olympic-class wartime use, but combat survival is contingent."
      },
      detailState: "ready",
      toneNote: null,
      sourceRefs: []
    },
    {
      id: "event-5",
      date: "1919",
      era: "Medium-term adaptation",
      category: "Economics",
      title: "White Star retains a prestige flagship",
      summary: "Postwar competition favors firms that still own recognizable luxury assets.",
      details: {
        directConsequence:
          "White Star returns Titanic to commercial planning with wartime prestige attached.",
        institutionalResponse:
          "Investors support a major refit rather than writing the asset off as obsolete.",
        secondOrderEffects: [
          "Stronger brand continuity into the 1920s",
          "Pressure on Cunard to answer with comparable symbols",
          "Delayed merger dynamics between major British lines"
        ],
        winners: ["White Star Line shareholders"],
        losers: ["Rivals needing a prestige counterweight"],
        whatRemainsUnchanged: ["Overall postwar travel demand recovery"],
        uncertainties: ["Capital availability for a full modernization"],
        historicalLogic:
          "A surviving flagship preserves brand equity that disaster erased in actual history."
      },
      confidence: {
        score: 54,
        label: "Moderate",
        reason: "Corporate strategy and capital markets introduce more contingency."
      },
      detailState: "ready",
      toneNote: null,
      sourceRefs: []
    },
    {
      id: "event-6",
      date: "1922",
      era: "Long-term drift",
      category: "Business",
      title: "Titanic returns as a modernized luxury liner",
      summary:
        "After the war, Titanic is refitted and marketed as a symbol of survival and renewal.",
      details: {
        directConsequence:
          "Cabins, electrical systems, and public spaces are upgraded for postwar travelers.",
        institutionalResponse:
          "White Star markets wartime service as part of a prestige campaign.",
        secondOrderEffects: [
          "Wealthy travelers and veterans become key audiences",
          "Competitiveness improves through the mid-1920s",
          "A different set of maritime myths circulates in popular culture"
        ],
        winners: ["White Star Line", "Refit shipyards"],
        losers: ["Firms that bet on safety branding alone"],
        whatRemainsUnchanged: ["Rising competition from newer, faster liners"],
        uncertainties: ["Depression-era viability of large luxury fleets"],
        historicalLogic:
          "Assets that survive war often become narrative capital as much as transport capital."
      },
      confidence: {
        score: 48,
        label: "Moderate",
        reason: "Farther from the divergence; market timing could easily diverge."
      },
      toneNote:
        "The printers and publicists adapt quickly; they have rarely required philosophical certainty before selling something.",
      detailState: "ready",
      sourceRefs: []
    },
    {
      id: "event-7",
      date: "1934",
      era: "Long-term drift",
      category: "Economics",
      title: "Merger politics shift under a living legend",
      summary:
        "Depression-era consolidation still pressures British shipping, but brand leverage differs with Titanic intact.",
      details: {
        directConsequence:
          "Negotiations around British liner consolidation include a still-famous Olympic-class asset.",
        institutionalResponse:
          "Government and bankers weigh prestige value against operating losses.",
        secondOrderEffects: [
          "Slightly different merger terms or timing",
          "Altered scrap-or-retain decisions for older liners",
          "A more complicated nostalgia market for ocean travel"
        ],
        winners: ["Negotiators able to monetize brand history"],
        losers: ["Weaker lines without comparable symbols"],
        whatRemainsUnchanged: ["Structural overcapacity in Atlantic passenger shipping"],
        uncertainties: ["Exact corporate structure of any merger"],
        historicalLogic:
          "Depression economics still dominate, but symbolic assets can change bargaining power."
      },
      confidence: {
        score: 38,
        label: "Low",
        reason: "Corporate restructuring decades later is highly path-dependent."
      },
      detailState: "ready",
      toneNote: null,
      sourceRefs: []
    },
    {
      id: "event-8",
      date: "1950s",
      era: "Long-term drift",
      category: "Culture",
      title: "A different twentieth-century myth",
      summary:
        "Without the disaster film and memorial culture, Titanic occupies a quieter place in popular memory.",
      details: {
        directConsequence:
          "The ship is remembered as a wartime transport and luxury survivor rather than a synonym for hubris.",
        institutionalResponse:
          "Museums and media still cover ocean liners, but the emotional center of gravity shifts.",
        secondOrderEffects: [
          "Fewer disaster-tourism industries around the wreck",
          "Different educational metaphors for technological overconfidence",
          "Maritime safety history taught through other accidents"
        ],
        winners: ["Narratives of industrial optimism"],
        losers: ["Cultural industries built on the disaster myth"],
        whatRemainsUnchanged: ["Eventual jet-age decline of transatlantic liners"],
        uncertainties: ["Which alternate disaster or film fills the cultural gap"],
        historicalLogic:
          "Late consequences are cultural and speculative; systems adapt, myths rearrange."
      },
      confidence: {
        score: 28,
        label: "Low",
        reason: "Cultural memory generations later admits many competing outcomes."
      },
      toneNote: "History remains inconveniently resistant to clean storylines.",
      detailState: "ready",
      sourceRefs: []
    }
  ],
  alternateOutcomes: [
    {
      title: "A later disaster becomes the catalyst",
      probability: "Most likely",
      description:
        "Another liner accident in the 1910s or 1920s eventually forces the reforms Titanic historically triggered."
    },
    {
      title: "Titanic is lost in wartime",
      probability: "Plausible",
      description:
        "Submarine or mine attack removes the ship during World War I, creating a different martyr narrative."
    },
    {
      title: "Persistent safety lag",
      probability: "Less likely",
      description:
        "Without a focusing tragedy for decades, Atlantic passenger standards remain uneven longer than in actual history."
    }
  ],
  finalState: {
    politics: "Maritime regulation advances more unevenly and later than in actual history.",
    culture: "Titanic symbolizes survival and industrial confidence rather than tragic hubris.",
    economics: "White Star retains stronger brand equity into the interwar years.",
    technology: "Ship design still modernizes, but safety features diffuse more slowly at first.",
    dailyLife: "Transatlantic travel feels less haunted by a single defining disaster.",
    globalEffects: "International ice patrol and wireless norms still emerge, but through other pressure points."
  },
  sources: [],
  generation: {
    foundation: "complete",
    eventDetails: {},
    conclusion: "complete",
    sources: "complete"
  }
};
