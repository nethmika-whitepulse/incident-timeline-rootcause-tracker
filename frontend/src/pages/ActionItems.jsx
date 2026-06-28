import { useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Modal from "../components/ui/Modal";
import api from "../api/axios";
import { useApi } from "../hooks/useApi";
import { getErrorMessage, formatDateTime, ACTION_ITEM_STATUS_CLASSES } from "../utils/helpers";

const ACTION_ITEM_STATUSES = ["Open", "In Progress", "Done"];

function ActionItemForm({ incidentId, item, onSuccess, onCancel }) {
  const inFlight = useRef(false);
  const [form, setForm] = useState({
    title: item?.title ?? "",
    owner: item?.owner ?? "",
    dueDate: item?.dueDate ? new Date(item.dueDate).toISOString().slice(0, 16) : "",
    status: item?.status ?? "Open",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (form.title.trim().length < 3) { setError("Title must be at least 3 characters."); return; }
    if (!form.owner.trim()) { setError("Owner is required."); return; }
    if (!form.dueDate) { setError("Due date is required."); return; }
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const payload = { title: form.title.trim(), status: form.status, owner: form.owner.trim(), dueDate: form.dueDate };
      if (item) { await api.patch(`/action-items/${item._id}`, payload); }
      else { await api.post(`/action-items`, { ...payload, incidentId }); }
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
      {error && <div role="alert" className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ai-title">
          Title <span className="text-red-400" aria-hidden="true">*</span>
        </label>
        <input id="ai-title" type="text" name="title" value={form.title} onChange={handleChange} className="input" placeholder="e.g. Add connection pool monitoring" required minLength={3} maxLength={200} autoFocus />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ai-owner">
          Owner <span className="text-red-400" aria-hidden="true">*</span>
        </label>
        <input id="ai-owner" type="text" name="owner" value={form.owner} onChange={handleChange} className="input" placeholder="e.g. Jane Smith" maxLength={100} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ai-dueDate">
          Due Date <span className="text-red-400" aria-hidden="true">*</span>
        </label>
        <input id="ai-dueDate" type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} className="input text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ai-status">Status</label>
        <select id="ai-status" name="status" value={form.status} onChange={handleChange} className="input !w-auto text-sm">
          {ACTION_ITEM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />}
          {loading ? "Saving…" : item ? "Save changes" : "Add action item"}
        </button>
      </div>
    </form>
  );
}

export default function ActionItems() {
  const { id } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState(null);

  const fetchItems = useCallback(
    (signal) => api.get(`/action-items/${id}`, { signal }),
    [id, refreshKey],
  );
  const { data: items, loading, error } = useApi(fetchItems, [id, refreshKey]);

  const handleSuccess = () => { setModal(null); setRefreshKey((k) => k + 1); };

  return (
    <AppLayout
      title="Action Items"
      subtitle={
        <Link to={`/incidents/${id}`} className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors text-sm" aria-label="Back to incident">
          ← Back to incident
        </Link>
      }
    >
      <div className="max-w-2xl">
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs text-gray-400">{items?.length ?? 0} {items?.length === 1 ? "item" : "items"}</p>
            <button onClick={() => setModal({ mode: "create" })} className="btn-secondary text-xs py-1.5">+ Add action item</button>
          </div>

          {loading && (
            <div className="flex justify-center py-10" role="status" aria-label="Loading">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" aria-hidden="true" />
            </div>
          )}
          {!loading && error && <p role="alert" className="text-sm text-red-500 py-4">{error}</p>}
          {!loading && !error && !items?.length && (
            <p className="text-sm text-gray-400 py-8 text-center" role="status">No action items yet.</p>
          )}
          {!loading && !error && items?.length > 0 && (
            <ul className="space-y-2" aria-label="Action items">
              {items.map((item) => (
                <li key={item._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${ACTION_ITEM_STATUS_CLASSES[item.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {item.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.owner} · Due {formatDateTime(item.dueDate)}</p>
                  </div>
                  <button
                    onClick={() => setModal({ mode: "edit", item })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 shrink-0"
                    aria-label={`Edit ${item.title}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {modal && (
        <Modal
          title={modal.mode === "create" ? "Add Action Item" : "Edit Action Item"}
          onClose={() => setModal(null)}
        >
          <ActionItemForm
            incidentId={id}
            item={modal.mode === "edit" ? modal.item : null}
            onSuccess={handleSuccess}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </AppLayout>
  );
}
