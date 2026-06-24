import { statusClass } from "../../utils/helpers";

// Renders a colored pill for Open/Investigating/Resolved/Closed.
export default function StatusBadge({ status }) {
  return <span className={statusClass(status)}>{status}</span>;
}
