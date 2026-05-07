import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { CheckCircle2, Calendar, Users, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoteRecord {
  id: string;
  timestamp: string;
  election: {
    id: string;
    title: string;
  };
  candidate: {
    id: string;
    user: {
      name: string;
    };
    party?: {
      name: string;
      logoUrl?: string;
    };
  };
}

export default function MyVotes() {
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await api.get('/votes/my-votes');
        setVotes(response.data);
      } catch (error) {
        toast.error('Failed to load your voting history');
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="relative z-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
          My Voting History
          <ShieldCheck className="ml-3 h-6 w-6 text-primary-400" />
        </h1>
        <p className="mt-2 text-base text-gray-400 max-w-2xl">
          A secure, immutable record of the elections you have participated in.
        </p>
      </div>

      {votes.length === 0 ? (
        <div className="glass-card px-4 py-16 text-center text-gray-500">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <p className="text-lg text-gray-400">You haven't cast any votes yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {votes.map((vote) => (
            <div key={vote.id} className="glass-card overflow-hidden hover:border-white/10 transition-colors">
              <div className="px-6 py-6 sm:p-8">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-xl font-bold text-white leading-tight pr-4">
                    {vote.election.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 whitespace-nowrap">
                    Recorded
                  </span>
                </div>
                
                <div className="border-t border-white/5 pt-5 mt-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Voted for</p>
                  <div className="flex items-center bg-white/5 rounded-xl p-3 border border-white/5">
                    {vote.candidate.party?.logoUrl ? (
                      <img 
                        src={vote.candidate.party.logoUrl} 
                        alt={vote.candidate.party.name} 
                        className="h-10 w-10 rounded-full border border-white/10 mr-4 object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-900/30 border border-primary-500/20 flex items-center justify-center mr-4">
                        <Users className="h-5 w-5 text-primary-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-base font-bold text-white">{vote.candidate.user.name}</p>
                      {vote.candidate.party ? (
                        <p className="text-xs font-medium text-primary-400">{vote.candidate.party.name}</p>
                      ) : (
                        <p className="text-xs font-medium text-gray-500">Independent</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="flex-shrink-0 mr-1.5 h-3.5 w-3.5" />
                    {new Date(vote.timestamp).toLocaleDateString()}
                  </div>
                  <span className="text-[10px] font-mono text-gray-600">ID: {vote.id.split('-')[0]}...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
