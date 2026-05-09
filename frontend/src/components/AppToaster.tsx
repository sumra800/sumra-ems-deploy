import { Toaster, resolveValue, type Toast } from 'react-hot-toast';
import { CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

function ThemedToast({ toast }: { toast: Toast }) {
  const message = resolveValue(toast.message, toast);

  return (
    <div
      className={cn(
        'flex w-[min(100vw-1.5rem,22rem)] max-w-[calc(100vw-1.5rem)] items-start gap-3 rounded-2xl border px-3.5 sm:px-4 py-3.5 shadow-2xl backdrop-blur-xl',
        toast.type === 'success' &&
          'border-primary-500/40 bg-[#0a1610]/95 text-white shadow-[0_8px_40px_rgba(34,197,94,0.2)]',
        toast.type === 'error' &&
          'border-red-500/45 bg-[#160c0c]/95 text-white shadow-[0_8px_40px_rgba(239,68,68,0.22)]',
        toast.type === 'loading' &&
          'border-white/15 bg-[#121212]/95 text-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.45)]',
        toast.type === 'blank' &&
          'border-white/12 bg-[#141414]/95 text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)]',
      )}
      {...toast.ariaProps}
    >
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/35"
        aria-hidden
      >
        {toast.type === 'success' && (
          <CheckCircle2 className="h-[18px] w-[18px] text-primary-400" strokeWidth={2.25} />
        )}
        {toast.type === 'error' && (
          <XCircle className="h-[18px] w-[18px] text-red-400" strokeWidth={2.25} />
        )}
        {toast.type === 'loading' && (
          <Loader2 className="h-[18px] w-[18px] animate-spin text-primary-400" strokeWidth={2.25} />
        )}
        {toast.type === 'blank' && <Info className="h-[18px] w-[18px] text-gray-300" strokeWidth={2} />}
      </span>
      <div className="min-w-0 flex-1 pt-1 text-sm font-medium leading-snug text-gray-100 [&_a]:text-primary-400 [&_a]:underline">
        {message}
      </div>
    </div>
  );
}

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={14}
      toastOptions={{
        duration: 4000,
        success: { duration: 3800 },
        error: { duration: 5500 },
        loading: { duration: Infinity },
      }}
      containerClassName="!z-[235] pointer-events-none [&>*]:pointer-events-auto"
      containerStyle={{
        top: 'max(12px, env(safe-area-inset-top, 0px))',
        right: 'max(12px, env(safe-area-inset-right, 0px))',
      }}
    >
      {(t) => <ThemedToast toast={t} />}
    </Toaster>
  );
}
