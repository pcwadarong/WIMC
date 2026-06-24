"use client";

import { useEffect } from "react";
import { useConfirm } from "@/components/ui/ConfirmDialog";

/**
 * 저장하지 않은 변경(dirty)이 있을 때 페이지 이탈을 막는다.
 * - 새로고침/탭 닫기: 브라우저 기본 경고(beforeunload)
 * - 뒤로가기(브라우저/안드로이드/헤더 ←=router.back): 센티넬 히스토리 + 확인 모달
 */
export function useUnsavedGuard(dirty: boolean) {
  const confirm = useConfirm();

  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    // 뒤로가기 한 번을 흡수할 센티넬 항목을 쌓는다.
    window.history.pushState(null, "", window.location.href);
    let leaving = false;
    const onPop = async () => {
      if (leaving) return;
      const ok = await confirm({
        title: "나가시겠어요?",
        message: "저장하지 않은 변경사항은 사라져요.",
        confirmText: "나가기",
        cancelText: "계속 작성",
        danger: true,
      });
      if (ok) {
        leaving = true;
        window.removeEventListener("popstate", onPop);
        window.history.back();
      } else {
        // 머무름: 센티넬 다시 쌓기
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPop);
    };
  }, [dirty, confirm]);
}
