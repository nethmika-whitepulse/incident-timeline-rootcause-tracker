import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./Sidebar";

// ── Mobile bottom navigation ──────────────────────────────────────────────────
// Shown only on screens smaller than md (below 768px) — the desktop sidebar
// is hidden at this breakpoint and this provides the alternative navigation.
// Uses the same NAV_ITEMS array as the sidebar so they never drift out of sync.
export default function MobileNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden
                 bg-white border-t border-gray-100 shadow-[0_-1px_6px_rgba(0,0,0,0.06)]"
    >
      {NAV_ITEMS.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          aria-label={label}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center py-2.5 gap-1
             text-xs font-medium transition-colors
             ${isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {icon}
          </svg>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
