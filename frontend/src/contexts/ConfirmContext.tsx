import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react';

export type ConfirmVariant = 'default' | 'danger' | 'warning';

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
};

export type AlertOptions = {
  title?: string;
  message: string;
  okLabel?: string;
};

type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void };
type PendingAlert = AlertOptions & { resolve: () => void };

type DialogApis = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
};

const DialogContext = createContext<DialogApis | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [pendingAlert, setPendingAlert] = useState<PendingAlert | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPendingConfirm({ ...options, resolve });
    });
  }, []);

  const alertFn = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setPendingAlert({ ...options, resolve });
    });
  }, []);

  const finishConfirm = useCallback((value: boolean) => {
    setPendingConfirm((current) => {
      if (current) {
        current.resolve(value);
      }
      return null;
    });
  }, []);

  const finishAlert = useCallback(() => {
    setPendingAlert((current) => {
      if (current) {
        current.resolve();
      }
      return null;
    });
  }, []);

  useEffect(() => {
    if (!pendingConfirm && !pendingAlert) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (pendingAlert) {
        finishAlert();
      } else {
        finishConfirm(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingConfirm, pendingAlert, finishConfirm, finishAlert]);

  const confirmVariant = pendingConfirm?.variant ?? 'default';
  const ConfirmIcon =
    confirmVariant === 'danger' ? Trash2 : confirmVariant === 'warning' ? AlertTriangle : CheckCircle2;

  const confirmModal =
    pendingConfirm &&
    createPortal(
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto overscroll-contain p-3 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 sm:pt-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <button
          type="button"
          aria-label="Close"
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          onClick={() => finishConfirm(false)}
        />
        <div className="relative z-[1] my-auto w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden glass-card border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.55)]">
          <div
            className={`shrink-0 rounded-t-2xl border-b border-white/5 px-4 py-3 sm:px-6 sm:py-4 ${
              confirmVariant === 'danger'
                ? 'bg-red-500/10 border-red-500/20'
                : confirmVariant === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-primary-500/10 border-primary-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  confirmVariant === 'danger'
                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                    : confirmVariant === 'warning'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : 'border-primary-500/30 bg-primary-500/10 text-primary-400'
                }`}
              >
                <ConfirmIcon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 id="confirm-dialog-title" className="text-lg font-bold text-white">
                  {pendingConfirm.title ?? 'Please confirm'}
                </h2>
              </div>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
            <p id="confirm-dialog-desc" className="text-sm leading-relaxed text-gray-400 break-words">
              {pendingConfirm.message}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => finishConfirm(false)}
                className="min-h-[44px] w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                {pendingConfirm.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => finishConfirm(true)}
                className={`min-h-[44px] w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors ${
                  confirmVariant === 'danger'
                    ? 'bg-red-600 hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                    : confirmVariant === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                      : 'bg-primary-600 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                }`}
              >
                {pendingConfirm.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  const alertModal =
    pendingAlert &&
    createPortal(
      <div
        className="fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto overscroll-contain p-3 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 sm:pt-6"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-desc"
      >
        <button
          type="button"
          aria-label="Dismiss"
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          onClick={finishAlert}
        />
        <div className="relative z-[1] my-auto w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden glass-card border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.55)]">
          <div className="shrink-0 rounded-t-2xl border-b border-sky-500/20 bg-sky-500/10 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
                <Info className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 id="alert-dialog-title" className="text-lg font-bold text-white">
                  {pendingAlert.title ?? 'Check your input'}
                </h2>
              </div>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
            <p id="alert-dialog-desc" className="text-sm leading-relaxed text-gray-400 break-words">
              {pendingAlert.message}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={finishAlert}
                className="min-h-[44px] w-full sm:w-auto rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              >
                {pendingAlert.okLabel ?? 'OK'}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  const value: DialogApis = { confirm, alert: alertFn };

  return (
    <DialogContext.Provider value={value}>
      {children}
      {confirmModal}
      {alertModal}
    </DialogContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return ctx.confirm;
}

export function useAlert() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useAlert must be used within ConfirmProvider');
  }
  return ctx.alert;
}
