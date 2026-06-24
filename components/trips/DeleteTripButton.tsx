"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { deleteTrip } from "@/app/(app)/trips/actions";

export function DeleteTripButton({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show } = useToast();
  const confirm = useConfirm();
  const [pending, setPending] = useState(false);

  const onDelete = async () => {
    const ok = await confirm({
      title: "이 여행을 삭제할까요?",
      message: "삭제하면 되돌릴 수 없어요.",
      confirmText: "삭제",
      danger: true,
    });
    if (!ok) return;
    setPending(true);
    const result = await deleteTrip(id);
    if ("error" in result) {
      show(result.error, "error");
      setPending(false);
      return;
    }
    show("삭제했어요.", "success");
    queryClient.invalidateQueries({ queryKey: ["trips"] });
    router.push("/trips");
  };

  return (
    <Button type="button" variant="ghost" fullWidth onClick={onDelete} disabled={pending}>
      <Trash2 size={18} />
      {pending ? "삭제 중…" : "여행 삭제"}
    </Button>
  );
}
