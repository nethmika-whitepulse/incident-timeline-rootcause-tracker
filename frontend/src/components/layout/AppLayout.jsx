import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Navbar from "./Navbar";

// Shared shell for every authenticated page.
// Desktop: sidebar on the left, content on the right.
// Mobile:  full-width content, fixed bottom navigation bar.
// pb-20 on mobile accounts for the height of the bottom nav bar so content
// is never hidden underneath it.
export default function AppLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full pb-24 md:pb-8">
        <Navbar title={title} subtitle={subtitle} />
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
