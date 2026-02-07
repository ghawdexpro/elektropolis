"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (opts: { type: ToastType; message: string }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const TOAST_DURATION = 5000;

const icons: Record<ToastType, React.ReactNode> = {
  success: <Check className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

const styles: Record<ToastType, string> = {
  success:
    "border-emerald-200 bg-white text-charcoal [--toast-icon:theme(--color-emerald-600)]",
  error:
    "border-red-200 bg-white text-charcoal [--toast-icon:theme(--color-red-600)]",
  info: "border-sky-200 bg-white text-charcoal [--toast-icon:theme(--color-sky-600)]",
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(t.id), 200);
    }, TOAST_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [t.id, onDismiss]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => onDismiss(t.id), 200);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-black/5",
        "transition-all duration-200",
        exiting
          ? "translate-x-2 opacity-0"
          : "animate-[slideInRight_250ms_ease-out]",
        styles[t.type]
      )}
    >
      <span className="shrink-0 text-[var(--toast-icon)]">{icons[t.type]}</span>
      <p className="flex-1 text-sm font-medium">{t.message}</p>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-md p-1 text-muted hover:text-charcoal transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback(
    ({ type, message }: { type: ToastType; message: string }) => {
      const id = `toast-${++counterRef.current}`;
      setToasts((prev) => [...prev, { id, type, message }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="pointer-events-none fixed bottom-0 right-0 z-[60] flex flex-col gap-2 p-4 sm:p-6">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-80">
            <ToastItem toast={t} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
