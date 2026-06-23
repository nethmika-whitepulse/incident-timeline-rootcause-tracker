import { useState, useEffect } from "react";
import { getErrorMessage } from "../utils/helpers";

// ── Standardized API hook ─────────────────────────────────────────────────────
// Encapsulates the loading / error / cancel pattern that every data-fetching
// component needs. Uses AbortController to actually cancel the in-flight
// network request when the component unmounts — unlike a `cancelled` flag
// which only ignores the response after it arrives.

export function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    apiFn(controller.signal)
      .then(({ data: responseData }) => setData(responseData))
      .catch((err) => {
        // AbortController cancellations are not real errors — ignore them
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        const msg = getErrorMessage(err);
        setError(msg);
        // Centralised error logging — swap console.error for a real logging
        // service (Sentry, Datadog, etc.) in production without touching call sites
        console.error("[useApi]", err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
