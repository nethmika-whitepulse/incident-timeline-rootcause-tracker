import { useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import SeverityBadge from "../components/badges/SeverityBadge";
import StatusBadge from "../components/badges/StatusBadge";
import api from "../api/axios";
import { useApi } from "../hooks/useApi";
import {
  formatDateTime,
  formatDuration,
  formatRelativeTime,
  getErrorMessage,
} from "../utils/helpers";

const STATUSES = ["Open", "Investigating", "Resolved", "Closed"];
const TABS = ["Timeline", "Evidence", "RCA", "Action Items"];

// Converts a tab label to a valid HTML id segment (spaces → hyphens)
const tabId = (tab) => tab.toLowerCase().replace(/\s+/g, "-");

// ── Timeline tab ──────────────────────────────────────────────────────────────
function TimelineSection({ incidentId }) {
  const fetch = useCallback(
    (signal) => api.get(`/timeline/${incidentId}`, { signal }),
    [incidentId],
  );
  const { data: events, loading, error } = useApi(fetch, [incidentId]);

  if (loading) return <SectionSpinner />;
  if (error) return <SectionError message={error} />;
  if (!events?.length)
    return <SectionEmpty message="No timeline events yet." />;

  return (
    <ol
      aria-label="Timeline events"
      className="relative border-l border-gray-100 ml-3 space-y-6"
    >
      {events.map((evt) => (
        <li key={evt._id} className="ml-6">
          <span
            className="absolute -left-2 flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 ring-4 ring-white"
            aria-hidden="true"
          />
          <p className="text-xs text-gray-400 mb-0.5">
            {formatDateTime(evt.timestamp)}
            <span className="mx-1.5">·</span>
            {evt.author}
          </p>
          <p className="text-sm text-gray-800">{evt.description}</p>
        </li>
      ))}
    </ol>
  );
}

// ── Evidence tab ──────────────────────────────────────────────────────────────
function EvidenceSection({ incidentId }) {
  const fetch = useCallback(
    (signal) => api.get(`/evidence/${incidentId}`, { signal }),
    [incidentId],
  );
  const { data: items, loading, error } = useApi(fetch, [incidentId]);

  if (loading) return <SectionSpinner />;
  if (error) return <SectionError message={error} />;
  if (!items?.length)
    return <SectionEmpty message="No evidence attached yet." />;

  return (
    <ul className="space-y-3" aria-label="Evidence items">
      {items.map((ev) => (
        <li
          key={ev._id}
          className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
        >
          <div
            className="shrink-0 w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3
                   3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81
                   7.81a1.5 1.5 0 002.112 2.13"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 capitalize">
              {ev.type}
            </p>
            {ev.filename && (
              <p className="text-xs text-gray-400 truncate">{ev.filename}</p>
            )}
            {ev.notes && (
              <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                {ev.notes}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {ev.uploadedBy} · {formatRelativeTime(ev.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── RCA tab ───────────────────────────────────────────────────────────────────
function RcaSection({ incidentId }) {
  const fetch = useCallback(
    (signal) => api.get(`/rca/${incidentId}`, { signal }),
    [incidentId],
  );
  const { data: rca, loading, error, statusCode } = useApi(fetch, [incidentId]);

  if (loading) return <SectionSpinner />;
  if (error) {
    if (statusCode === 404)
      return <SectionEmpty message="No RCA document yet." />;
    return <SectionError message={error} />;
  }
  if (!rca) return <SectionEmpty message="No RCA document yet." />;

  return (
    <dl className="space-y-5">
      <RcaField label="Root Cause" value={rca.rootCause} />
      <RcaField label="Resolution" value={rca.resolution} />
      <RcaField label="Lessons Learned" value={rca.lessonsLearned} />
      {rca.contributingFactors?.length > 0 && (
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Contributing Factors
          </dt>
          <ul className="space-y-1">
            {rca.contributingFactors.map((f, i) => (
              <li key={i} className="text-sm text-gray-800 flex gap-2">
                <span className="text-gray-300 shrink-0" aria-hidden="true">
                  —
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </dl>
  );
}

function RcaField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </dt>
      <dd className="text-sm text-gray-800 whitespace-pre-line">{value}</dd>
    </div>
  );
}

// ── Action Items tab ──────────────────────────────────────────────────────────
function ActionItemsSection({ incidentId }) {
  const fetch = useCallback(
    (signal) => api.get(`/action-items/${incidentId}`, { signal }),
    [incidentId],
  );
  const { data: items, loading, error } = useApi(fetch, [incidentId]);

  if (loading) return <SectionSpinner />;
  if (error) return <SectionError message={error} />;
  if (!items?.length) return <SectionEmpty message="No action items yet." />;

  const statusColors = {
    Open: "bg-red-50 text-red-600",
    "In Progress": "bg-amber-50 text-amber-700",
    Done: "bg-green-50 text-green-700",
  };

  return (
    <ul className="space-y-2" aria-label="Action items">
      {items.map((item) => (
        <li
          key={item._id}
          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[item.status] ?? "bg-gray-100 text-gray-500"}`}
          >
            {item.status}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {item.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {item.owner} · Due {formatDateTime(item.dueDate)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Shared section primitives ─────────────────────────────────────────────────
function SectionSpinner() {
  return (
    <div
      className="flex justify-center py-10"
      role="status"
      aria-label="Loading"
    >
      <div
        className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"
        aria-hidden="true"
      />
    </div>
  );
}
function SectionError({ message }) {
  return (
    <p role="alert" className="text-sm text-red-500 py-4">
      {message}
    </p>
  );
}
function SectionEmpty({ message }) {
  return (
    <p className="text-sm text-gray-400 py-8 text-center" role="status">
      {message}
    </p>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Timeline");
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  const fetchIncident = useCallback(
    (signal) => api.get(`/incidents/${id}`, { signal }),
    [id],
  );
  const { data: incident, loading, error } = useApi(fetchIncident, [id]);

  // Sync the status dropdown with the loaded incident
  const currentStatus = newStatus || incident?.status || "";

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === incident?.status) return;
    setStatusLoading(true);
    setStatusError("");
    try {
      await api.patch(`/incidents/${id}`, { status: newStatus });
      // Reload the page to reflect the new status
      navigate(0);
    } catch (err) {
      setStatusError(getErrorMessage(err));
    } finally {
      setStatusLoading(false);
    }
  };

  // Duration only available when both times are set
  const duration =
    incident?.startTime && incident?.endTime
      ? formatDuration(
          (new Date(incident.endTime) - new Date(incident.startTime)) / 60000,
        )
      : null;

  return (
    <AppLayout
      title={loading ? "Incident" : (incident?.title ?? "Incident")}
      subtitle={
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors text-sm"
          aria-label="Back to incidents list"
        >
          ← Back to incidents
        </Link>
      }
    >
      {loading && (
        <div
          className="flex justify-center py-24"
          role="status"
          aria-label="Loading incident"
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

      {!loading && !error && incident && (
        <div className="space-y-4">
          {/* Header card */}
          <div className="card space-y-4">
            <div className="flex flex-wrap items-start gap-3 justify-between">
              <div className="flex items-center gap-2.5 flex-wrap">
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
              </div>
              <span className="text-xs text-gray-400">
                {formatRelativeTime(incident.createdAt)}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {incident.title}
              </h2>
              {incident.description && (
                <p className="text-sm text-gray-500 mt-1.5">
                  {incident.description}
                </p>
              )}
            </div>

            {/* Metadata row */}
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {incident.createdBy?.name && (
                <div className="flex gap-1.5">
                  <dt className="text-gray-400">Created by</dt>
                  <dd className="font-medium text-gray-700">
                    {incident.createdBy.name}
                  </dd>
                </div>
              )}
              {incident.startTime && (
                <div className="flex gap-1.5">
                  <dt className="text-gray-400">Started</dt>
                  <dd className="font-medium text-gray-700">
                    {formatDateTime(incident.startTime)}
                  </dd>
                </div>
              )}
              {incident.endTime && (
                <div className="flex gap-1.5">
                  <dt className="text-gray-400">Resolved</dt>
                  <dd className="font-medium text-gray-700">
                    {formatDateTime(incident.endTime)}
                  </dd>
                </div>
              )}
              {duration && (
                <div className="flex gap-1.5">
                  <dt className="text-gray-400">Duration</dt>
                  <dd className="font-medium text-gray-700">{duration}</dd>
                </div>
              )}
            </dl>

            {/* Status update */}
            <div className="pt-2 border-t border-gray-50">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Update status
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={currentStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  aria-label="Select new status"
                  className="input !w-auto text-sm py-1.5"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={
                    statusLoading || !newStatus || newStatus === incident.status
                  }
                  className="btn-secondary text-sm py-1.5"
                >
                  {statusLoading ? "Saving…" : "Save"}
                </button>
                {statusError && (
                  <p role="alert" className="text-xs text-red-500">
                    {statusError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card !p-0 overflow-hidden">
            {/* Tab bar */}
            <div
              role="tablist"
              aria-label="Incident sections"
              className="flex border-b border-gray-100"
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`panel-${tabId(tab)}`}
                  id={`tab-${tabId(tab)}`}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
                               border-b-2 -mb-px
                               ${
                                 activeTab === tab
                                   ? "border-gray-900 text-gray-900"
                                   : "border-transparent text-gray-400 hover:text-gray-600"
                               }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab panels — only the active panel mounts, so only it fetches */}
            <div className="p-6">
              {activeTab === "Timeline" && (
                <section
                  id="panel-timeline"
                  role="tabpanel"
                  aria-labelledby="tab-timeline"
                >
                  <TimelineSection incidentId={id} />
                </section>
              )}
              {activeTab === "Evidence" && (
                <section
                  id="panel-evidence"
                  role="tabpanel"
                  aria-labelledby="tab-evidence"
                >
                  <EvidenceSection incidentId={id} />
                </section>
              )}
              {activeTab === "RCA" && (
                <section
                  id="panel-rca"
                  role="tabpanel"
                  aria-labelledby="tab-rca"
                >
                  <RcaSection incidentId={id} />
                </section>
              )}
              {activeTab === "Action Items" && (
                <section
                  id="panel-action-items"
                  role="tabpanel"
                  aria-labelledby="tab-action-items"
                >
                  <ActionItemsSection incidentId={id} />
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
