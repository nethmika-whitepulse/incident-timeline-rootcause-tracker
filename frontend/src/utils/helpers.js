// ── Date formatting ───────────────────────────────────────────────────────────
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  const diff = Date.now() - new Date(dateString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return formatDate(dateString);
};

export const formatDuration = (minutes) => {
  if (minutes == null) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// ── Badge class helpers ───────────────────────────────────────────────────────
export const severityClass = (severity) => ({
  P1: 'badge badge-p1',
  P2: 'badge badge-p2',
  P3: 'badge badge-p3',
  P4: 'badge badge-p4',
}[severity] ?? 'badge badge-p4');

export const statusClass = (status) => ({
  Open:          'badge badge-open',
  Investigating: 'badge badge-investigating',
  Resolved:      'badge badge-resolved',
  Closed:        'badge badge-closed',
}[status] ?? 'badge badge-closed');

// ── Error message extractor ───────────────────────────────────────────────────
// Axios errors can carry the message in different shapes depending on whether
// the server returned a validation error array or a single message string.
export const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (Array.isArray(data.message)) return data.message[0];
  if (typeof data.message === 'string') return data.message;
  return 'Something went wrong. Please try again.';
};
