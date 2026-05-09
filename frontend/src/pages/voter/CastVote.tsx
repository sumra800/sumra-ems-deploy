import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../../contexts/ConfirmContext';

interface Candidate {
  id: string;
  photoUrl?: string;
  user: {
    name: string;
  };
  party?: {
    name: string;
    logoUrl?: string;
  };
}

export default function CastVote() {
  const confirm = useConfirm();
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [electionTitle, setElectionTitle] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const checkStatusAndFetchCandidates = async () => {
      try {
        const voteStatus = await api.get(`/votes/has-voted/${electionId}`);
        if (voteStatus.data) {
          setHasVoted(true);
          setLoading(false);
          return;
        }

        const electionRes = await api.get(`/elections/${electionId}`);
        setElectionTitle(electionRes.data.title);

        const candidatesRes = await api.get('/candidates');
        setCandidates(candidatesRes.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load election data');
        navigate('/voter/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (electionId) {
      checkStatusAndFetchCandidates();
    }
  }, [electionId, navigate]);

  const handleCastVote = async () => {
    if (!selectedCandidate) return;

    const ok = await confirm({
      title: 'Submit vote',
      message: 'You cannot change your vote once submitted. Continue?',
      confirmLabel: 'Submit vote',
      variant: 'default',
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      await api.post('/votes', {
        electionId,
        candidateId: selectedCandidate,
      });
      toast.success('Vote cast successfully!');
      navigate('/voter/my-votes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="max-w-lg mx-auto mt-6 sm:mt-10 px-3 sm:px-0">
        <div className="glass-card border border-white/10 px-4 py-10 sm:px-8 text-center">
          <CheckCircle className="mx-auto h-14 w-14 sm:h-16 sm:w-16 text-primary-400 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Vote Already Recorded</h2>
          <p className="mb-6 text-sm sm:text-base text-gray-400">
            You have already securely cast your vote in this election.
          </p>
          <button
            type="button"
            onClick={() => navigate('/voter/my-votes')}
            className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-colors"
          >
            View Voting History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto font-sans px-0 sm:px-0 min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
          {electionTitle}
        </h1>
        <p className="mt-2 text-sm text-gray-400 flex flex-wrap items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 shrink-0 text-primary-500" aria-hidden />
          <span>Select your preferred candidate carefully. This action cannot be undone.</span>
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedCandidate(candidate.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedCandidate(candidate.id);
              }
            }}
            className={`relative rounded-xl border-2 p-4 sm:p-6 cursor-pointer transition-all duration-200 min-h-[44px] ${
              selectedCandidate === candidate.id
                ? 'border-primary-500 bg-white/10 ring-2 ring-primary-500/50 shadow-lg'
                : 'border-white/10 bg-white/[0.04] hover:border-primary-500/50 hover:bg-white/[0.06]'
            }`}
          >
            {selectedCandidate === candidate.id && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 h-6 w-6 text-primary-400" aria-hidden>
                <CheckCircle className="h-full w-full" />
              </div>
            )}

            <div className="flex items-start sm:items-center gap-3 sm:gap-4 pr-7 sm:pr-8">
              {candidate.photoUrl ? (
                <img
                  src={candidate.photoUrl}
                  alt=""
                  className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-300">{candidate.user.name.charAt(0)}</span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-white break-words">{candidate.user.name}</h3>
                {candidate.party ? (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {candidate.party.logoUrl && (
                      <img
                        src={candidate.party.logoUrl}
                        alt=""
                        className="h-5 w-5 rounded-full shrink-0 border border-white/10"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-400 break-words">{candidate.party.name}</span>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-gray-500 mt-1 block">Independent Candidate</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-400 mb-3" />
          <h3 className="text-lg font-medium text-white">No Candidates Found</h3>
          <p className="mt-1 text-sm text-gray-400 max-w-md mx-auto">
            There are no candidates registered for this election.
          </p>
        </div>
      )}

      <div className="mt-8 sm:mt-10 border-t border-white/10 pt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end sm:gap-4">
        <button
          type="button"
          onClick={() => navigate('/voter/dashboard')}
          className="min-h-[48px] w-full sm:w-auto sm:min-w-[7rem] rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCastVote}
          disabled={!selectedCandidate || submitting}
          className={`min-h-[48px] w-full sm:w-auto sm:min-w-[12rem] rounded-xl px-6 py-3 text-sm font-bold text-white transition-all ${
            !selectedCandidate || submitting
              ? 'bg-primary-800/50 cursor-not-allowed opacity-70'
              : 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-900/30'
          }`}
        >
          {submitting ? 'Submitting secure vote...' : 'Cast Secure Vote'}
        </button>
      </div>
    </div>
  );
}
