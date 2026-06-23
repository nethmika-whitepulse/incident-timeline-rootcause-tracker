import { useState, useRef, useEffect } from 'react';
import { useAuth }                     from '../../context/AuthContext';

// Generates a deterministic avatar color from the user's name
function avatarColor(name) {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
  ];
  const hash = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Navbar({ title, subtitle }) {
  const { user, logout }  = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef           = useRef(null);
  const triggerRef        = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape key — standard dropdown accessibility pattern
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        triggerRef.current?.focus(); // return focus to the trigger button
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <header className="flex items-center justify-between mb-8 gap-4">

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          ref={triggerRef}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={`Account menu for ${user?.name ?? 'user'}`}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors"
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${avatarColor(user?.name)}`} aria-hidden="true">
            {initials(user?.name)}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {user?.name ?? 'Account'}
          </span>
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor"
            strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Account options"
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20"
          >
            <div className="px-3.5 py-2 border-b border-gray-50" role="presentation">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              role="menuitem"
              onClick={handleLogout}
              className="w-full text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

    </header>
  );
}
