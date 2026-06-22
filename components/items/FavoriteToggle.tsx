"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/(app)/closet/actions";
import { css } from "@/styled-system/css";

export function FavoriteToggle({
  id,
  initial,
}: {
  id: string;
  initial: boolean;
}) {
  const router = useRouter();
  const [fav, setFav] = useState(initial);
  const [, startTransition] = useTransition();

  const onClick = () => {
    const next = !fav;
    setFav(next);
    startTransition(async () => {
      await toggleFavorite(id, next);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="즐겨찾기"
      aria-pressed={fav}
      className={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "44px",
        height: "44px",
        color: fav ? "error" : "text.tertiary",
        cursor: "pointer",
      })}
    >
      <Heart size={22} fill={fav ? "currentColor" : "none"} />
    </button>
  );
}
