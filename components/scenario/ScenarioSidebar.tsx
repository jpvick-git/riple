import { CoreAssumptionsCard } from "@/components/scenario/CoreAssumptionsCard";
import { HistoricalContextCard } from "@/components/scenario/HistoricalContextCard";
import { PlausibilityCard } from "@/components/scenario/PlausibilityCard";
import { PointOfDivergenceCard } from "@/components/scenario/PointOfDivergenceCard";
import type { Scenario } from "@/lib/types";

export function ScenarioSidebar({ scenario }: { scenario: Scenario }) {
  return (
    <aside className="scenario-sidebar">
      <PointOfDivergenceCard point={scenario.pointOfDivergence} />
      <HistoricalContextCard context={scenario.historicalContext} />
      <CoreAssumptionsCard assumptions={scenario.coreAssumptions} />
      <PlausibilityCard plausibility={scenario.plausibility} />
    </aside>
  );
}
