import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/axios';
import { Plus, Trash2, UserSquare2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAlert, useConfirm } from '../../contexts/ConfirmContext';
import { PROFILE_PHOTO_ACCEPT } from '../../lib/imageUpload';

const candidateSymbolFileClass =
  'glass-input w-full block text-sm leading-snug !py-2 file:mr-3 file:inline-flex file:h-7 file:max-h-7 file:items-center file:rounded-lg file:border-0 file:bg-blue-600 file:px-2.5 file:text-xs file:font-semibold file:text-white file:leading-none hover:file:bg-blue-500 disabled:opacity-50';

interface Candidate {
  id: string;
  user: { id: string; name: string; cnic: string };
  constituency: { id: string; name: string };
  party?: { id: string; name: string };
  photoUrl?: string;
}

export default function Candidates() {
  const confirm = useConfirm();
  const alert = useAlert();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [userId, setUserId] = useState('');
  const [constituencyId, setConstituencyId] = useState('');
  const [partyId, setPartyId] = useState('');
  const [symbol, setSymbol] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState('');
  const [editConstituencyId, setEditConstituencyId] = useState('');
  const [editPartyId, setEditPartyId] = useState('');
  const [editSymbol, setEditSymbol] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // File input refs
  const createSymbolRef = useRef<HTMLInputElement>(null);
  const editSymbolRef = useRef<HTMLInputElement>(null);

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
    if (!userId) {
      await alert({
        title: 'User required',
        message: 'Please select a user to register as a candidate.',
      });
      return;
    }
    if (!constituencyId) {
      await alert({
        title: 'Constituency required',
        message: 'Please select a constituency for this candidate.',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('constituencyId', constituencyId);
      if (partyId) {
        formData.append('partyId', partyId);
      } else if (symbol) {
        formData.append('symbol', symbol);
      }

      await api.post('/candidates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Candidate registered!');
      setUserId('');
      setConstituencyId('');
      setPartyId('');
      setSymbol(null);
      if (createSymbolRef.current) createSymbolRef.current.value = '';
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Remove candidate',
      message: 'Remove this candidate from the election? This cannot be undone.',
      confirmLabel: 'Remove',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/candidates/${id}`);
      toast.success('Deleted successfully');
      setCandidates(candidates.filter(c => c.id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const startEditing = (candidate: Candidate) => {
    setEditingId(candidate.id);
    setEditUserId(candidate.user.id);
    setEditConstituencyId(candidate.constituency.id);
    setEditPartyId(candidate.party?.id || '');
    setEditSymbol(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditUserId('');
    setEditConstituencyId('');
    setEditPartyId('');
    setEditSymbol(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    if (!editUserId) {
      await alert({
        title: 'User required',
        message: 'Please select a user.',
      });
      return;
    }
    if (!editConstituencyId) {
      await alert({
        title: 'Constituency required',
        message: 'Please select a constituency.',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('userId', editUserId);
      formData.append('constituencyId', editConstituencyId);
      if (editPartyId) {
        formData.append('partyId', editPartyId);
      } else if (editSymbol) {
        formData.append('symbol', editSymbol);
      }

      const response = await api.patch(`/candidates/${editingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Candidate updated!');
      setCandidates(candidates.map(c => c.id === editingId ? response.data : c));
      if (editSymbolRef.current) editSymbolRef.current.value = '';
      cancelEditing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update candidate');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 font-sans relative z-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Candidates</h1>
        <p className="mt-2 text-sm text-gray-400">Register users as candidates in specific constituencies.</p>
      </div>

      {/* Create Form */}
      <div className="glass-card p-4 sm:p-6 border-t-4 border-t-blue-500">
        <h3 className="text-lg font-bold text-white mb-4">Register Candidate</h3>
        <form noValidate onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">User</label>
            <select
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
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Independent Symbol</label>
            <input
              ref={createSymbolRef}
              type="file"
              accept={PROFILE_PHOTO_ACCEPT}
              disabled={Boolean(partyId)}
              onChange={(e) => setSymbol(e.target.files?.[0] ?? null)}
              className={candidateSymbolFileClass}
            />
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
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 bg-white/5">
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
              <li key={candidate.id} className="px-4 sm:px-6 py-5 hover:bg-white/5 transition-colors">
                {editingId === candidate.id ? (
                  // Edit Form
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">User</label>
                        <select
                          value={editUserId}
                          onChange={(e) => setEditUserId(e.target.value)}
                          className="glass-input w-full [&>option]:bg-[#111] [&>option]:text-white"
                        >
                          <option value="">Select User...</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.cnic})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Constituency</label>
                        <select
                          value={editConstituencyId}
                          onChange={(e) => setEditConstituencyId(e.target.value)}
                          className="glass-input w-full [&>option]:bg-[#111] [&>option]:text-white"
                        >
                          <option value="">Select Constituency...</option>
                          {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Party (Optional)</label>
                        <select
                          value={editPartyId}
                          onChange={(e) => setEditPartyId(e.target.value)}
                          className="glass-input w-full [&>option]:bg-[#111] [&>option]:text-white"
                        >
                          <option value="">Independent (No Party)</option>
                          {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Independent Symbol</label>
                        <input
                          ref={editSymbolRef}
                          type="file"
                          accept={PROFILE_PHOTO_ACCEPT}
                          disabled={Boolean(editPartyId)}
                          onChange={(e) => setEditSymbol(e.target.files?.[0] ?? null)}
                          className={candidateSymbolFileClass}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="btn-primary !bg-blue-600 hover:!bg-blue-500"
                      >
                        {isUpdating ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </form>
                ) : (
                  // Display Mode
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mr-4">
                        {candidate.photoUrl ? (
                          <img src={candidate.photoUrl} alt={`${candidate.user?.name} symbol`} className="h-8 w-8 rounded-lg object-cover" />
                        ) : (
                          <UserSquare2 className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-white break-words">{candidate.user?.name}</p>
                        <p className="text-sm text-gray-400 mt-0.5 break-words">
                          <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300 border border-white/5 mr-2">{candidate.constituency?.name}</span>
                          <span className="text-primary-400 font-medium">{candidate.party?.name || 'Independent'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => startEditing(candidate)}
                        className="shrink-0 text-gray-500 hover:text-blue-400 p-2 rounded-lg hover:bg-blue-400/10 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(candidate.id)}
                        className="shrink-0 text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
