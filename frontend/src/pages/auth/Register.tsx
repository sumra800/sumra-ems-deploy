import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { isAllowedRasterOrSvgFile, PROFILE_PHOTO_ACCEPT } from '../../lib/imageUpload';

interface City {
  id: string;
  name: string;
  province: string;
}

export default function Register() {
  const [name, setName] = useState('');
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cityId, setCityId] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; cnic?: string; password?: string; confirmPassword?: string; cityId?: string; photo?: string }>({});
  const navigate = useNavigate();
  const { login } = useAuth();

  React.useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get('/cities');
        setCities(response.data);
      } catch (error) {
        toast.error('Failed to load cities');
      }
    };

    fetchCities();
  }, []);

  const validateForm = () => {
    const newErrors: { name?: string; cnic?: string; password?: string; confirmPassword?: string; cityId?: string; photo?: string } = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // CNIC validation
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnic.trim()) {
      newErrors.cnic = 'CNIC is required';
    } else if (!cnicRegex.test(cnic.trim())) {
      newErrors.cnic = 'CNIC must be in format: 12345-1234567-1';
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    // Confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // City validation
    if (!cityId) {
      newErrors.cityId = 'Please select your city';
    }

    // Photo validation
    if (!photo) {
      newErrors.photo = 'Profile picture is required';
    } else if (!isAllowedRasterOrSvgFile(photo)) {
      newErrors.photo = 'Picture must be SVG, PNG, JPG, or JPEG';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const sanitizedName = name.trim();
      const sanitizedCnic = cnic.trim();
      const formData = new FormData();
      formData.append('name', sanitizedName);
      formData.append('cnic', sanitizedCnic);
      formData.append('password', password);
      formData.append('cityId', cityId);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      login(response.data);
      toast.success('Registration successful!');
      navigate('/voter/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0a0a0a] flex flex-col justify-center py-10 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.15)]">
            <UserPlus className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Register to cast your secure vote. Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-500 hover:text-primary-400 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 sm:px-10">
          <form className="space-y-6" noValidate onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full block"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="cnic" className="block text-sm font-medium text-gray-300 mb-1.5">
                CNIC Number
              </label>
              <input
                id="cnic"
                name="cnic"
                type="text"
                placeholder="12345-1234567-1"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                className="glass-input w-full block"
              />
              {errors.cnic && <p className="mt-1 text-sm text-red-400">{errors.cnic}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full block"
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-input w-full block"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1.5">
                City
              </label>
              <select
                id="city"
                name="city"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="glass-input w-full block [&>option]:bg-[#111] [&>option]:text-white"
              >
                <option value="">Select your city...</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name} ({city.province})</option>
                ))}
              </select>
              {errors.cityId && <p className="mt-1 text-sm text-red-400">{errors.cityId}</p>}
            </div>

            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-1.5">
                Picture
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept={PROFILE_PHOTO_ACCEPT}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setPhoto(f);
                  if (f && !isAllowedRasterOrSvgFile(f)) {
                    setErrors((prev) => ({ ...prev, photo: 'Picture must be SVG, PNG, JPG, or JPEG' }));
                  } else {
                    setErrors((prev) => {
                      const { photo: _p, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                className="glass-input w-full block text-sm leading-snug !py-2 file:mr-3 file:inline-flex file:h-7 file:max-h-7 file:items-center file:rounded-lg file:border-0 file:bg-primary-600 file:px-2.5 file:text-xs file:font-semibold file:text-white file:leading-none hover:file:bg-primary-500"
              />
              {errors.photo && <p className="mt-1 text-sm text-red-400">{errors.photo}</p>}
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center">
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Register Securely'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
