"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { deleteItem } from "@/app/(app)/closet/actions";

export function DeleteItemButton({ id }: { id: string }) {
  const router = useRouter();
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
    router.push("/closet");
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      fullWidth
      onClick={onDelete}
      disabled={pending}
    >
      <Trash2 size={18} />
      {pending ? "삭제 중…" : "삭제"}
    </Button>
  );
}
