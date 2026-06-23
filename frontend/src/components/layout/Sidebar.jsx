import { NavLink } from 'react-router-dom';

// ── Nav items — single source of truth used by both Sidebar and MobileNav ────
export const NAV_ITEMS = [
  {
    to: '/', label: 'Dashboard', end: true,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25
           2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25
           2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25
           2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25
           2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5
           15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25
           2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    ),
  },
  {
    to: '/incidents', label: 'Incidents',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73
           0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
           0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    ),
  },
];

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
         ${isActive
           ? 'bg-white text-gray-900'
           : 'text-gray-400 hover:text-white hover:bg-white/10'}`
      }
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"
        viewBox="0 0 24 24" aria-hidden="true">
        {icon}
      </svg>
      <span className="sr-only">{label}</span>
    </NavLink>
  );
}

// ── Desktop sidebar — hidden on mobile, icon-only dark panel on md+ ──────────
export default function Sidebar() {
  return (
    <aside
      aria-label="Main navigation"
      className="hidden md:flex flex-col items-center w-16 py-5 bg-gray-900
                 shrink-0 sticky top-0 h-screen"
    >
      {/* Logo mark */}
      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-8"
        aria-hidden="true">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
          strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948
               3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949
               3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12
               15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>

      <nav aria-label="Main navigation" className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => <SidebarIcon key={item.to} {...item} />)}
      </nav>
    </aside>
  );
}
