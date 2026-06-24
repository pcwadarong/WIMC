"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { deleteOutfit } from "@/app/(app)/outfits/actions";
import { css } from "@/styled-system/css";

export function DeleteOutfitButton({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show } = useToast();
  const confirm = useConfirm();
  const [pending, setPending] = useState(false);

  const onDelete = async () => {
    const ok = await confirm({
      title: "이 코디를 삭제할까요?",
      message: "삭제하면 되돌릴 수 없어요.",
      confirmText: "삭제",
      danger: true,
    });
    if (!ok) return;
    setPending(true);
    const result = await deleteOutfit(id);
    if ("error" in result) {
      show(result.error, "error");
      setPending(false);
      return;
    }
    show("삭제했어요.", "success");
    queryClient.invalidateQueries({ queryKey: ["outfits"] });
    router.push("/outfits");
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      aria-label="삭제"
      className={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "44px",
        height: "44px",
        color: "error",
        cursor: "pointer",
        _disabled: { opacity: 0.5, cursor: "not-allowed" },
      })}
    >
      <Trash2 size={20} />
    </button>
  );
}
