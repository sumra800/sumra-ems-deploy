import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Plus, Trash2, UserSquare2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Candidate {
  id: string;
  user: { id: string; name: string; cnic: string };
  constituency: { id: string; name: string };
  party?: { id: string; name: string };
}

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState('');
  const [constituencyId, setConstituencyId] = useState('');
  const [partyId, setPartyId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [candRes, usersRes, constRes, partyRes] = await Promise.all([
        api.get('/candidates'),
        api.get('/users'),
        api.get('/constituencies'),
        api.get('/parties'),
      ]);
      setCandidates(candRes.data);
      setUsers(usersRes.data);
      setConstituencies(constRes.data);
      setParties(partyRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/candidates', {
        userId,
        constituencyId,
        partyId: partyId || undefined,
      });
      toast.success('Candidate registered!');
      setUserId('');
      setConstituencyId('');
      setPartyId('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this candidate?')) return;
    try {
      await api.delete(`/candidates/${id}`);
      toast.success('Deleted successfully');
      setCandidates(candidates.filter(c => c.id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 font-sans relative z-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Candidates</h1>
        <p className="mt-2 text-sm text-gray-400">Register users as candidates in specific constituencies.</p>
      </div>

      {/* Create Form */}
      <div className="glass-card p-6 border-t-4 border-t-blue-500">
        <h3 className="text-lg font-bold text-white mb-4">Register Candidate</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">User</label>
            <select
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="glass-input w-full [&>option]:bg-[#111] [&>option]:text-white"
            >
              <option value="">Select User...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.cnic})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Constituency</label>
            <select
              required
              value={constituencyId}
              onChange={(e) => setConstituencyId(e.target.value)}
              className="glass-input w-full [&>option]:bg-[#111] [&>option]:text-white"
            >
              <option value="">Select Constituency...</option>
              {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Party (Optional)</label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="glass-input w-full [&>option]:bg-[#111] [&>option]:text-white"
            >
              <option value="">Independent (No Party)</option>
              {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center !bg-blue-600 hover:!bg-blue-500 hover:!shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            <Plus className="h-5 w-5 mr-1" />
            Register
          </button>
        </form>
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/5">
          <h3 className="text-lg font-semibold text-white">Registered Candidates</h3>
        </div>
        <ul className="divide-y divide-white/5">
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No candidates registered.</div>
          ) : (
            candidates.map((candidate) => (
              <li key={candidate.id} className="px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mr-4">
                    <UserSquare2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{candidate.user?.name}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300 border border-white/5 mr-2">{candidate.constituency?.name}</span>
                      <span className="text-primary-400 font-medium">{candidate.party?.name || 'Independent'}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(candidate.id)}
                  className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
