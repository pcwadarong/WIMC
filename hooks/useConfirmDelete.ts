"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

type Result = { ok: true } | { error: string };

/** 확인 모달 → 삭제 액션 → 캐시 무효화 → 이동. 상세 페이지 공통 삭제 흐름. */
export function useConfirmDelete(opts: {
  title: string;
  action: () => Promise<Result>;
  invalidateKeys: string[][];
  redirect: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show } = useToast();
  const confirm = useConfirm();
  const [pending, setPending] = useState(false);

  const run = async () => {
    const ok = await confirm({
      title: opts.title,
      message: "삭제하면 되돌릴 수 없어요.",
      confirmText: "삭제",
      danger: true,
    });
    if (!ok) return;
    setPending(true);
    const result = await opts.action();
    if ("error" in result) {
      show(result.error, "error");
      setPending(false);
      return;
    }
    show("삭제했어요.", "success");
    opts.invalidateKeys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
    router.push(opts.redirect);
  };

  return { run, pending };
}
