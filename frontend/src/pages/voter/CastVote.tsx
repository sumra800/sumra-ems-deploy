import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

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
        // 1. Check if already voted
        const voteStatus = await api.get(`/votes/has-voted/${electionId}`);
        if (voteStatus.data) {
          setHasVoted(true);
          setLoading(false);
          return;
        }

        // 2. Fetch election details
        const electionRes = await api.get(`/elections/${electionId}`);
        setElectionTitle(electionRes.data.title);

        // 3. Fetch candidates (In a real app, backend should filter candidates by voter's constituency.
        // For now, we fetch all and let backend reject if constituency doesn't match)
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
    
    // Confirmation dialog
    if (!window.confirm("Are you sure? You cannot change your vote once submitted.")) {
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/votes', {
        electionId,
        candidateId: selectedCandidate
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-white shadow sm:rounded-lg border border-gray-200 px-4 py-12 text-center text-gray-500">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vote Already Recorded</h2>
          <p className="mb-6">You have already securely cast your vote in this election.</p>
          <button 
            onClick={() => navigate('/voter/my-votes')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Voting History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{electionTitle}</h1>
        <p className="mt-2 text-sm text-gray-600 flex items-center">
          <ShieldAlert className="h-4 w-4 mr-1.5 text-blue-500" />
          Select your preferred candidate carefully. This action cannot be undone.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id}
            onClick={() => setSelectedCandidate(candidate.id)}
            className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 ${
              selectedCandidate === candidate.id 
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-md' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow'
            }`}
          >
            {selectedCandidate === candidate.id && (
              <div className="absolute top-4 right-4 h-6 w-6 text-blue-600">
                <CheckCircle className="h-full w-full" />
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {candidate.photoUrl ? (
                <img src={candidate.photoUrl} alt={candidate.user.name} className="h-16 w-16 rounded-full object-cover border border-gray-200 shadow-sm" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center shadow-sm">
                  <span className="text-xl font-bold text-gray-500">{candidate.user.name.charAt(0)}</span>
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold text-gray-900">{candidate.user.name}</h3>
                {candidate.party ? (
                  <div className="flex items-center mt-1">
                    {candidate.party.logoUrl && (
                      <img src={candidate.party.logoUrl} alt={candidate.party.name} className="h-5 w-5 rounded-full mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-600">{candidate.party.name}</span>
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
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Candidates Found</h3>
          <p className="mt-1 text-sm text-gray-500">There are no candidates registered in your constituency for this election.</p>
        </div>
      )}

      <div className="mt-10 border-t border-gray-200 pt-6 flex justify-end">
        <button
          onClick={() => navigate('/voter/dashboard')}
          className="mr-4 bg-white py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCastVote}
          disabled={!selectedCandidate || submitting}
          className={`py-3 px-8 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
            !selectedCandidate || submitting
              ? 'bg-blue-400 cursor-not-allowed opacity-70'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
          }`}
        >
          {submitting ? 'Submitting secure vote...' : 'Cast Secure Vote'}
        </button>
      </div>
    </div>
  );
}
