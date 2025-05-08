import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import '@/styles/zalama-theme.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="flex min-h-screen bg-[var(--zalama-bg-dark)]" >
        <Sidebar />
        <div className="flex-1 flex flex-col transition-all duration-300" style={{ marginLeft: 'var(--current-sidebar-width, var(--sidebar-width))' }}>
          <DashboardHeader />
          <main className="flex-1 px-4 py-4 mb-8 overflow-y-auto" style={{scrollbarWidth: "none"}} suppressHydrationWarning={true}>
            {children}
          </main>
        </div>
      </div>
  );
}
