import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAlert, useConfirm } from '../../contexts/ConfirmContext';
import { validatePartyFields } from '../../lib/inputFormats';
import { PROFILE_PHOTO_ACCEPT } from '../../lib/imageUpload';

/** Same visual height as text inputs + submit button on this form */
const partyFormControlH = 'h-12';

const partyTextInputClass = `glass-input w-full ${partyFormControlH} px-4 !py-0 text-sm`;

/** Wrapper: native file inputs ignore flex on the input itself; center via flex container */
const partySymbolFileWrapClass = [
  `${partyFormControlH} w-full flex items-center rounded-xl border border-white/10 bg-white/5 px-4`,
  'transition-all focus-within:border-primary-500 focus-within:bg-white/10 focus-within:ring-1 focus-within:ring-primary-500',
].join(' ');

const partySymbolFileInnerClass = [
  'w-full min-w-0 max-h-full border-0 bg-transparent p-0 text-sm leading-none text-gray-300 outline-none cursor-pointer self-center',
  'file:mr-3 file:inline-flex file:h-8 file:max-h-8 file:shrink-0 file:items-center file:justify-center file:align-middle',
  'file:rounded-lg file:border-0 file:bg-orange-600 file:px-2.5 file:text-xs file:font-semibold file:text-white file:leading-none',
  'file:cursor-pointer hover:file:bg-orange-500',
].join(' ');

const partySubmitClass =
  `${partyFormControlH} w-full inline-flex items-center justify-center rounded-xl font-semibold px-6 text-sm text-white bg-orange-600 transition-all duration-300 hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] disabled:opacity-50 disabled:cursor-not-allowed`;

/** Same-height label band so all headings align; fourth column uses visually empty spacer */
const partyLabelClass =
  'min-h-[2.75rem] flex items-end text-sm font-medium text-gray-400 leading-snug';

interface Party {
  id: string;
  name: string;
  leaderName?: string;
  logoUrl?: string;
}

export default function Parties() {
  const confirm = useConfirm();
  const alert = useAlert();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [symbol, setSymbol] = useState<File | null>(null);
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
    const trimmedName = name.trim();
    const trimmedLeaderName = leaderName.trim();
    const formatError = validatePartyFields(trimmedName, trimmedLeaderName);
    if (formatError) {
      await alert({ title: 'Invalid format', message: formatError });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      if (trimmedLeaderName) {
        formData.append('leaderName', trimmedLeaderName);
      }
      if (symbol) {
        formData.append('symbol', symbol);
      }

      await api.post('/parties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Party added!');
      setName('');
      setLeaderName('');
      setSymbol(null);
      fetchParties();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete party',
      message: 'Are you sure you want to delete this party? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Political Parties</h1>
        <p className="mt-2 text-sm text-gray-400">Manage parties available for candidates.</p>
      </div>

      {/* Create Form */}
      <div className="glass-card p-4 sm:p-6 border-t-4 border-t-orange-500">
        <h3 className="text-lg font-bold text-white mb-4">Add New Party</h3>
        <form noValidate onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:items-end">
          <div className="flex flex-col gap-1.5 flex-1 w-full min-w-0">
            <label htmlFor="name" className={partyLabelClass}>
              Party Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={partyTextInputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 w-full min-w-0">
            <label htmlFor="leader" className={partyLabelClass}>
              Leader Name <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              id="leader"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              className={partyTextInputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 w-full min-w-0">
            <label htmlFor="symbol" className={partyLabelClass}>
              Party Symbol
            </label>
            <div className={partySymbolFileWrapClass}>
              <input
                type="file"
                id="symbol"
                accept={PROFILE_PHOTO_ACCEPT}
                onChange={(e) => setSymbol(e.target.files?.[0] ?? null)}
                className={partySymbolFileInnerClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 w-full min-w-0">
            <span className={partyLabelClass}>
              <span className="sr-only">Submit</span>
            </span>
            <button type="submit" disabled={isSubmitting} className={partySubmitClass}>
              <Plus className="h-5 w-5 mr-1" />
              Add Party
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 bg-white/5">
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
              <li key={party.id} className="px-4 sm:px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mr-4">
                    {party.logoUrl ? (
                      <img src={party.logoUrl} alt={`${party.name} symbol`} className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                      <Users className="h-5 w-5 text-orange-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-white break-words">{party.name}</p>
                    {party.leaderName && <p className="text-sm text-gray-400 break-words">Leader: {party.leaderName}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(party.id)}
                  className="self-end sm:self-auto shrink-0 text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
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
