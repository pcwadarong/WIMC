"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { css } from "@/styled-system/css";

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);

/** window.confirm 대체 — 스타일된 모달. `const confirm = useConfirm()` 후 `await confirm({...})`. */
export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (o) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setOpts(o);
      }),
    [],
  );

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opts && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => close(false)}
          className={css({
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6",
            bg: "scrim",
            animation: "fadeIn 0.12s ease",
          })}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={css({
              width: "100%",
              maxWidth: "320px",
              padding: "6",
              bg: "surface",
              borderRadius: "lg",
              boxShadow: "card",
            })}
          >
            <h2 className={css({ fontSize: "lg", fontWeight: 700, lineHeight: "1.4", color: "text.primary" })}>
              {opts.title}
            </h2>
            {opts.message && (
              <p className={css({ marginTop: "2", fontSize: "sm", lineHeight: "1.6", color: "text.secondary" })}>
                {opts.message}
              </p>
            )}
            <div className={css({ marginTop: "6", display: "flex", gap: "2" })}>
              <button type="button" onClick={() => close(false)} className={dialogBtn(false)}>
                {opts.cancelText ?? "취소"}
              </button>
              <button type="button" onClick={() => close(true)} className={dialogBtn(true)}>
                {opts.confirmText ?? "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

const dialogBtn = (primary: boolean) =>
  css({
    flex: 1,
    height: "46px",
    borderRadius: "md",
    borderWidth: "1.5px",
    borderStyle: "solid",
    fontSize: "sm",
    fontWeight: 600,
    cursor: "pointer",
    borderColor: "brown.dark",
    bg: primary ? "brown.dark" : "surface",
    color: primary ? "white" : "text.primary",
  });
