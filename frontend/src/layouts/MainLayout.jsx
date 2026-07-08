import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const topNavLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/fleet', label: 'Fleet' },
  { to: '/shipments', label: 'Shipments' },
  { to: '/tracking', label: 'Tracking' },
  { to: '/analytics', label: 'Analytics' },
];

const sideNavItems = [
  { to: '/tracking', label: 'Map View', icon: 'map' },
  { to: '/', label: 'Fleet Health', icon: 'monitor_heart' },
  { to: '/drivers', label: 'Driver Performance', icon: 'person_pin' },
  { to: '/fleet', label: 'Maintenance', icon: 'settings_suggest' },
  { to: '/analytics', label: 'Reports', icon: 'assessment' },
];

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-body-md text-on-surface">

      {/* ── Floating Top Navigation Bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 w-full rounded-full mt-4 mx-auto max-w-[95%] glass-nav bg-white/70 shadow-nav transition-all">
        <div className="flex items-center gap-8">
          <span className="font-display-xl text-headline-md font-bold text-primary" style={{ fontFamily: 'Geist, sans-serif' }}>
            FleetFlow
          </span>
          <div className="hidden md:flex items-center gap-6">
            {topNavLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `font-label-caps text-label-caps py-1 transition-all ${
                    isActive
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative group">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 rounded-full hover:bg-surface-container-low transition-all">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          </div>

          {/* User avatar / logout */}
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm cursor-pointer">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="absolute right-0 top-12 bg-white rounded-xl shadow-modal border border-outline-variant p-2 w-44 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
              <p className="px-3 py-1 text-xs text-on-surface-variant font-mono truncate">{user?.email}</p>
              <hr className="my-1 border-outline-variant" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error-container rounded-lg transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign out
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 rounded-full hover:bg-surface-container-low" onClick={() => setMobileOpen(true)}>
            <span className="material-symbols-outlined text-on-surface-variant">menu</span>
          </button>
        </div>
      </nav>

      {/* ── Side Navigation (Desktop) ── */}
      <aside className={`fixed left-0 top-0 h-full z-40 w-72 bg-surface-container-low shadow-md flex flex-col p-6 pt-28 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="mb-8">
          <h2 className="font-headline-md text-headline-md text-primary mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>
            Operations
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {user?.name || 'Fleet Manager'} · {user?.role}
          </p>
        </div>

        <div className="flex flex-col gap-2 flex-grow">
          {sideNavItems.map(({ to, label, icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `nav-item flex items-center gap-4 p-3 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-body-md text-body-md">{label}</span>
            </NavLink>
          ))}
        </div>

        <button
          onClick={() => { setMobileOpen(false); navigate('/shipments'); }}
          className="mt-4 bg-primary text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          New Shipment
        </button>

        <div className="mt-8 pt-6 border-t border-outline-variant flex flex-col gap-2">
          <button className="flex items-center gap-4 p-2 text-on-surface-variant hover:text-on-surface transition-all">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-sm text-body-sm">Settings</span>
          </button>
          <button className="flex items-center gap-4 p-2 text-on-surface-variant hover:text-on-surface transition-all">
            <span className="material-symbols-outlined">help</span>
            <span className="font-body-sm text-body-sm">Help</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main Content ── */}
      <main className="lg:ml-72 pt-32 px-8 pb-12 min-h-screen">
        {children}
      </main>

      {/* ── Bottom Navigation (Mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-surface-variant flex md:hidden items-center justify-around z-50">
        {[
          { to: '/', icon: 'dashboard', label: 'Home' },
          { to: '/tracking', icon: 'map', label: 'Map' },
          { to: '/fleet', icon: 'local_shipping', label: 'Fleet' },
          { to: '/analytics', icon: 'bar_chart', label: 'Analytics' },
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center ${isActive ? 'text-primary' : 'text-on-surface-variant'}`
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MainLayout;
