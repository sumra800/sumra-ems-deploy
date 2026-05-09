import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Plus, Play, Pause, CheckCircle, Trash2, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAlert, useConfirm } from '../../contexts/ConfirmContext';
import { ELECTION_TITLE_MESSAGE, ELECTION_TITLE_REGEX } from '../../lib/inputFormats';

interface Election {
  id: string;
  title: string;
  status: 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  startTime: string | null;
  endTime: string | null;
}

export default function Elections() {
  const confirm = useConfirm();
  const alert = useAlert();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections');
      setElections(res.data);
    } catch (error) {
      toast.error('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!ELECTION_TITLE_REGEX.test(trimmedTitle)) {
      await alert({
        title: 'Invalid election title',
        message: ELECTION_TITLE_MESSAGE,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/elections', { title: trimmedTitle, status: 'PENDING' });
      toast.success('Election created!');
      setTitle('');
      fetchElections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const ok = await confirm({
      title: 'Change election status',
      message: `Are you sure you want to change the status to ${newStatus}?`,
      confirmLabel: 'Continue',
      variant: 'warning',
    });
    if (!ok) return;
    try {
      await api.patch(`/elections/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchElections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete election',
      message: 'Delete this election? This will also delete all associated votes.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/elections/${id}`);
      toast.success('Deleted successfully');
      fetchElections();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 font-sans relative z-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Elections</h1>
        <p className="mt-2 text-sm text-gray-400">Manage elections and their lifecycles securely.</p>
      </div>

      {/* Create Form */}
      <div className="glass-card p-4 sm:p-6 border-t-4 border-t-primary-500">
        <h3 className="text-lg font-bold text-white mb-4">Create New Election</h3>
        <form noValidate onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
          <div className="flex-1 w-full">
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1.5">Election Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., General Elections 2026"
              className="glass-input w-full"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full sm:w-auto flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Create Election
          </button>
        </form>
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 bg-white/5">
          <h3 className="text-lg font-semibold text-white">Election Lifecycle Management</h3>
        </div>
        <ul className="divide-y divide-white/5">
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : elections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No elections found.</div>
          ) : (
            elections.map((election) => (
              <li key={election.id} className="px-4 sm:px-6 py-6 flex flex-col xl:flex-row xl:items-center justify-between hover:bg-white/5 transition-colors gap-6">
                <div className="flex items-start min-w-0">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mr-4 sm:mr-5 flex-shrink-0">
                    <Flag className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-1">
                      <p className="text-lg sm:text-xl font-bold text-white break-words">{election.title}</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wider
                        ${election.status === 'RUNNING' ? 'bg-primary-500/10 text-primary-400 border-primary-500/30' : 
                          election.status === 'COMPLETED' ? 'bg-white/5 text-gray-400 border-white/10' : 
                          election.status === 'PAUSED' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}
                      >
                        {election.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex w-full flex-col sm:flex-row sm:flex-wrap gap-2 xl:w-auto xl:min-w-0 xl:justify-end xl:ml-auto">
                  {election.status === 'PENDING' && (
                    <button type="button" onClick={() => handleUpdateStatus(election.id, 'RUNNING')} className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center px-4 py-2 border border-primary-500/30 text-sm font-semibold rounded-xl text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 transition-colors">
                      <Play className="h-4 w-4 mr-1.5 shrink-0 fill-current" /> Start Voting
                    </button>
                  )}
                  {election.status === 'RUNNING' && (
                    <>
                      <button type="button" onClick={() => handleUpdateStatus(election.id, 'PAUSED')} className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center px-4 py-2 border border-yellow-500/30 text-sm font-semibold rounded-xl text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors">
                        <Pause className="h-4 w-4 mr-1.5 shrink-0 fill-current" /> Pause
                      </button>
                      <button type="button" onClick={() => handleUpdateStatus(election.id, 'COMPLETED')} className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center px-4 py-2 border border-white/10 text-sm font-semibold rounded-xl text-white bg-white/5 hover:bg-white/10 transition-colors">
                        <CheckCircle className="h-4 w-4 mr-1.5 shrink-0" /> End Election
                      </button>
                    </>
                  )}
                  {election.status === 'PAUSED' && (
                    <button type="button" onClick={() => handleUpdateStatus(election.id, 'RUNNING')} className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center px-4 py-2 border border-primary-500/30 text-sm font-semibold rounded-xl text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 transition-colors">
                      <Play className="h-4 w-4 mr-1.5 shrink-0 fill-current" /> Resume
                    </button>
                  )}
                  
                  <div className="hidden sm:block w-px h-8 bg-white/10 mx-1 self-center shrink-0" aria-hidden />

                  <button type="button" onClick={() => handleDelete(election.id)} className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center p-2 border border-red-500/20 text-sm font-medium rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors" title="Delete Election">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
