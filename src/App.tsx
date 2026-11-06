import React, { useState } from 'react';
import { AppStateProvider, useAppState } from './store/AppStateContext.tsx';
import { NoticeStrip } from './components/layout/NoticeStrip.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Topbar } from './components/layout/Topbar.tsx';
import { RoomDrawer } from './components/rooms/RoomDrawer.tsx';
import { SearchModal } from './components/common/SearchModal.tsx';
import { AlertPopupModal } from './components/common/AlertPopupModal.tsx';

// Pages
import { PublicLanding } from './pages/PublicLanding.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { CampusOverview } from './pages/CampusOverview.tsx';
import { BuildingsPage } from './pages/BuildingsPage.tsx';
import { RoomsPage } from './pages/RoomsPage.tsx';
import { RoomBookings } from './pages/RoomBookings.tsx';
import { EnergyMonitoring } from './pages/EnergyMonitoring.tsx';
import { EmergencyPlanner } from './pages/EmergencyPlanner.tsx';
import { DataIntegrity } from './pages/DataIntegrity.tsx';
import { AnalyticsReports } from './pages/AnalyticsReports.tsx';
import { ZhatkaIntelligence } from './pages/ZhatkaIntelligence.tsx';
import { NotificationsAlerts } from './pages/NotificationsAlerts.tsx';
import { MaintenancePage } from './pages/MaintenancePage.tsx';
import { ActivityLogs } from './pages/ActivityLogs.tsx';
import { SettingsProfile } from './pages/SettingsProfile.tsx';

const AppContent: React.FC = () => {
  const { currentUser, activePage, toast, alertPopupOpen, setAlertPopupOpen } = useAppState();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // If user is on public landing
  if (activePage === 'landing') {
    return <PublicLanding />;
  }

  // If user is on login page
  if (activePage === 'login' || !currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] dark:bg-black flex flex-col antialiased text-[var(--text)] transition-colors">
      {/* 28px Notice Strip (DESIGN.md §4) */}
      <NoticeStrip />

      {/* Main Authenticated Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (240px) */}
        <Sidebar className="hidden md:flex" />

        {/* Mobile Slide-Over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-[260px] bg-[var(--bg-sidebar)] dark:bg-[#101012] h-full shadow-lg">
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--bg)] dark:bg-black">
          {/* Top Bar (48px) */}
          <Topbar
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenSearch={() => setSearchModalOpen(true)}
          />

          {/* Scrollable Viewport (padding 24 32, max-width 1280 centred per DESIGN.md §4) */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-[1280px] mx-auto w-full">
              {activePage === 'overview' && <CampusOverview />}
              {activePage === 'buildings' && <BuildingsPage />}
              {activePage === 'rooms' && <RoomsPage />}
              {activePage === 'bookings' && <RoomBookings />}
              {activePage === 'monitoring' && <EnergyMonitoring />}
              {activePage === 'planner' && <EmergencyPlanner />}
              {activePage === 'data-integrity' && <DataIntegrity />}
              {activePage === 'analytics' && <AnalyticsReports />}
              {activePage === 'intelligence' && <ZhatkaIntelligence />}
              {activePage === 'notifications' && <NotificationsAlerts />}
              {activePage === 'maintenance' && <MaintenancePage />}
              {activePage === 'audit' && <ActivityLogs />}
              {(activePage === 'settings' || activePage === 'profile') && <SettingsProfile />}
            </div>
          </main>
        </div>
      </div>

      {/* Global Room Details Drawer */}
      <RoomDrawer />

      {/* Global Alert Pop-up Modal */}
      <AlertPopupModal
        isOpen={alertPopupOpen}
        onClose={() => setAlertPopupOpen(false)}
      />

      {/* Global ⌘K Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Global Toast Notification (DESIGN.md §5: Bottom-right, white, 1px border) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-[8px] bg-[var(--bg)] dark:bg-[#18181B] border text-[13px] font-medium shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-150 ${
            toast.type === 'critical'
              ? 'border-[#D92D20] text-[#B42318] dark:text-red-400'
              : toast.type === 'warning'
              ? 'border-[#E0A03A] text-[#8A5A00] dark:text-amber-400'
              : toast.type === 'success'
              ? 'border-[#2F9E5B] text-[#1E6B3A] dark:text-emerald-400'
              : 'border-[var(--border)] dark:border-[#27272A] text-[var(--text)]'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
