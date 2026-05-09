import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { Plus, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAlert, useConfirm } from '../../contexts/ConfirmContext';
import {
  CITY_NAME_MESSAGE,
  CITY_NAME_REGEX,
  CONSTITUENCY_CODE_MESSAGE,
  CONSTITUENCY_CODE_REGEX,
} from '../../lib/inputFormats';

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
  const confirm = useConfirm();
  const alert = useAlert();
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
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
    const trimmedName = name.trim();
    if (!cityId) {
      await alert({
        title: 'City required',
        message: 'Please select a city for this constituency.',
      });
      return;
    }
    if (!CONSTITUENCY_CODE_REGEX.test(trimmedName)) {
      await alert({
        title: 'Invalid constituency code',
        message: CONSTITUENCY_CODE_MESSAGE,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedCity = cities.find((city) => city.id === cityId);
      await api.post('/constituencies', {
        name: trimmedName,
        cityId,
        region: selectedCity?.province ?? '',
      });
      toast.success('Constituency added!');
      setName('');
      setCityId('');
      fetchConstituencies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingProvinces = Array.from(
    new Set(cities.map((city) => city.province.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCity = cityName.trim();
    if (!cityProvince.trim()) {
      await alert({
        title: 'Province required',
        message: 'Choose an existing province before adding a city.',
      });
      return;
    }
    if (!CITY_NAME_REGEX.test(trimmedCity)) {
      await alert({
        title: 'Invalid city name',
        message: CITY_NAME_MESSAGE,
      });
      return;
    }
    setIsCitySubmitting(true);
    try {
      await api.post('/cities', { name: trimmedCity, province: cityProvince.trim() });
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
    const ok = await confirm({
      title: 'Delete constituency',
      message: 'Are you sure you want to delete this constituency? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Constituencies</h1>
        <p className="mt-2 text-sm text-gray-400">Manage electoral districts and regions.</p>
      </div>

      <div className="glass-card p-4 sm:p-6 border-t-4 border-t-blue-500">
        <h3 className="text-lg font-bold text-white mb-4">Add City</h3>
        <form noValidate onSubmit={handleCreateCity} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="cityName" className="block text-sm font-medium text-gray-400 mb-1.5">City Name</label>
            <input
              type="text"
              id="cityName"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g., Lahore"
              className="glass-input w-full"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="cityProvince" className="block text-sm font-medium text-gray-400 mb-1.5">Province</label>
            <select
              id="cityProvince"
              value={cityProvince}
              onChange={(e) => setCityProvince(e.target.value)}
              className="glass-input w-full [&>option]:bg-[#111] [&>option]:text-white"
            >
              <option value="">Select Existing Province...</option>
              {existingProvinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isCitySubmitting || existingProvinces.length === 0}
            className="btn-primary w-full sm:w-auto flex items-center justify-center !bg-blue-600 hover:!bg-blue-500"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add City
          </button>
        </form>
      </div>

      {/* Create Form */}
      <div className="glass-card p-4 sm:p-6 border-t-4 border-t-primary-500">
        <h3 className="text-lg font-bold text-white mb-4">Add New Constituency</h3>
        <form noValidate onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1.5">Constituency Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., NA-1"
              className="glass-input w-full"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="cityId" className="block text-sm font-medium text-gray-400 mb-1.5">City</label>
            <select
              id="cityId"
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
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 bg-white/5">
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
              <li key={constituency.id} className="px-4 sm:px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-start sm:items-center min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mr-4">
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-white">{constituency.name}</p>
                    <p className="text-sm text-gray-400 break-words">
                      {constituency.region}
                      {constituency.city?.name ? ` - ${constituency.city.name}${constituency.city.province ? `, ${constituency.city.province}` : ''}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(constituency.id)}
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
