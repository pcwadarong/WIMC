"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { createTrip } from "@/app/(app)/trips/actions";
import { useUnsavedGuard } from "@/hooks/useUnsavedGuard";
import { css } from "@/styled-system/css";

export function TripForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show } = useToast();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useUnsavedGuard(dirty);

  const save = async () => {
    if (!name.trim()) {
      show("여행 이름을 입력해주세요.", "error");
      return;
    }
    if (start && end && end < start) {
      show("종료일이 시작일보다 빠를 수 없어요.", "error");
      return;
    }
    setSaving(true);
    const result = await createTrip({
      name: name.trim(),
      destination: destination.trim() || null,
      start_date: start || null,
      end_date: end || null,
      memo: memo.trim() || null,
    });
    if ("error" in result) {
      show(result.error, "error");
      setSaving(false);
      return;
    }
    show("여행을 만들었어요.", "success");
    setDirty(false);
    queryClient.invalidateQueries({ queryKey: ["trips"] });
    router.push(`/trips/${result.id}`);
  };

  return (
    <div onInput={() => setDirty(true)} className={css({ paddingX: "5", paddingBottom: "10", display: "flex", flexDirection: "column", gap: "4" })}>
      <Input id="name" label="여행 이름" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 도쿄 여행" />
      <Input id="dest" label="목적지" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="예: 도쿄" />
      <div className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2" })}>
        <Input id="start" type="date" label="시작일" value={start} onChange={(e) => setStart(e.target.value)} />
        <Input id="end" type="date" label="종료일" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
      <Textarea
        id="tripMemo"
        label="메모"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={3}
        placeholder="준비물, 일정 등"
      />
      <Button type="button" fullWidth onClick={save} disabled={saving} className={css({ marginTop: "2" })}>
        {saving ? <Loader2 size={18} className={css({ animation: "spin 1s linear infinite" })} /> : "여행 만들기"}
      </Button>
    </div>
  );
}
