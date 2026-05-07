import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Vote, 
  LogOut,
  Menu,
  X
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-x-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none" />

      {/* Top Navbar */}
      <nav className="bg-[#111111]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-primary-500 mr-2">✦</span>
                <span className="font-extrabold text-xl tracking-tight text-white">Sumra EMS</span>
                <span className="ml-2 text-[10px] font-bold bg-white/10 text-gray-300 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Voter
                </span>
              </div>
              <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        isActive
                          ? 'border-primary-500 text-primary-400'
                          : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-white',
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
                      )}
                    >
                      <item.icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary-500" : "text-gray-500")} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Desktop User Menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative flex items-center space-x-4">
                <div className="flex items-center bg-white/5 rounded-full pl-3 pr-1 py-1 border border-white/5">
                  <span className="text-sm font-medium text-gray-300 mr-3">{user?.name}</span>
                  <div className="h-8 w-8 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 font-bold border border-primary-500/20">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 focus:outline-none transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-[#111111] border-b border-white/5">
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
                        ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                        : 'border-transparent text-gray-400 hover:bg-white/5 hover:border-gray-500 hover:text-white',
                      'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors flex items-center'
                    )}
                  >
                    <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary-500" : "text-gray-500")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-white/5">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 font-bold border border-primary-500/20">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user?.name}</div>
                  <div className="text-sm font-medium text-gray-400">Voter Account</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-white/5"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        <main className="flex-1 focus:outline-none">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
