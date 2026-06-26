import { useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import SeverityBadge from "../components/badges/SeverityBadge";
import StatusBadge from "../components/badges/StatusBadge";
import Modal from "../components/ui/Modal";
import api from "../api/axios";
import { useApi } from "../hooks/useApi";
import {
  formatDateTime,
  formatDuration,
  formatRelativeTime,
  getErrorMessage,
  ACTION_ITEM_STATUS_CLASSES,
} from "../utils/helpers";

const STATUSES = ["Open", "Investigating", "Resolved", "Closed"];
const TABS = ["Timeline", "Evidence", "RCA", "Action Items"];

const tabId = (tab) => tab.toLowerCase().replace(/\s+/g, "-");

// ── Timeline tab ──────────────────────────────────────────────────────────────
function TimelineForm({ incidentId, event, onSuccess, onCancel }) {
  const inFlight = useRef(false);
  const [form, setForm] = useState({
    timestamp: event?.timestamp ? new Date(event.timestamp).toISOString().slice(0, 16) : "",
    author: event?.author ?? "",
    description: event?.description ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.author.trim()) { setError("Author is required."); return; }
    if (!form.timestamp) { setError("Timestamp is required."); return; }
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const payload = { description: form.description, author: form.author, timestamp: form.timestamp };
      if (event) { await api.patch(`/timeline/${event._id}`, payload); }
      else { await api.post(`/timeline`, { ...payload, incidentId }); }
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div role="alert" className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="tl-timestamp">
          Timestamp <span className="text-red-400" aria-hidden="true">*</span>
        </label>
        <input id="tl-timestamp" type="datetime-local" name="timestamp" value={form.timestamp} onChange={handleChange} className="input text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="tl-author">
          Author <span className="text-red-400" aria-hidden="true">*</span>
        </label>
        <input id="tl-author" type="text" name="author" value={form.author} onChange={handleChange} className="input" placeholder="e.g. Jane Smith" maxLength={100} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="tl-description">
          Description <span className="text-red-400" aria-hidden="true">*</span>
        </label>
        <textarea id="tl-description" name="description" value={form.description} onChange={handleChange} rows={3} maxLength={1000} className="input resize-none" placeholder="What happened at this point?" autoFocus />
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />}
          {loading ? "Saving…" : event ? "Save changes" : "Add event"}
        </button>
      </div>
    </form>
  );
}

