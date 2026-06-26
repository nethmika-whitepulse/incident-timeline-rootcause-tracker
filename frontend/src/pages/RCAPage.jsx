import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import api from "../api/axios";
import { useApi } from "../hooks/useApi";
import { getErrorMessage } from "../utils/helpers";

export default function RCAPage() {
  const { id } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const inFlight = useRef(false);
  // Tracks whether we've already populated the form from fetched data,
  // so a re-fetch after save doesn't wipe unsaved edits mid-session.
  const hasPopulated = useRef(false);

  const fetchRca = useCallback(
    (signal) => api.get(`/rca/${id}`, { signal }),
    [id, refreshKey],
  );
  const { data: rca, loading, error, statusCode } = useApi(fetchRca, [id, refreshKey]);

  const isEdit = !error && !!rca;

  const [form, setForm] = useState({ rootCause: "", resolution: "", lessonsLearned: "" });
  const [factors, setFactors] = useState([]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Populate form from fetched RCA data only on first load and after a save.
  // hasPopulated prevents a background re-fetch from wiping unsaved edits.
  useEffect(() => {
    if (rca && !hasPopulated.current) {
      setForm({
        rootCause: rca.rootCause ?? "",
        resolution: rca.resolution ?? "",
        lessonsLearned: rca.lessonsLearned ?? "",
      });
      setFactors(rca.contributingFactors ?? []);
      hasPopulated.current = true;
    }
  }, [rca]);

  // Auto-clear the success banner after 3 seconds
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addFactor = () => setFactors((prev) => [...prev, ""]);
  const updateFactor = (i, val) =>
    setFactors((prev) => prev.map((f, idx) => (idx === i ? val : f)));
  const removeFactor = (i) =>
    setFactors((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    if (!form.rootCause.trim()) { setFormError("Root cause is required."); return; }
    if (form.rootCause.trim().length < 10) { setFormError("Root cause must be at least 10 characters."); return; }
    if (!form.resolution.trim()) { setFormError("Resolution is required."); return; }
    if (form.resolution.trim().length < 10) { setFormError("Resolution must be at least 10 characters."); return; }
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    try {
      const payload = { ...form, contributingFactors: factors.filter((f) => f.trim()) };
      if (isEdit) { await api.patch(`/rca/${id}`, payload); }
      else { await api.post(`/rca`, { ...payload, incidentId: id }); }
      setSuccessMsg(isEdit ? "RCA updated successfully." : "RCA created successfully.");
      // Allow re-population from the refreshed data after save
      hasPopulated.current = false;
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };

  return (
    <AppLayout
      title="Root Cause Analysis"
      subtitle={
        <Link to={`/incidents/${id}`} className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors text-sm" aria-label="Back to incident">
          ← Back to incident
        </Link>
      }
    >
      {loading && (
        <div className="flex justify-center py-24" role="status" aria-label="Loading">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" aria-hidden="true" />
        </div>
      )}

      {!loading && error && statusCode !== 404 && (
        <div role="alert" className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {!loading && (!error || statusCode === 404) && (
        <div className="max-w-xl">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-800 mb-5">{isEdit ? "Edit RCA" : "Create RCA"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {formError && (
                <div role="alert" className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{formError}</div>
              )}
              {successMsg && (
                <div role="status" className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl">{successMsg}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rootCause">
                  Root Cause <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <textarea id="rootCause" name="rootCause" value={form.rootCause} onChange={handleChange} rows={4} maxLength={2000} className="input resize-none" placeholder="What was the underlying cause?" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="resolution">
                  Resolution <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <textarea id="resolution" name="resolution" value={form.resolution} onChange={handleChange} rows={4} maxLength={2000} className="input resize-none" placeholder="How was the incident resolved?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="lessonsLearned">
                  Lessons Learned <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea id="lessonsLearned" name="lessonsLearned" value={form.lessonsLearned} onChange={handleChange} rows={4} maxLength={2000} className="input resize-none" placeholder="What can be improved to prevent recurrence?" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    Contributing Factors <span className="text-gray-400 font-normal">(optional)</span>
                  </span>
                  <button type="button" onClick={addFactor} className="text-xs text-gray-500 hover:text-gray-700 transition-colors">+ Add factor</button>
                </div>
                {factors.length === 0 && <p className="text-xs text-gray-400">No factors added yet.</p>}
                <div className="space-y-2">
                  {factors.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={f} onChange={(e) => updateFactor(i, e.target.value)} className="input text-sm flex-1" placeholder={`Factor ${i + 1}`} maxLength={300} />
                      <button type="button" onClick={() => removeFactor(i)} className="text-gray-300 hover:text-red-400 transition-colors px-1" aria-label={`Remove factor ${i + 1}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Link to={`/incidents/${id}`} className="btn-secondary">Cancel</Link>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />}
                  {saving ? "Saving…" : isEdit ? "Save changes" : "Create RCA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
