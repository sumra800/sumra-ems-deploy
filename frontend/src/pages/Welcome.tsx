import { Link } from 'react-router-dom';
import { Landmark, LogIn, UserPlus } from 'lucide-react';

export default function Welcome() {
  return (
    <main className="min-h-screen min-h-[100dvh] bg-[#07110b] text-white font-sans w-full max-w-[100vw] overflow-x-hidden">
      <section className="min-h-screen min-h-[100dvh] flex flex-col">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
          <div className="w-full max-w-full pl-3 pr-3 sm:pl-6 sm:pr-6 py-3 sm:py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-start text-left">
              <div className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full border border-white/20 bg-primary-700 flex items-center justify-center shadow-[0_0_24px_rgba(34,197,94,0.18)]">
                <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-sm font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-primary-200 truncate sm:whitespace-normal">
                  Government of Pakistan
                </p>
                <p className="text-[10px] sm:text-xs text-gray-300 truncate sm:whitespace-normal">Govt EMS</p>
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold text-white hover:bg-white/15 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Login
            </Link>
          </div>
        </header>

        <div className="flex-1 relative overflow-x-hidden overflow-y-hidden min-h-0">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,74,35,0.95),rgba(4,23,12,0.98))]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-white" />
          <div className="absolute left-0 top-0 h-full w-2 bg-primary-500" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 min-h-[calc(100dvh-5.5rem)] flex items-center">
            <div className="max-w-3xl w-full min-w-0">
              <div className="mb-6 sm:mb-8 inline-flex max-w-full flex-wrap items-center gap-2 sm:gap-3 rounded-full border border-white/15 bg-white/10 px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-primary-100">
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0 rounded-full bg-white" />
                Official Digital Voting Portal
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight break-words">
                Welcome to election portal of Pakistan by govt of Pakistan
              </h1>

              <p className="mt-5 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed sm:leading-8 text-gray-200">
                Secure access for voters and election administrators under Govt EMS.
              </p>

              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/login"
                  className="inline-flex w-full sm:w-auto min-h-[44px] items-center justify-center gap-2 rounded-lg bg-white px-5 sm:px-6 py-3 text-sm font-bold text-primary-900 hover:bg-gray-100 transition-colors"
                >
                  <LogIn className="h-5 w-5 shrink-0" />
                  Login to Portal
                </Link>
                <Link
                  to="/register"
                  className="inline-flex w-full sm:w-auto min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 sm:px-6 py-3 text-sm font-bold text-white hover:bg-white/15 transition-colors"
                >
                  <UserPlus className="h-5 w-5 shrink-0" />
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
