import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sanitizedName = name.trim();
      const sanitizedCnic = cnic.trim();
      const response = await api.post('/auth/register', { name: sanitizedName, cnic: sanitizedCnic, password });
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full block"
              />
            </div>

            <div>
              <label htmlFor="cnic" className="block text-sm font-medium text-gray-300 mb-1.5">
                CNIC Number
              </label>
              <input
                id="cnic"
                name="cnic"
                type="text"
                required
                placeholder="12345-1234567-1"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                className="glass-input w-full block"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full block"
              />
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
