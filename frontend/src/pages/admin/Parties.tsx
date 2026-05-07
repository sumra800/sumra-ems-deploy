import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface Party {
  id: string;
  name: string;
  leaderName?: string;
  logoUrl?: string;
}

export default function Parties() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchParties = async () => {
    try {
      const res = await api.get('/parties');
      setParties(res.data);
    } catch (error) {
      toast.error('Failed to fetch parties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/parties', { name, leaderName });
      toast.success('Party added!');
      setName('');
      setLeaderName('');
      fetchParties();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this party?')) return;
    try {
      await api.delete(`/parties/${id}`);
      toast.success('Deleted successfully');
      setParties(parties.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 font-sans relative z-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Political Parties</h1>
        <p className="mt-2 text-sm text-gray-400">Manage parties available for candidates.</p>
      </div>

      {/* Create Form */}
      <div className="glass-card p-6 border-t-4 border-t-orange-500">
        <h3 className="text-lg font-bold text-white mb-4">Add New Party</h3>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1.5">Party Name</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="leader" className="block text-sm font-medium text-gray-400 mb-1.5">Leader Name (Optional)</label>
            <input
              type="text"
              id="leader"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full sm:w-auto flex items-center justify-center !bg-orange-600 hover:!bg-orange-500 hover:!shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Party
          </button>
        </form>
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/5">
          <h3 className="text-lg font-semibold text-white">Registered Parties</h3>
        </div>
        <ul className="divide-y divide-white/5">
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : parties.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No parties found.</div>
          ) : (
            parties.map((party) => (
              <li key={party.id} className="px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mr-4">
                    <Users className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{party.name}</p>
                    {party.leaderName && <p className="text-sm text-gray-400">Leader: {party.leaderName}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(party.id)}
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
