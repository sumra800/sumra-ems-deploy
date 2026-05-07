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
  X
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#111111] border-r border-white/5">
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-black border-b border-white/5 text-white font-bold text-xl tracking-tight">
        <span className="text-primary-500 mr-2">✦</span>
        Sumra EMS
        <span className="ml-2 text-[10px] font-bold bg-primary-900/50 text-primary-400 border border-primary-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Admin
        </span>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-2 flex-1 px-3 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  isActive 
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent',
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300',
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
      
      <div className="flex-shrink-0 flex bg-black p-4 border-t border-white/5">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div>
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-900 text-primary-400 font-bold border border-primary-500/30">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate max-w-[120px]">{user?.name}</p>
              <button 
                onClick={handleLogout}
                className="text-xs font-medium text-gray-500 group-hover:text-primary-400 flex items-center mt-1 transition-colors"
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
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#111111] shadow-2xl">
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

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-black border-b border-white/5">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 focus:outline-none relative">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="py-6 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
