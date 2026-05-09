import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { Users, Map, Flag, Activity, ArrowUpRight, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ElectionBrief {
  id: string;
  title: string;
  status: string;
}

interface ElectionResultsPayload {
  election: ElectionBrief;
  totalVotes: number;
  results: {
    candidate: {
      id?: string;
      user?: { name?: string };
      constituency?: { name?: string };
      party?: { name?: string };
    };
    count: number;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalConstituencies: 0,
    totalParties: 0,
  });
  const [electionResultsList, setElectionResultsList] = useState<ElectionResultsPayload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [electionsRes, constituenciesRes, partiesRes] = await Promise.all([
          api.get<ElectionBrief[]>('/elections'),
          api.get('/constituencies'),
          api.get('/parties'),
        ]);

        const elections = electionsRes.data;
        const active = elections.filter((e) => e.status === 'RUNNING').length;

        setStats({
          totalElections: elections.length,
          activeElections: active,
          totalConstituencies: constituenciesRes.data.length,
          totalParties: partiesRes.data.length,
        });

        const resultsSettled = await Promise.allSettled(
          elections.map((e) => api.get<ElectionResultsPayload>(`/elections/${e.id}/results`)),
        );
        const results: ElectionResultsPayload[] = [];
        let failedResults = 0;
        resultsSettled.forEach((entry) => {
          if (entry.status === 'fulfilled') {
            results.push(entry.value.data);
          } else {
            failedResults += 1;
          }
        });
        setElectionResultsList(results);
        if (failedResults > 0) {
          toast.error(`Could not load results for ${failedResults} election(s).`);
        }
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

  const statCards: {
    name: string;
    stat: number;
    icon: typeof Flag;
    color: string;
    bg: string;
    to: string;
  }[] = [
    { name: 'Total Elections', stat: stats.totalElections, icon: Flag, color: 'text-blue-400', bg: 'bg-blue-500/10', to: '/admin/elections' },
    { name: 'Active Elections', stat: stats.activeElections, icon: Activity, color: 'text-primary-400', bg: 'bg-primary-500/10', to: '/admin/elections' },
    { name: 'Constituencies', stat: stats.totalConstituencies, icon: Map, color: 'text-purple-400', bg: 'bg-purple-500/10', to: '/admin/constituencies' },
    { name: 'Political Parties', stat: stats.totalParties, icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10', to: '/admin/parties' },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Overview</h1>
        <p className="mt-2 text-sm text-gray-400">Real-time statistics for Govt EMS.</p>
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
            <Link
              to={item.to}
              className="bg-white/5 px-6 py-3 border-t border-white/5 group-hover:bg-white/10 transition-colors cursor-pointer flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-inset"
            >
              <span className="text-xs font-medium text-primary-400">View details</span>
              <ArrowUpRight className="h-4 w-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden />
            </Link>
          </div>
        ))}
      </div>

      {/* Election results — vote totals per candidate */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 bg-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <BarChart3 className="h-5 w-5 text-emerald-400" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Election results</h2>
            <p className="text-sm text-gray-400 mt-0.5">Total votes received by each candidate, per election.</p>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-8">
          {electionResultsList.length === 0 ? (
            <p className="text-sm text-gray-500">No elections yet — create an election on the Elections page to see tallies here.</p>
          ) : (
            electionResultsList.map((payload) => {
              const { election, totalVotes, results } = payload;
              return (
                <div key={election.id} className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white truncate">{election.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{totalVotes} total votes cast</p>
                    </div>
                    <span className="self-start sm:self-center shrink-0 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-white/10 text-gray-300 border border-white/10">
                      {election.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {results.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">No votes recorded for this election yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-gray-400">
                            <th className="px-4 py-3 font-medium w-12">#</th>
                            <th className="px-4 py-3 font-medium">Candidate</th>
                            <th className="px-4 py-3 font-medium hidden sm:table-cell">Constituency</th>
                            <th className="px-4 py-3 font-medium hidden md:table-cell">Party</th>
                            <th className="px-4 py-3 font-medium text-right w-28">Votes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {results.map((row, idx) => {
                            const name = row.candidate.user?.name ?? 'Unknown';
                            const constituency = row.candidate.constituency?.name ?? '—';
                            const partyLabel = row.candidate.party?.name ?? 'Independent';
                            const rowKey = row.candidate.id ?? `${election.id}-${idx}`;
                            return (
                              <tr key={rowKey} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                <td className="px-4 py-3 font-medium text-white">{name}</td>
                                <td className="px-4 py-3 text-gray-300 hidden sm:table-cell">{constituency}</td>
                                <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{partyLabel}</td>
                                <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-400">{row.count}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {electionResultsList.length > 0 && (
            <div className="pt-1">
              <Link to="/admin/elections" className="text-sm font-medium text-primary-400 hover:text-primary-300">
                Manage elections →
              </Link>
            </div>
          )}
        </div>
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
