import { Sparkles } from "lucide-react";
import { ScenarioForm } from "@/components/ScenarioForm";

export default function HomePage() {
  return (
    <main>
      <nav className="nav-shell">
        <div className="brand">Riple</div>
      </nav>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={16} /> Explore cause and effect</div>
        <h1>Change one thing.<br />Follow every riple.</h1>
        <p className="hero-copy">
          Ask a serious, personal, or absurd “what if?” and explore the timeline of consequences that spreads from that single change.
        </p>
        <ScenarioForm />
      </section>
    </main>
  );
}
