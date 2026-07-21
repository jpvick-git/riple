import { BrandLogo } from "@/components/BrandLogo";
import { ScenarioForm } from "@/components/ScenarioForm";

export default function HomePage() {
  return (
    <main>
      <nav className="nav-shell">
        <BrandLogo variant="wordmark" priority />
      </nav>

      <section className="hero">
        <BrandLogo variant="hero" href={null} priority />
        <h1>Change one thing.<br />Follow every riple.</h1>
        <p className="hero-copy">
          Ask a serious, personal, or absurd “what if?” and explore the timeline of consequences that spreads from that single change.
        </p>
        <ScenarioForm />
      </section>
    </main>
  );
}
