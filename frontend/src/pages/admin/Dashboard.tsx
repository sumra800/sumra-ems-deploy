import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Users, Map, Flag, Activity, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalConstituencies: 0,
    totalParties: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [elections, constituencies, parties] = await Promise.all([
          api.get('/elections'),
          api.get('/constituencies'),
          api.get('/parties'),
        ]);

        const active = elections.data.filter((e: any) => e.status === 'RUNNING').length;

        setStats({
          totalElections: elections.data.length,
          activeElections: active,
          totalConstituencies: constituencies.data.length,
          totalParties: parties.data.length,
        });
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Elections', stat: stats.totalElections, icon: Flag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Active Elections', stat: stats.activeElections, icon: Activity, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { name: 'Constituencies', stat: stats.totalConstituencies, icon: Map, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { name: 'Political Parties', stat: stats.totalParties, icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Overview</h1>
        <p className="mt-2 text-sm text-gray-400">Real-time statistics of the Election Management System.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="glass-card overflow-hidden group hover:border-white/10 transition-colors">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-xl ${item.bg} ${item.color} border border-white/5`}>
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-2xl font-bold text-white">{item.stat}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white/5 px-6 py-3 border-t border-white/5 group-hover:bg-white/10 transition-colors cursor-pointer flex justify-between items-center">
              <span className="text-xs font-medium text-primary-400">View details</span>
              <ArrowUpRight className="h-4 w-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions Panel */}
      <div className="glass-card overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center">
          <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse mr-3"></div>
          <h3 className="text-lg leading-6 font-semibold text-white">System Status</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-400">All backend services are running. The system is ready to host elections securely.</p>
        </div>
      </div>
    </div>
  );
}
