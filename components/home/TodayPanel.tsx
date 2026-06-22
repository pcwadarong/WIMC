"use client";

import { useEffect, useState } from "react";
import { Cloud, Copy, Loader2, Sparkles } from "lucide-react";
import { ItemCard } from "@/components/items/ItemCard";
import { useToast } from "@/components/ui/Toast";
import {
  recommend,
  buildRecommendPrompt,
  type CategoryMap,
  type Recommendation,
  type TodayWeather,
} from "@/lib/recommend";
import type { Item, UserLocation } from "@/types";
import { css } from "@/styled-system/css";

// 위치 거부/실패 시 서울 좌표로 폴백
const FALLBACK = { lat: 37.5665, lon: 126.978 };

function getPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(FALLBACK);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(FALLBACK),
      { timeout: 5000, maximumAge: 1000 * 60 * 30 },
    );
  });
}

const card = css({
  marginTop: "10",
  padding: "5",
  bg: "surface",
  borderRadius: "md",
  boxShadow: "card",
});

export function TodayPanel({
  items,
  categoryMap,
  profileNote,
  location,
}: {
  items: Item[];
  categoryMap: CategoryMap;
  profileNote?: string;
  location?: UserLocation | null;
}) {
  const { show } = useToast();
  const [weather, setWeather] = useState<TodayWeather | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      // 저장된 위치가 있으면 사용, 없으면 GPS(거부 시 서울)
      const { lat, lon } = location
        ? { lat: location.lat, lon: location.lon }
        : await getPosition();
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error();
        const w: TodayWeather = await res.json();
        if (!active) return;
        setWeather(w);
        setRec(recommend(w, items, categoryMap));
      } catch {
        if (active) setWeather(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [items, categoryMap, location]);

  const copyPrompt = async () => {
    if (!weather) return;
    try {
      await navigator.clipboard.writeText(
        buildRecommendPrompt(weather, items, categoryMap, profileNote),
      );
      show("프롬프트를 복사했어요. 사용하는 AI에 붙여넣어 보세요.", "success");
    } catch {
      show("복사에 실패했어요.", "error");
    }
  };

  if (loading) {
    return (
      <div
        className={css({
          marginTop: "10",
          display: "flex",
          alignItems: "center",
          gap: "2",
          color: "text.tertiary",
          fontSize: "sm",
        })}
      >
        <Loader2 size={16} className={css({ animation: "spin 1s linear infinite" })} />
        오늘 날씨를 불러오는 중…
      </div>
    );
  }

  if (!weather) {
    return (
      <div className={card}>
        <p className={css({ fontSize: "sm", color: "text.secondary" })}>
          날씨를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className={card}>
      {/* 날씨 */}
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        })}
      >
        <div
          className={css({ display: "flex", alignItems: "center", gap: "2" })}
        >
          <Cloud size={20} className={css({ color: "brown.light" })} />
          <span className={css({ fontSize: "base", color: "text.primary" })}>
            {weather.condition} {weather.temp_now}°
          </span>
        </div>
        <span className={css({ fontSize: "sm", color: "text.tertiary" })}>
          {weather.temp_min}° / {weather.temp_max}° · 강수 {weather.precipitation_prob}%
        </span>
      </div>

      {rec && (
        <>
          <p
            className={css({
              marginTop: "4",
              textStyle: "lg",
              fontWeight: 700,
              color: "text.primary",
            })}
          >
            {rec.headline}
          </p>
          <ul
            className={css({
              marginTop: "2",
              display: "flex",
              flexDirection: "column",
              gap: "1",
            })}
          >
            {rec.tips.map((t, i) => (
              <li
                key={i}
                className={css({ fontSize: "sm", color: "text.secondary" })}
              >
                · {t}
              </li>
            ))}
          </ul>

          {rec.picks.length > 0 ? (
            <div
              className={css({
                marginTop: "5",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "3",
              })}
            >
              {rec.picks.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p
              className={css({
                marginTop: "4",
                fontSize: "sm",
                color: "text.tertiary",
              })}
            >
              옷장에 아이템을 추가하면 오늘 날씨에 맞춰 추천해드려요.
            </p>
          )}

          <button
            type="button"
            onClick={copyPrompt}
            className={css({
              marginTop: "5",
              display: "inline-flex",
              alignItems: "center",
              gap: "2",
              height: "40px",
              paddingX: "4",
              borderRadius: "full",
              bg: "surface.muted",
              color: "text.secondary",
              fontSize: "sm",
              fontWeight: 500,
              cursor: "pointer",
              _hover: { color: "text.primary" },
            })}
          >
            <Sparkles size={16} />
            AI 추천 프롬프트 복사
            <Copy size={14} />
          </button>
        </>
      )}
    </div>
  );
}
