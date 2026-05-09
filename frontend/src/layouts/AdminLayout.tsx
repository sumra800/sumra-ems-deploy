import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Map,
  Flag,
  UserSquare2,
  LogOut,
  Menu,
  X,
  Landmark,
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Elections', href: '/admin/elections', icon: Flag },
    { name: 'Constituencies', href: '/admin/constituencies', icon: Map },
    { name: 'Parties', href: '/admin/parties', icon: Users },
    { name: 'Candidates', href: '/admin/candidates', icon: UserSquare2 },
  ];

  const SidebarContent = () => (
    <div className="flex-1 flex flex-col min-h-0 bg-[#07110b] border-r border-white/10">
      <div className="flex items-center h-20 flex-shrink-0 px-4 bg-[#052e16] border-b border-white/10 text-white">
        <div className="h-11 w-11 rounded-full border border-white/20 bg-primary-700 flex items-center justify-center mr-3 shrink-0">
          <Landmark className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex flex-col justify-center leading-tight gap-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-100/95 leading-none">Government of Pakistan</p>
          <p className="text-[15px] font-extrabold tracking-tight leading-tight">Election Portal</p>
          <p className="text-[9px] font-bold text-white/65 uppercase tracking-[0.12em] leading-none">Administration Console</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-2 flex-1 px-3 space-y-1.5">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  isActive
                    ? 'bg-white text-primary-950 border border-white shadow-sm'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white border border-transparent',
                  'group flex items-center px-3 py-3 text-sm font-semibold rounded-lg transition-all duration-200'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-200',
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 flex bg-black/25 p-4 border-t border-white/10">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white text-primary-900 font-bold border border-white/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate max-w-[130px]">{user?.name}</p>
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-gray-400 group-hover:text-white flex items-center mt-1 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#07110b] flex w-full max-w-[100vw] overflow-x-hidden">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col w-[min(100%,20rem)] max-w-xs bg-[#07110b] shadow-2xl max-h-[100dvh] overflow-y-auto overscroll-contain">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent />
      </div>

      <div className="md:pl-72 flex flex-col flex-1 min-h-screen">
        {/* Sticky region: stays in view while page scrolls — mobile menu bar + white page title */}
        <div className="sticky top-0 z-30 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
          <div className="md:hidden bg-[#052e16] border-b border-white/10 px-4 flex items-center h-20 shrink-0">
            <button
              type="button"
              className="h-11 w-11 inline-flex items-center justify-center rounded-md text-gray-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div className="border-b border-primary-900/15 bg-white">
            <div className="min-h-20 md:h-20 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 flex items-center py-3 md:py-0">
              <div className="flex flex-col justify-center min-h-0 min-w-0 gap-1 w-full">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-primary-700 leading-none">
                  Govt EMS
                </p>
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-950 tracking-tight leading-snug break-words">
                  Official Administration Area
                </h1>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 focus:outline-none relative min-h-0 w-full min-w-0">
          <div className="py-4 sm:py-6 relative z-10">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
