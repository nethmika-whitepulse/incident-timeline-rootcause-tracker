import { severityClass } from "../../utils/helpers";

// Renders a colored pill for P1/P2/P3/P4 — used in incident lists, dashboard
// recent-incidents, and incident detail headers. Single source of truth for
// severity color so it never drifts between pages.
export default function SeverityBadge({ severity }) {
  return <span className={severityClass(severity)}>{severity}</span>;
}
