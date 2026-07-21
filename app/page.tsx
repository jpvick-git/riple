import { GitBranch, Network, Sparkles, Waves } from "lucide-react";
import { ScenarioForm } from "@/components/ScenarioForm";

export default function HomePage() {
  return (
    <main>
      <nav className="nav-shell">
        <div className="brand"><Waves size={22} /> Ripple</div>
        <a href="#how-it-works">How it works</a>
      </nav>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={16} /> Explore cause and effect</div>
        <h1>Change one thing.<br />Follow every ripple.</h1>
        <p className="hero-copy">
          Ask a serious, personal, or absurd “what if?” and explore the timeline of consequences that spreads from that single change.
        </p>
        <ScenarioForm />
      </section>

      <section className="feature-grid" id="how-it-works">
        <article><Waves /><h2>Start the ripple</h2><p>Change one event, decision, invention, company, or ordinary moment.</p></article>
        <article><Network /><h2>Trace the consequences</h2><p>See immediate effects grow into larger changes across people, industries, places, and time.</p></article>
        <article><GitBranch /><h2>Branch anywhere</h2><p>Choose any consequence and create a new path with its own expanding chain of events.</p></article>
      </section>
    </main>
  );
}