function TimelineSection({ incidentId }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState(null);

  const fetchTimeline = useCallback(
    (signal) => api.get(`/timeline/${incidentId}`, { signal }),
    [incidentId, refreshKey],
  );
  const { data: events, loading, error } = useApi(fetchTimeline, [incidentId, refreshKey]);
  const handleSuccess = () => { setModal(null); setRefreshKey((k) => k + 1); };

  if (loading) return <SectionSpinner />;
  if (error) return <SectionError message={error} />;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs text-gray-400">{events?.length ?? 0} {events?.length === 1 ? "event" : "events"}</span>
        <button onClick={() => setModal({ mode: "create" })} className="btn-secondary text-xs py-1.5">+ Add event</button>
      </div>
      {!events?.length && <SectionEmpty message="No timeline events yet." />}
      {events?.length > 0 && (
        <ol aria-label="Timeline events" className="relative border-l border-gray-100 ml-3 space-y-6">
          {events.map((evt) => (
            <li key={evt._id} className="ml-6 group">
              <span className="absolute -left-2 flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 ring-4 ring-white" aria-hidden="true" />
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-gray-400 mb-0.5">
                  {formatDateTime(evt.timestamp)}<span className="mx-1.5">·</span>{evt.author}
                </p>
                <button
                  onClick={() => setModal({ mode: "edit", event: evt })}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 shrink-0"
                  aria-label={`Edit event: ${evt.description}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-800">{evt.description}</p>
            </li>
          ))}
        </ol>
      )}
      {modal && (
        <Modal
          title={modal.mode === "create" ? "Add Timeline Event" : "Edit Timeline Event"}
          onClose={() => setModal(null)}
        >
          <TimelineForm
            incidentId={incidentId}
            event={modal.mode === "edit" ? modal.event : null}
            onSuccess={handleSuccess}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </>
  );
}

// ── Evidence tab ──────────────────────────────────────────────────────────────
function EvidenceSection({ incidentId }) {
  const fetchEvidence = useCallback(
    (signal) => api.get(`/evidence/${incidentId}`, { signal }),
    [incidentId],
  );
  const { data: items, loading, error } = useApi(fetchEvidence, [incidentId]);
  if (loading) return <SectionSpinner />;
  if (error) return <SectionError message={error} />;
  if (!items?.length) return <SectionEmpty message="No evidence attached yet." />;
  return (
    <ul className="space-y-3" aria-label="Evidence items">
      {items.map((ev) => (
        <li key={ev._id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center" aria-hidden="true">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 capitalize">{ev.type}</p>
            {ev.filename && <p className="text-xs text-gray-400 truncate">{ev.filename}</p>}
            {ev.notes && <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{ev.notes}</p>}
            <p className="text-xs text-gray-400 mt-1">{ev.uploadedBy} · {formatRelativeTime(ev.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── RCA tab — read-only, links to RCAPage ─────────────────────────────────────
function RcaField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-sm text-gray-800 whitespace-pre-line">{value}</dd>
    </div>
  );
}

function RcaSection({ incidentId }) {
  const fetchRca = useCallback(
    (signal) => api.get(`/rca/${incidentId}`, { signal }),
    [incidentId],
  );
  const { data: rca, loading, error, statusCode } = useApi(fetchRca, [incidentId]);
  if (loading) return <SectionSpinner />;
  if (error && statusCode !== 404) return <SectionError message={error} />;
  const hasRca = !error && !!rca;
  return (
    <>
      <div className="flex justify-end mb-5">
        <Link to={`/incidents/${incidentId}/rca`} className="btn-secondary text-xs py-1.5">
          {hasRca ? "Edit RCA →" : "+ Create RCA"}
        </Link>
      </div>
      {!hasRca && <SectionEmpty message="No RCA document yet." />}
      {hasRca && (
        <dl className="space-y-5">
          <RcaField label="Root Cause" value={rca.rootCause} />
          <RcaField label="Resolution" value={rca.resolution} />
          <RcaField label="Lessons Learned" value={rca.lessonsLearned} />
          {rca.contributingFactors?.length > 0 && (
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Contributing Factors</dt>
              <ul className="space-y-1">
                {rca.contributingFactors.map((f, i) => (
                  <li key={i} className="text-sm text-gray-800 flex gap-2">
                    <span className="text-gray-300 shrink-0" aria-hidden="true">—</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </dl>
      )}
    </>
  );
}

// ── Action Items tab — read-only, links to ActionItems page ───────────────────
function ActionItemsSection({ incidentId }) {
  const fetchActionItems = useCallback(
    (signal) => api.get(`/action-items/${incidentId}`, { signal }),
    [incidentId],
  );
  const { data: items, loading, error } = useApi(fetchActionItems, [incidentId]);
  if (loading) return <SectionSpinner />;
  if (error) return <SectionError message={error} />;
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs text-gray-400">{items?.length ?? 0} {items?.length === 1 ? "item" : "items"}</span>
        <Link to={`/incidents/${incidentId}/actions`} className="btn-secondary text-xs py-1.5">Manage →</Link>
      </div>
      {!items?.length && <SectionEmpty message="No action items yet." />}
      {items?.length > 0 && (
        <ul className="space-y-2" aria-label="Action items">
          {items.map((item) => (
            <li key={item._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
              <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${ACTION_ITEM_STATUS_CLASSES[item.status] ?? "bg-gray-100 text-gray-500"}`}>
                {item.status}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.owner} · Due {formatDateTime(item.dueDate)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ── Shared section primitives ─────────────────────────────────────────────────
function SectionSpinner() {
  return (
    <div className="flex justify-center py-10" role="status" aria-label="Loading">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" aria-hidden="true" />
    </div>
  );
}
function SectionError({ message }) {
  return <p role="alert" className="text-sm text-red-500 py-4">{message}</p>;
}
function SectionEmpty({ message }) {
  return <p className="text-sm text-gray-400 py-8 text-center" role="status">{message}</p>;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function IncidentDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Timeline");
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [incidentRefreshKey, setIncidentRefreshKey] = useState(0);

  const fetchIncident = useCallback(
    (signal) => api.get(`/incidents/${id}`, { signal }),
    [id, incidentRefreshKey],
  );
  const { data: incident, loading, error } = useApi(fetchIncident, [id, incidentRefreshKey]);

  const currentStatus = newStatus || incident?.status || "";

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === incident?.status) return;
    setStatusLoading(true);
    setStatusError("");
    try {
      await api.patch(`/incidents/${id}`, { status: newStatus });
      setNewStatus("");
      setIncidentRefreshKey((k) => k + 1);
    } catch (err) {
      setStatusError(getErrorMessage(err));
    } finally {
      setStatusLoading(false);
    }
  };

  const duration =
    incident?.startTime && incident?.endTime
      ? formatDuration((new Date(incident.endTime) - new Date(incident.startTime)) / 60000)
      : null;

  return (
    <AppLayout
      title={loading ? "Incident" : (incident?.title ?? "Incident")}
      subtitle={
        <Link to="/incidents" className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors text-sm" aria-label="Back to incidents list">
          ← Back to incidents
        </Link>
      }
    >
      {loading && (
        <div className="flex justify-center py-24" role="status" aria-label="Loading incident">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" aria-hidden="true" />
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
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
              <span className="text-xs text-gray-400">{formatRelativeTime(incident.createdAt)}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{incident.title}</h2>
              {incident.description && <p className="text-sm text-gray-500 mt-1.5">{incident.description}</p>}
            </div>
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {incident.createdBy?.name && (
                <div className="flex gap-1.5">
                  <dt className="text-gray-400">Created by</dt>
                  <dd className="font-medium text-gray-700">{incident.createdBy.name}</dd>
                </div>
              )}
              {incident.startTime && (
                <div className="flex gap-1.5">
                  <dt className="text-gray-400">Started</dt>
                  <dd className="font-medium text-gray-700">{formatDateTime(incident.startTime)}</dd>
                </div>
              )}
              {incident.endTime && (
                <div className="flex gap-1.5">
                  <dt className="text-gray-400">Resolved</dt>
                  <dd className="font-medium text-gray-700">{formatDateTime(incident.endTime)}</dd>
                </div>
              )}
              {duration && (
                <div className="flex gap-1.5">
                  <dt className="text-gray-400">Duration</dt>
                  <dd className="font-medium text-gray-700">{duration}</dd>
                </div>
              )}
            </dl>
            <div className="pt-2 border-t border-gray-50">
              <p className="text-xs font-medium text-gray-500 mb-2">Update status</p>
              <div className="flex items-center gap-2 flex-wrap">
                <select value={currentStatus} onChange={(e) => setNewStatus(e.target.value)} aria-label="Select new status" className="input !w-auto text-sm py-1.5">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={handleStatusUpdate} disabled={statusLoading || !newStatus || newStatus === incident.status} className="btn-secondary text-sm py-1.5">
                  {statusLoading ? "Saving…" : "Save"}
                </button>
                {statusError && <p role="alert" className="text-xs text-red-500">{statusError}</p>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card !p-0 overflow-hidden">
            <div role="tablist" aria-label="Incident sections" className="flex border-b border-gray-100">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`panel-${tabId(tab)}`}
                  id={`tab-${tabId(tab)}`}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === "Timeline" && (
                <section id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline">
                  <TimelineSection incidentId={id} />
                </section>
              )}
              {activeTab === "Evidence" && (
                <section id="panel-evidence" role="tabpanel" aria-labelledby="tab-evidence">
                  <EvidenceSection incidentId={id} />
                </section>
              )}
              {activeTab === "RCA" && (
                <section id="panel-rca" role="tabpanel" aria-labelledby="tab-rca">
                  <RcaSection incidentId={id} />
                </section>
              )}
              {activeTab === "Action Items" && (
                <section id="panel-action-items" role="tabpanel" aria-labelledby="tab-action-items">
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
