import { useEffect, useState } from "react";
import { fetchBundle } from "./api";
import type { ContentBundle } from "../../shared/types";

export function useContent(force = false): { bundle: ContentBundle | null; error: string | null; loading: boolean } {
  const [bundle, setBundle] = useState<ContentBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchBundle(force)
      .then((b) => {
        if (alive) {
          setBundle(b);
          setError(null);
        }
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Content could not be loaded.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [force]);

  return { bundle, error, loading };
}
