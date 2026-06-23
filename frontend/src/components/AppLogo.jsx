// Shared app logo used on Login and Register pages.
// Extracted to avoid duplicating the SVG markup in two files — any branding
// change (icon, name, size) now only needs to happen here.
export default function AppLogo() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="w-11 h-11 rounded-2xl bg-gray-900 flex items-center justify-center mb-4 shadow-sm">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
          strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948
               3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949
               3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12
               15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
        Incident Tracker
      </h1>
    </div>
  );
}
