import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import SeverityBadge from "../components/badges/SeverityBadge";
import StatusBadge from "../components/badges/StatusBadge";
import api from "../api/axios";
import { useApi } from "../hooks/useApi";
import { formatRelativeTime } from "../utils/helpers";

const SEVERITIES = ["", "P1", "P2", "P3", "P4"];
const STATUSES = ["", "Open", "Investigating", "Resolved", "Closed"];

export default function IncidentList() {
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");

  // Re-fetches whenever status or severity changes
  const fetchIncidents = useCallback(
    (signal) => {
      const params = {};
      if (status) params.status = status;
      if (severity) params.severity = severity;
      return api.get("/incidents", { signal, params });
    },
    [status, severity],
  );

  const {
    data: incidents,
    loading,
    error,
  } = useApi(fetchIncidents, [status, severity]);

  return (
    <AppLayout title="Incidents" subtitle="All production incidents">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className="input !w-auto text-sm py-2"
          >
            <option value="">All statuses</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            aria-label="Filter by severity"
            className="input !w-auto text-sm py-2"
          >
            <option value="">All severities</option>
            {SEVERITIES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {(status || severity) && (
            <button
              onClick={() => {
                setStatus("");
                setSeverity("");
              }}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        <Link to="/incidents/new" className="btn-primary">
          + New Incident
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="flex justify-center py-20"
          role="status"
          aria-label="Loading incidents"
        >
          <div
            className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl"
        >
          {error}
        </div>
      )}

      {/* Incident list */}
      {!loading && !error && incidents && (
        <>
          {incidents.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-gray-400 text-sm">
                {status || severity
                  ? "No incidents match the current filters."
                  : "No incidents yet. Create one to get started."}
              </p>
            </div>
          ) : (
            <div className="card !p-0 overflow-hidden">
              <ul aria-label="Incident list">
                {incidents.map((inc, idx) => (
                  <li key={inc._id}>
                    <Link
                      to={`/incidents/${inc._id}`}
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${idx !== 0 ? "border-t border-gray-50" : ""}`}
                    >
                      {/* Severity indicator */}
                      <div className="shrink-0">
                        <SeverityBadge severity={inc.severity} />
                      </div>

                      {/* Title + description */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {inc.title}
                        </p>
                        {inc.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {inc.description}
                          </p>
                        )}
                      </div>

                      {/* Status + time */}
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={inc.status} />
                        <span className="text-xs text-gray-400 hidden sm:inline">
                          {formatRelativeTime(inc.createdAt)}
                        </span>
                      </div>

                      {/* Chevron */}
                      <svg
                        className="w-4 h-4 text-gray-300 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3 text-right">
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
            {status || severity ? " matching filters" : " total"}
          </p>
        </>
      )}
    </AppLayout>
  );
}
