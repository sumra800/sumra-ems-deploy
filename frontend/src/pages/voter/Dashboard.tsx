import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface Election {
  id: string;
  title: string;
  status: 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  startTime: string | null;
  endTime: string | null;
}

interface ElectionResult {
  election: {
    id: string;
    title: string;
    status: Election['status'];
  };
  totalVotes: number;
  results: Array<{
    candidate: {
      id: string;
      photoUrl?: string;
      user?: {
        name: string;
      };
      party?: {
        name: string;
        logoUrl?: string;
      };
      constituency?: {
        id?: string;
        name: string;
        city?: { id: string; name?: string };
      };
    };
    count: number;
  }>;
}

export default function VoterDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [resultsByElection, setResultsByElection] = useState<Record<string, ElectionResult>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  function resultsInVoterArea(
    rows: ElectionResult['results'],
  ): ElectionResult['results'] {
    if (!user) return rows;
    const voterCityId = user.city?.id;
    if (voterCityId) {
      return rows.filter(
        (row) => row.candidate.constituency?.city?.id === voterCityId,
      );
    }
    const legacyConstituencyId = user.constituency?.id;
    if (legacyConstituencyId) {
      return rows.filter((row) => row.candidate.constituency?.id === legacyConstituencyId);
    }
    return rows;
  }

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await api.get('/elections');
        const electionsData: Election[] = response.data;
        setElections(electionsData);

        const completedElections = electionsData.filter(e => e.status === 'COMPLETED');
        const completedResults = await Promise.all(
          completedElections.map(async (election) => {
            const resultResponse = await api.get(`/elections/${election.id}/results`);
            return [election.id, resultResponse.data] as const;
          })
        );
        setResultsByElection(Object.fromEntries(completedResults));
      } catch (error) {
        toast.error('Failed to load elections');
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const activeElections = elections.filter(e => e.status === 'RUNNING');
  const pastElections = elections.filter(e => e.status === 'COMPLETED');

  const getWinnerSummary = (electionId: string) => {
    const result = resultsByElection[electionId];
    if (!result || result.results.length === 0) {
      return null;
    }

    const localRows = resultsInVoterArea(result.results);
    if (localRows.length === 0) {
      return null;
    }

    const sorted = [...localRows].sort((a, b) => b.count - a.count);
    const winner = sorted[0];
    const runnerUp = sorted[1];
    const areaVoteTotal = sorted.reduce((acc, row) => acc + row.count, 0);
    return {
      result,
      winner,
      margin: winner.count - (runnerUp?.count ?? 0),
      areaVoteTotal,
      electionWideTotalVotes: result.totalVotes,
    };
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="glass-card p-5 sm:p-8 relative overflow-hidden">
        {/* Abstract Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="break-words">Welcome, {user?.name}</span>
            <Sparkles className="h-6 w-6 text-primary-400 shrink-0" aria-hidden />
          </h1>
          <p className="mt-2 text-base text-gray-400 max-w-2xl">
            This is your secure portal to participate in active elections. Your vote is immutable, confidential, and vital to the democratic process.
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h3 className="text-lg leading-6 font-semibold text-white flex items-center">
            <span className="flex h-2.5 w-2.5 relative mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
            </span>
            Active Elections
          </h3>
          <span className="bg-primary-500/10 text-primary-400 text-xs font-bold px-2.5 py-1 rounded-full border border-primary-500/20">
            {activeElections.length}
          </span>
        </div>
        
        {activeElections.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400">No active elections at the moment. Please check back later.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {activeElections.map((election) => (
              <li key={election.id}>
                <Link to={`/voter/vote/${election.id}`} className="block hover:bg-white/5 transition-colors group">
                  <div className="px-6 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <p className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">{election.title}</p>
                      <p className="mt-1.5 flex items-center text-sm text-gray-400">
                        <Calendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500" />
                        Started: {new Date(election.startTime!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 text-white shadow-lg shadow-primary-500/20 group-hover:bg-primary-500 group-hover:shadow-primary-500/40 transition-all transform group-hover:-translate-y-0.5">
                        Cast Secure Vote
                      </span>
                      <ChevronRight className="ml-3 h-5 w-5 text-gray-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pastElections.length > 0 && (
        <div className="glass-card overflow-hidden mt-8 opacity-80 hover:opacity-100 transition-opacity">
          <div className="px-6 py-5 border-b border-white/5 bg-white/5">
            <h3 className="text-lg leading-6 font-semibold text-white">
              Past Elections
            </h3>
          </div>
          <ul className="divide-y divide-white/5">
            {pastElections.map((election) => (
              <li key={election.id} className="px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-300">{election.title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Ended: {new Date(election.endTime!).toLocaleDateString()}
                    </p>
                  </div>

                  {(() => {
                    const summary = getWinnerSummary(election.id);
                    const ballot = resultsByElection[election.id];
                    if (!summary) {
                      return (
                        <p className="text-sm text-gray-500">
                          {!ballot?.results?.length
                            ? 'No votes were cast in this election.'
                            : 'No votes were cast for candidates in your constituency/city area in this election.'}
                        </p>
                      );
                    }

                    const symbolUrl = summary.winner.candidate.party?.logoUrl ?? summary.winner.candidate.photoUrl;
                    return (
                      <div className="flex items-center gap-3">
                        {symbolUrl ? (
                          <img
                            src={symbolUrl}
                            alt={`${summary.winner.candidate.user?.name ?? 'Winner'} symbol`}
                            className="h-12 w-12 rounded-lg object-cover border border-white/10"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-primary-900/30 border border-primary-500/20" />
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Winner in your area</p>
                          <p className="text-base font-bold text-white">
                            {summary.winner.candidate.user?.name ?? 'Unknown candidate'}
                          </p>
                          <p className="text-xs text-primary-400">
                            {summary.winner.candidate.party?.name ?? 'Independent'}
                            {summary.winner.candidate.constituency?.name ? ` - ${summary.winner.candidate.constituency.name}` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {(() => {
                  const summary = getWinnerSummary(election.id);
                  if (!summary) {
                    return (
                      <span className="text-sm font-medium text-gray-500 bg-white/5 px-4 py-2 rounded-lg border border-white/5 self-start lg:self-center">
                        No result
                      </span>
                    );
                  }

                  const wide = summary.electionWideTotalVotes;
                  const local = summary.areaVoteTotal;
                  const showNational =
                    typeof wide === 'number' && wide > 0 && wide !== local;

                  return (
                    <div className="self-start lg:self-center rounded-lg border border-primary-500/20 bg-primary-500/10 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary-400">Victory margin</p>
                      <p className="mt-1 text-lg font-extrabold text-white">
                        {summary.margin} vote{summary.margin === 1 ? '' : 's'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {local} vote{local === 1 ? '' : 's'} counted in your city or constituency
                      </p>
                      {showNational && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {wide} vote{wide === 1 ? '' : 's'} nationwide (all areas)
                        </p>
                      )}
                    </div>
                  );
                })()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
