import { useEffect, useMemo, useState } from "react";

export function useTrajets(filters = {}, options = { enabled: false }) {
  const { enabled = false } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const qs = useMemo(() => new URLSearchParams(filters).toString(), [filters]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/trajets?${qs}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("useTrajets error:", e);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [enabled, qs]);

  return { data, loading };
}
