import { Link } from 'react-router-dom';
import { Landmark, LogIn, UserPlus } from 'lucide-react';

export default function Welcome() {
  return (
    <main className="min-h-screen bg-[#07110b] text-white font-sans">
      <section className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full border border-white/20 bg-primary-700 flex items-center justify-center shadow-[0_0_24px_rgba(34,197,94,0.18)]">
                <Landmark className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-200">Government of Pakistan</p>
                <p className="text-xs text-gray-300">Election Management System</p>
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,74,35,0.95),rgba(4,23,12,0.98))]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-white" />
          <div className="absolute left-0 top-0 h-full w-2 bg-primary-500" />

          <div className="relative mx-auto max-w-6xl px-6 py-16 min-h-[calc(100vh-82px)] flex items-center">
            <div className="max-w-3xl">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-primary-100">
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
                Official Digital Voting Portal
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Welcome to election portal of Pakistan by govt of Pakistan
              </h1>

              <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8 text-gray-200">
                Secure access for voters and election administrators under the Election Management System.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-primary-900 hover:bg-gray-100 transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  Login to Portal
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/15 transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  Register as Voter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
