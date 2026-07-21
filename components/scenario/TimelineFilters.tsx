"use client";

import type { EventCategory } from "@/lib/types";

export function TimelineFilters({
  categories,
  selected,
  onSelect
}: {
  categories: EventCategory[];
  selected: EventCategory | "All";
  onSelect: (category: EventCategory | "All") => void;
}) {
  return (
    <div className="filter-row" role="toolbar" aria-label="Filter timeline by category">
      <button
        type="button"
        className={selected === "All" ? "active" : ""}
        onClick={() => onSelect("All")}
        aria-pressed={selected === "All"}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={selected === category ? "active" : ""}
          onClick={() => onSelect(category)}
          aria-pressed={selected === category}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
