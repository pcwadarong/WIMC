"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toggleOutfitFavorite } from "@/app/(app)/outfits/actions";
import { css } from "@/styled-system/css";

export function OutfitFavoriteToggle({
  id,
  initial,
}: {
  id: string;
  initial: boolean;
}) {
  const queryClient = useQueryClient();
  const [fav, setFav] = useState(initial);
  const [, startTransition] = useTransition();

  const onClick = () => {
    const next = !fav;
    setFav(next);
    startTransition(async () => {
      await toggleOutfitFavorite(id, next);
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
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
        color: fav ? "like" : "text.tertiary",
        cursor: "pointer",
      })}
    >
      <Heart size={22} fill={fav ? "currentColor" : "none"} />
    </button>
  );
}
