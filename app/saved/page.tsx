"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { listSavedRiples, unsaveRiple, type SavedRiple } from "@/lib/savedRiples";

function formatSavedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Saved recently";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function SavedRiplesPage() {
  const [items, setItems] = useState<SavedRiple[] | null>(null);

  useEffect(() => {
    setItems(listSavedRiples());
  }, []);

  function remove(id: string) {
    const next = unsaveRiple(id);
    setItems(next);
    window.dispatchEvent(new Event("riple:saved-changed"));
  }

  return (
    <main>
      <nav className="nav-shell scenario-nav">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} /> New riple
        </Link>
        <BrandLogo variant="wordmark" />
        <span className="nav-actions" aria-hidden />
      </nav>

      <section className="saved-page">
        <header className="saved-header">
          <span className="eyebrow">
            <Bookmark size={14} /> Your library
          </span>
          <h1>Saved riples</h1>
          <p>
            Keep the ones you want to revisit or share later. Saved riples stay on this
            device; each one still has a permanent link you can send anytime.
          </p>
        </header>

        {items === null ? (
          <p className="muted-copy">Loading saved riples…</p>
        ) : items.length === 0 ? (
          <div className="saved-empty">
            <h2>Nothing saved yet</h2>
            <p className="muted-copy">
              Open a riple and tap Save to pin it here for later.
            </p>
            <Link href="/" className="primary-button">
              Create a riple
            </Link>
          </div>
        ) : (
          <ul className="saved-list">
            {items.map((item) => (
              <li key={item.id} className="saved-item">
                <Link href={`/scenario/${item.id}`} className="saved-item-link">
                  <span className="saved-item-meta">
                    <span className="saved-depth">{item.depth}</span>
                    <span>{formatSavedAt(item.savedAt)}</span>
                  </span>
                  <strong>{item.title}</strong>
                  <span className="saved-item-prompt">{item.prompt}</span>
                  {item.summary ? (
                    <span className="saved-item-summary">{item.summary}</span>
                  ) : null}
                </Link>
                <button
                  type="button"
                  className="saved-remove"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.title} from saved`}
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
