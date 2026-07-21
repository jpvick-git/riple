import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export function ScenarioError({
  message,
  prompt,
  onRetry
}: {
  message: string;
  prompt?: string;
  onRetry?: () => void;
}) {
  return (
    <main className="state-page">
      <div className="state-card">
        <BrandLogo variant="mark" href={null} className="brand-logo-state" />
        <h1>Something went wrong</h1>
        <p>{message}</p>
        {prompt ? (
          <p className="preserved-prompt">
            Your prompt: <em>{prompt}</em>
          </p>
        ) : null}
        <div className="error-actions">
          {onRetry ? (
            <button type="button" className="primary-button" onClick={onRetry}>
              <RotateCcw size={16} /> Retry
            </button>
          ) : null}
          <Link href="/" className="primary-link">
            <ArrowLeft size={18} /> Create a new riple
          </Link>
        </div>
      </div>
    </main>
  );
}
