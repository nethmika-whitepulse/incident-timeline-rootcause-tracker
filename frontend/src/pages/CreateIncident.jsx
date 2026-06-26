import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import api from "../api/axios";
import { getErrorMessage } from "../utils/helpers";

const SEVERITIES = ["P1", "P2", "P3", "P4"];

export default function CreateIncident() {
  const navigate = useNavigate();
  const inFlight = useRef(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "P2",
    startTime: "",
    endTime: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (form.title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }

    if (form.endTime && form.startTime && form.endTime <= form.startTime) {
      setError("End time must be after start time.");
      return;
    }

    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);

    try {
      // Strip empty optional fields so they aren't sent as empty strings
      const payload = { title: form.title, severity: form.severity };
      if (form.description) payload.description = form.description;
      if (form.startTime) payload.startTime = form.startTime;
      if (form.endTime) payload.endTime = form.endTime;

      const { data } = await api.post("/incidents", payload);
      navigate(`/incidents/${data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="New Incident"
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
      <div className="max-w-xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl"
              >
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="title"
              >
                Title{" "}
                <span className="text-red-400" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input"
                placeholder="e.g. Database connection pool exhausted"
                required
                minLength={3}
                maxLength={200}
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="description"
              >
                Description
                <span className="text-gray-400 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={2000}
                className="input resize-none"
                placeholder="Brief summary of what happened and the impact"
              />
            </div>

            {/* Severity */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="severity"
              >
                Severity{" "}
                <span className="text-red-400" aria-hidden="true">
                  *
                </span>
              </label>
              <div
                className="flex gap-2"
                role="group"
                aria-label="Severity level"
              >
                {SEVERITIES.map((s) => (
                  <label
                    key={s}
                    className={`flex-1 flex items-center justify-center py-2 rounded-xl
                                border text-sm font-medium cursor-pointer transition-colors
                                ${
                                  form.severity === s
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                                }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={s}
                      checked={form.severity === s}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {s}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                P1 — Critical &nbsp;·&nbsp; P2 — High &nbsp;·&nbsp; P3 — Medium
                &nbsp;·&nbsp; P4 — Low
              </p>
            </div>

            {/* Start / End time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="startTime"
                >
                  Start time
                  <span className="text-gray-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <input
                  id="startTime"
                  type="datetime-local"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="input text-sm"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="endTime"
                >
                  End time
                  <span className="text-gray-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <input
                  id="endTime"
                  type="datetime-local"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  min={form.startTime}
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link to="/incidents" className="btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading && (
                  <div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    aria-hidden="true"
                  />
                )}
                {loading ? "Creating…" : "Create incident"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
