import { useState, useEffect } from "react";
import { getErrorMessage } from "../utils/helpers";

/**
 * Standardized API hook
 * Handles loading, error, and request cancellation.
 *
 * CONTRACT:
 * - apiFn must be stable across renders.
 * - If apiFn uses props/state values, it MUST be wrapped in useCallback.
 *
 * Example:
 * useApi((signal) => api.get(`/users/${id}`, { signal }), [id]);
 */
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
        // Ignore cancellations
        if (err.name === "CanceledError" || err.name === "AbortError") return;

        const msg = getErrorMessage(err);
        setError(msg);
        console.error("[useApi]", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();

    // apiFn is intentionally included to avoid stale closures
  }, [...deps, apiFn]);

  return { data, loading, error };
}
