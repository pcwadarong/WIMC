"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { deleteItem } from "@/app/(app)/closet/actions";
import { css } from "@/styled-system/css";

export function DeleteItemButton({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show } = useToast();
  const [pending, setPending] = useState(false);

  const onDelete = async () => {
    if (!confirm("이 아이템을 삭제할까요?")) return;
    setPending(true);
    const result = await deleteItem(id);
    if ("error" in result) {
      show(result.error, "error");
      setPending(false);
      return;
    }
    show("삭제했어요.", "success");
    queryClient.invalidateQueries({ queryKey: ["items"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    router.push("/closet");
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
