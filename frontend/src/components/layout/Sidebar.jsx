import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../constants/navItems";

// ── Desktop sidebar icon button ───────────────────────────────────────────────
function SidebarIcon({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        `relative flex items-center justify-center w-10 h-10 rounded-xl
         transition-colors duration-150
         ${
           isActive
             ? "bg-white text-gray-900"
             : "text-gray-400 hover:text-white hover:bg-white/10"
         }`
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
      <span className="sr-only">{label}</span>
    </NavLink>
  );
}

// ── Desktop sidebar ───────────────────────────────────────────────────────────
// Hidden on mobile — MobileNav handles navigation at small breakpoints.
// aria-label on <aside> is "Site sidebar" and on <nav> is "Main navigation"
// so screen readers list two distinctly named landmarks (WCAG 2.4.6).
export default function Sidebar() {
  return (
    <aside
      aria-label="Site sidebar"
      className="hidden md:flex flex-col items-center w-16 py-5 bg-gray-900
                 shrink-0 sticky top-0 h-screen"
    >
      <div
        className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-8"
        aria-hidden="true"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948
               3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949
               3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12
               15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <nav aria-label="Main navigation" className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <SidebarIcon key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  );
}
