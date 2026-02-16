"use client";

import { useEffect, useState } from "react";

export default function DataFreshness({ refreshedAt }: { refreshedAt: string }) {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    const refreshed = new Date(refreshedAt);
    const now = new Date();
    const diffMs = now.getTime() - refreshed.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      setLabel("less than an hour ago");
    } else if (diffHours < 24) {
      setLabel(`${diffHours}h ago`);
    } else if (diffDays === 1) {
      setLabel("1 day ago");
    } else {
      setLabel(`${diffDays} days ago`);
    }
  }, [refreshedAt]);

  if (!label) return null;

  const refreshed = new Date(refreshedAt);
  const diffDays = Math.floor((Date.now() - refreshed.getTime()) / (1000 * 60 * 60 * 24));
  const isStale = diffDays > 7;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${isStale ? "text-amber-600" : "text-gray-400"}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isStale ? "bg-amber-500" : "bg-green-500"}`} />
      Data refreshed {label}
    </span>
  );
}
