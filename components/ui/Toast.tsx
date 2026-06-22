"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { css, cx } from "@/styled-system/css";

type ToastKind = "info" | "success" | "error";

interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  show: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const ICONS = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "info") => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className={css({
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "calc(var(--bottom-nav-height) + 20px)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "2",
          width: "100%",
          maxWidth: "app",
          paddingX: "5",
          pointerEvents: "none",
        })}
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              className={cx(
                css({
                  display: "flex",
                  alignItems: "center",
                  gap: "2",
                  padding: "3",
                  paddingRight: "2",
                  borderRadius: "md",
                  boxShadow: "modal",
                  bg: "brown.dark",
                  color: "white",
                  fontSize: "sm",
                  letterSpacing: "-0.02em",
                  pointerEvents: "auto",
                  animation: "toastIn 0.18s ease",
                }),
              )}
            >
              <Icon
                size={18}
                className={css({
                  flexShrink: 0,
                  color:
                    t.kind === "error"
                      ? "tint.error"
                      : t.kind === "success"
                        ? "tint.success"
                        : "white",
                })}
              />
              <span className={css({ flex: 1 })}>{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="닫기"
                className={css({
                  display: "flex",
                  padding: "1",
                  color: "whiteMuted",
                  cursor: "pointer",
                })}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
