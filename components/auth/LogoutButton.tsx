"use client";

import type { ReactNode } from "react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { signOut } from "@/app/(app)/actions";

/** 확인 모달 후 로그아웃. 행 스타일은 className으로, 내용은 children으로 받는다. */
export function LogoutButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const confirm = useConfirm();

  const onClick = async () => {
    const ok = await confirm({
      title: "로그아웃할까요?",
      confirmText: "로그아웃",
      danger: true,
    });
    if (ok) await signOut();
  };

  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}
