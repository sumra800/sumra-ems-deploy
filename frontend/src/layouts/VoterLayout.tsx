import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Vote,
  LogOut,
  Menu,
  X,
  Landmark,
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function VoterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/voter/dashboard', icon: LayoutDashboard },
    { name: 'My Votes', href: '/voter/my-votes', icon: Vote },
  ];

  return (
    <div className="min-h-screen bg-[#07110b] flex flex-col relative overflow-x-hidden">
      <div className="sticky top-0 z-50 shadow-[0_1px_0_rgba(0,0,0,0.08)]">
        <header className="bg-[#052e16] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex items-center min-w-0">
                <div className="h-11 w-11 rounded-full border border-white/20 bg-primary-700 flex items-center justify-center mr-3 shrink-0">
                  <Landmark className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col justify-center leading-tight gap-0.5 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-100 leading-none">
                    Government of Pakistan
                  </p>
                  <p className="text-[15px] font-extrabold tracking-tight text-white leading-tight">
                    Election Portal
                  </p>
                </div>

                <nav className="hidden sm:ml-10 sm:flex sm:space-x-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          isActive
                            ? 'bg-white text-primary-950'
                            : 'text-gray-200 hover:bg-white/10 hover:text-white',
                          'inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                        )}
                      >
                        <item.icon
                          className={cn('mr-2 h-4 w-4', isActive ? 'text-primary-700' : 'text-gray-300')}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="hidden sm:flex sm:items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center rounded-full bg-white/10 pl-3 pr-1 py-1 border border-white/10">
                    <span className="text-sm font-medium text-gray-100 mr-3">{user?.name}</span>
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary-900 font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-white/10 focus:outline-none"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {isMobileMenuOpen ? (
            <div className="sm:hidden bg-[#07110b] border-t border-white/10">
              <div className="pt-2 pb-3 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        isActive
                          ? 'bg-white text-primary-950'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white',
                        'flex items-center mx-3 rounded-lg px-3 py-2 text-base font-semibold transition-colors',
                      )}
                    >
                      <item.icon className={cn('mr-3 h-5 w-5', isActive ? 'text-primary-700' : 'text-gray-400')} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="pt-4 pb-3 border-t border-white/10">
                <div className="flex items-center px-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary-900 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user?.name}</div>
                    <div className="text-sm font-medium text-gray-400">Voter Account</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 block w-full text-left px-4 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : null}
        </header>

        <div className="border-b border-primary-900/15 bg-white">
          <div className="min-h-20 md:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-3 md:py-0">
            <div className="flex flex-col justify-center min-h-0 min-w-0 gap-1 w-full">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-primary-700 leading-none">
                Citizen Voting Services
              </p>
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-950 tracking-tight leading-snug break-words">
                Official Voter Area
              </h1>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 focus:outline-none min-h-0 w-full min-w-0">
        <div className="py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
