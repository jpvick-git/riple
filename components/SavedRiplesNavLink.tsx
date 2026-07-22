"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { listSavedRiples } from "@/lib/savedRiples";

export function SavedRiplesNavLink({ className = "" }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(listSavedRiples().length);

    function sync() {
      setCount(listSavedRiples().length);
    }

    window.addEventListener("storage", sync);
    window.addEventListener("riple:saved-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("riple:saved-changed", sync);
    };
  }, []);

  return (
    <Link href="/saved" className={`saved-nav-link ${className}`.trim()}>
      <Bookmark size={16} />
      <span>Saved</span>
      {count && count > 0 ? <span className="saved-count">{count}</span> : null}
    </Link>
  );
}
