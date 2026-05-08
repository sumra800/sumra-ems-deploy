import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Plus, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface Constituency {
  id: string;
  name: string;
  region: string;
  city?: City;
}

interface City {
  id: string;
  name: string;
  province: string;
}

export default function Constituencies() {
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [cityId, setCityId] = useState('');
  const [cityName, setCityName] = useState('');
  const [cityProvince, setCityProvince] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCitySubmitting, setIsCitySubmitting] = useState(false);

  const fetchConstituencies = async () => {
    try {
      const [constituenciesRes, citiesRes] = await Promise.all([
        api.get('/constituencies'),
        api.get('/cities'),
      ]);
      setConstituencies(constituenciesRes.data);
      setCities(citiesRes.data);
    } catch (error) {
      toast.error('Failed to fetch constituencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConstituencies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/constituencies', { name, region, cityId });
      toast.success('Constituency added!');
      setName('');
      setRegion('');
      setCityId('');
      fetchConstituencies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCitySubmitting(true);
    try {
      await api.post('/cities', { name: cityName, province: cityProvince });
      toast.success('City added!');
      setCityName('');
      setCityProvince('');
      fetchConstituencies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create city');
    } finally {
      setIsCitySubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this constituency?')) return;
    try {
      await api.delete(`/constituencies/${id}`);
      toast.success('Deleted successfully');
      setConstituencies(constituencies.filter(c => c.id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 font-sans relative z-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Constituencies</h1>
        <p className="mt-2 text-sm text-gray-400">Manage electoral districts and regions.</p>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-blue-500">
        <h3 className="text-lg font-bold text-white mb-4">Add City</h3>
        <form onSubmit={handleCreateCity} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="cityName" className="block text-sm font-medium text-gray-400 mb-1.5">City Name</label>
            <input
              type="text"
              id="cityName"
              required
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g., Lahore"
              className="glass-input w-full"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="cityProvince" className="block text-sm font-medium text-gray-400 mb-1.5">Province</label>
            <input
              type="text"
              id="cityProvince"
              required
              value={cityProvince}
              onChange={(e) => setCityProvince(e.target.value)}
              placeholder="e.g., Punjab"
              className="glass-input w-full"
            />
          </div>
          <button
            type="submit"
            disabled={isCitySubmitting}
            className="btn-primary w-full sm:w-auto flex items-center justify-center !bg-blue-600 hover:!bg-blue-500"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add City
          </button>
        </form>
      </div>

      {/* Create Form */}
      <div className="glass-card p-6 border-t-4 border-t-primary-500">
        <h3 className="text-lg font-bold text-white mb-4">Add New Constituency</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1.5">Constituency Name</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., NA-1"
              className="glass-input w-full"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="region" className="block text-sm font-medium text-gray-400 mb-1.5">Constituency Province / Region</label>
            <input
              type="text"
              id="region"
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g., Punjab"
              className="glass-input w-full"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="cityId" className="block text-sm font-medium text-gray-400 mb-1.5">City</label>
            <select
              id="cityId"
              required
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="glass-input w-full [&>option]:bg-[#111] [&>option]:text-white"
            >
              <option value="">Select City...</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name} ({city.province})</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full sm:w-auto flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add District
          </button>
        </form>
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/5">
          <h3 className="text-lg font-semibold text-white">Registered Constituencies</h3>
        </div>
        <ul className="divide-y divide-white/5">
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : constituencies.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No constituencies found.</div>
          ) : (
            constituencies.map((constituency) => (
              <li key={constituency.id} className="px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mr-4">
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{constituency.name}</p>
                    <p className="text-sm text-gray-400">
                      {constituency.region}
                      {constituency.city?.name ? ` - ${constituency.city.name}${constituency.city.province ? `, ${constituency.city.province}` : ''}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(constituency.id)}
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
