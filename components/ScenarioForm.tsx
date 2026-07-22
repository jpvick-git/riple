"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createScenarioId } from "@/lib/openai-client";
import { createPendingShell, saveScenarioLocal } from "@/lib/scenarioStorage";
import type { GenerationDepth } from "@/lib/types";

const examples = [
  "What if the Titanic never sank?",
  "What if the TV show Law & Order never aired?",
  "What if the internet was never invented?",
  "What if cats controlled the banking system?"
];

const depthOptions: Array<{
  value: GenerationDepth;
  label: string;
  description: string;
}> = [
  {
    value: "quick",
    label: "Quick",
    description: "Fastest. 5–6 events; details load when you open a card."
  },
  {
    value: "standard",
    label: "Standard",
    description: "Default. 6–8 events with background deep analysis."
  },
  {
    value: "deep",
    label: "Deep",
    description: "Slower. 8–10 events plus richer conclusions."
  }
];

export function ScenarioForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [depth, setDepth] = useState<GenerationDepth>("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);

  async function startRiple(cleanQuestion: string) {
    if (submittingRef.current || isGenerating) return;
    submittingRef.current = true;
    setIsGenerating(true);
    setError("");

    try {
      try {
        const lookupResponse = await fetch("/api/scenarios/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: cleanQuestion, depth })
        });
        if (lookupResponse.ok) {
          const lookup = (await lookupResponse.json()) as {
            id: string;
            complete: boolean;
          };
          if (lookup.id) {
            router.push(`/scenario/${lookup.id}`);
            return;
          }
        }
      } catch (lookupError) {
        console.error("Scenario lookup failed:", lookupError);
      }

      const id = createScenarioId(cleanQuestion, depth);
      const shell = createPendingShell(id, cleanQuestion, depth);
      saveScenarioLocal(shell);
      router.push(`/scenario/${id}`);
    } catch (startError) {
      submittingRef.current = false;
      setIsGenerating(false);
      setError(
        startError instanceof Error ? startError.message : "Could not start this riple."
      );
    }
  }

  function submitScenario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    void startRiple(cleanQuestion);
  }

  return (
    <div className="scenario-builder">
      <form onSubmit={submitScenario}>
        <label htmlFor="scenario">What single change should start the riple?</label>
        <div className="prompt-row">
          <input
            id="scenario"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What if..."
            disabled={isGenerating}
          />
          <button type="submit" disabled={isGenerating || !question.trim()}>
            {isGenerating ? "Opening riple..." : "Create Riple"}
          </button>
        </div>

        <fieldset className="depth-control" disabled={isGenerating}>
          <legend>Generation depth</legend>
          <div className="depth-options">
            {depthOptions.map((option) => (
              <label key={option.value} className={depth === option.value ? "active" : ""}>
                <input
                  type="radio"
                  name="depth"
                  value={option.value}
                  checked={depth === option.value}
                  onChange={() => setDepth(option.value)}
                />
                <span className="depth-label">{option.label}</span>
                <span className="depth-copy">{option.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <div className="form-error" role="alert">
            <p>{error}</p>
          </div>
        )}
      </form>

      <div className="examples">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            disabled={isGenerating}
            onClick={() => setQuestion(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
