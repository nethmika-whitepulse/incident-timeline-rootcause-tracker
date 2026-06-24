import { useCallback } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import SeverityBadge from "../components/badges/SeverityBadge";
import api from "../api/axios";
import { useApi } from "../hooks/useApi";
import { formatRelativeTime, formatDuration } from "../utils/helpers";

// ── Severity colour map — defined once, not recreated per render ──────────────
const SEVERITY_COLORS = {
  P1: "#ef4444",
  P2: "#f97316",
  P3: "#eab308",
  P4: "#3b82f6",
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sublabel, accent }) {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-3xl font-semibold text-gray-900 mt-1.5">{value}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
      </div>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}
        aria-hidden="true"
      >
        <div className="w-2 h-2 rounded-full bg-current" />
      </div>
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
// All segment offsets are pre-computed outside the JSX return so no variable
// is mutated during render — which would be a side effect and break Strict Mode.
function SeverityDonut({ data }) {
  const total = (data ?? []).reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center" role="status">
        No incidents yet
      </p>
    );
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  // Pre-compute each segment's dash length and starting offset
  const segments = data.reduce((acc, d) => {
    const prevOffset = acc.length > 0 ? acc[acc.length - 1].endOffset : 0;
    const dash = (d.count / total) * circumference;
    return [
      ...acc,
      { ...d, dash, startOffset: prevOffset, endOffset: prevOffset + dash },
    ];
  }, []);

  // Human-readable label for screen readers
  const ariaLabel = `Severity breakdown: ${segments
    .map((s) => `${s._id} — ${s.count} incident${s.count !== 1 ? "s" : ""}`)
    .join(", ")}`;

  return (
    <div className="flex items-center gap-6" role="img" aria-label={ariaLabel}>
      {/* SVG is decorative — the aria-label on the wrapper conveys the data */}
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className="-rotate-90 shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="16"
        />
        {segments.map((seg) => (
          <circle
            key={seg._id}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={SEVERITY_COLORS[seg._id] ?? "#9ca3af"}
            strokeWidth="16"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.startOffset}
            strokeLinecap="butt"
          />
        ))}
      </svg>

      <dl className="flex flex-col gap-2.5">
        {segments.map((seg) => (
          <div key={seg._id} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: SEVERITY_COLORS[seg._id] ?? "#9ca3af" }}
              aria-hidden="true"
            />
            <dt className="text-gray-500">{seg._id}</dt>
            <dd className="font-medium text-gray-900 ml-auto pl-4">
              {seg.count}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  // useCallback gives apiFn a stable reference — required because useApi now
  // includes apiFn in its deps. Without this, a new arrow function would be
  // created on every render, triggering an infinite fetch loop.
  const fetchDashboard = useCallback(
    (signal) => api.get("/dashboard", { signal }),
    [], // no captured values — stable for the component's lifetime
  );

  const { data: summary, loading, error } = useApi(fetchDashboard, []);

  return (
    <AppLayout title="Dashboard" subtitle="Incident management overview">
      {loading && (
        <div
          className="flex items-center justify-center py-24"
          role="status"
          aria-label="Loading dashboard"
        >
          <div
            className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"
            aria-hidden="true"
          />
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl"
        >
          {error}
        </div>
      )}

      {!loading && !error && summary && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="Open Incidents"
              value={summary.openCount ?? 0}
              accent="bg-red-50 text-red-500"
            />
            <StatCard
              label="Mean Resolution Time"
              value={formatDuration(summary.meanResolutionMinutes ?? null)}
              accent="bg-blue-50 text-blue-500"
            />
            <StatCard
              label="Recently Closed"
              value={(summary.recentlyClosed ?? []).length}
              sublabel="latest 5 incidents"
              accent="bg-green-50 text-green-500"
            />
          </div>

          {/* Severity donut + Recent incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card lg:col-span-1">
              <h2 className="text-sm font-medium text-gray-700 mb-4">
                By Severity
              </h2>
              <SeverityDonut data={summary.bySeverity ?? []} />
            </div>

            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-700">
                  Recently Closed
                </h2>
                <Link
                  to="/incidents"
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="View all incidents"
                >
                  View all →
                </Link>
              </div>

              {(summary.recentlyClosed ?? []).length === 0 ? (
                <p
                  className="text-sm text-gray-400 py-8 text-center"
                  role="status"
                >
                  No closed incidents yet
                </p>
              ) : (
                <ul aria-label="Recently closed incidents">
                  {(summary.recentlyClosed ?? []).map((inc) => (
                    <li key={inc._id}>
                      <Link
                        to={`/incidents/${inc._id}`}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {inc.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatRelativeTime(inc.updatedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <SeverityBadge severity={inc.severity} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
