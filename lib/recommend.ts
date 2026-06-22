import type { Item, Season } from "@/types";

export interface TodayWeather {
  temp_now: number;
  temp_min: number;
  temp_max: number;
  condition: string;
  code: number;
  cloud_cover: number;
  precipitation_prob: number;
  evening_rain_prob: number;
  uv_index: number;
  pm2_5: number | null;
  pm10: number | null;
  aqi: number | null;
}

export interface CategoryInfo {
  name: string;
  parentName: string | null;
}
export type CategoryMap = Record<string, CategoryInfo>;

export interface Recommendation {
  headline: string;
  tips: string[];
  picks: Item[];
}

interface Band {
  max: number; // 이 값 미만이면 해당 밴드
  word: string;
  seasons: Season[];
  tip: string;
}

// 온도(최고기온) 구간 — 겨울도 세분화
const BANDS: Band[] = [
  { max: 0, word: "한겨울", seasons: ["winter", "all"], tip: "영하의 강추위 — 두꺼운 패딩에 목도리·장갑까지 챙기세요." },
  { max: 5, word: "추운", seasons: ["winter", "all"], tip: "칼바람 — 패딩이나 두꺼운 코트에 목도리를 더하세요." },
  { max: 10, word: "쌀쌀한", seasons: ["winter", "summer_winter", "all"], tip: "겉옷 필수 — 코트나 두꺼운 니트가 좋아요." },
  { max: 16, word: "선선한", seasons: ["summer_winter", "all"], tip: "가벼운 아우터나 가디건을 더해보세요." },
  { max: 22, word: "적당한", seasons: ["summer_winter", "all"], tip: "얇은 긴팔이나 셔츠 한 장이 적당해요." },
  { max: 27, word: "따뜻한", seasons: ["summer", "summer_winter", "all"], tip: "반팔이나 얇은 셔츠로 가볍게 입어도 좋아요." },
  { max: 99, word: "무더운", seasons: ["summer", "all"], tip: "반팔·민소매에 통기성 좋은 소재가 좋아요." },
];

function pm25Grade(pm: number | null): "좋음" | "보통" | "나쁨" | "매우나쁨" | null {
  if (pm == null) return null;
  if (pm <= 15) return "좋음";
  if (pm <= 35) return "보통";
  if (pm <= 75) return "나쁨";
  return "매우나쁨";
}

/**
 * 날씨 기반 규칙 추천 (LLM 미사용, $0).
 * 추후 동일 시그니처로 LLM 추천으로 교체 가능.
 */
export function recommend(
  weather: TodayWeather,
  items: Item[],
  categoryMap: CategoryMap,
): Recommendation {
  const tmax = weather.temp_max;
  const diff = weather.temp_max - weather.temp_min;
  const band = BANDS.find((b) => tmax < b.max) ?? BANDS[BANDS.length - 1];

  const rainyNow =
    weather.precipitation_prob >= 50 || /비|소나기|뇌우|이슬비|눈/.test(weather.condition);
  const eveningRain = weather.evening_rain_prob >= 50;
  const rainy = rainyNow || eveningRain;

  const headline = `${rainyNow ? "비 오는 " : ""}${band.word} 날 · ${weather.temp_min}~${weather.temp_max}°`;

  const tips: string[] = [band.tip];

  if (eveningRain && !rainyNow) {
    tips.push(`저녁에 비 소식(${weather.evening_rain_prob}%) — 우산과 겉옷을 챙기세요.`);
  } else if (rainyNow) {
    tips.push("비 소식 — 방수 신발이나 장화, 어두운 하의를 추천해요.");
  }

  if (diff >= 10) {
    tips.push(`일교차 ${diff}° — 걸치고 벗기 좋은 겉옷으로 조절하세요.`);
  }

  if (tmax >= 22 && weather.cloud_cover >= 70 && !rainyNow) {
    tips.push("흐리지만 따뜻해요 — 얇은 긴팔이나 셔츠가 적당해요.");
  }

  if (weather.uv_index >= 6) {
    tips.push(`자외선 강함(UV ${weather.uv_index}) — 모자·선글라스나 긴팔로 보호하세요.`);
  }

  const grade = pm25Grade(weather.pm2_5);
  if (grade === "나쁨" || grade === "매우나쁨") {
    tips.push(`미세먼지 ${grade} — 마스크를 챙기세요.`);
  }

  const seasonSet = new Set<Season>(band.seasons);
  const candidates = items.filter((i) => !i.season || seasonSet.has(i.season));
  const picks = pickByGroups(candidates, categoryMap, tmax, rainy);

  return { headline, tips, picks };
}

function pickByGroups(
  items: Item[],
  map: CategoryMap,
  tmax: number,
  rainy: boolean,
): Item[] {
  const byParent = (parent: string) =>
    items.filter(
      (i) => i.category_id && map[i.category_id]?.parentName === parent,
    );

  const picks: Item[] = [];
  const top = byParent("상의")[0];
  if (top) picks.push(top);
  const bottom = byParent("하의")[0];
  if (bottom) picks.push(bottom);
  if (tmax <= 16) {
    const outer = byParent("아우터")[0];
    if (outer) picks.push(outer);
  }
  const shoesList = byParent("신발");
  const shoes = rainy
    ? (shoesList.find((s) => map[s.category_id!]?.name === "부츠") ?? shoesList[0])
    : shoesList[0];
  if (shoes) picks.push(shoes);

  if (picks.length === 0) return items.slice(0, 4);
  return picks;
}

const SEASON_KR: Record<string, string> = {
  all: "사계절",
  summer_winter: "봄가을",
  summer: "여름",
  winter: "겨울",
};

/** 아이템 목록을 번호 매긴 텍스트 라인으로 */
export function itemLines(items: Item[], categoryMap: CategoryMap): string[] {
  return items.map((i, idx) => {
    const cat = i.category_id ? categoryMap[i.category_id] : undefined;
    const catLabel = cat
      ? `${cat.parentName ? cat.parentName + " > " : ""}${cat.name}`
      : "미분류";
    const colors = (i.colors ?? []).map((c) => c.label).join(", ");
    const bits = [catLabel];
    if (colors) bits.push(`색상: ${colors}`);
    if (i.material) bits.push(`소재: ${i.material}`);
    if (i.season) bits.push(`시즌: ${SEASON_KR[i.season] ?? i.season}`);
    return `${idx + 1}. ${i.name} (${bits.join(" / ")})`;
  });
}

/** 옷장에서 고른 옷들로 코디 추천 프롬프트 생성 */
export function buildClosetSelectionPrompt(
  items: Item[],
  categoryMap: CategoryMap,
  profileNote?: string,
): string {
  return [
    "아래는 내 옷장에서 고른 옷들이야. 이 옷들을 활용해 어울리는 코디 조합을 2~3개 추천해줘.",
    "각 조합에 사용한 옷(번호·이름)과 추천 이유, 간단한 스타일링 팁을 적어줘.",
    profileNote ? `\n[내 스타일]\n${profileNote}` : "",
    "",
    `[고른 옷] (${items.length}개)`,
    ...itemLines(items, categoryMap),
  ]
    .filter(Boolean)
    .join("\n");
}

/** B안: 내 구독 AI에 붙여넣을 프롬프트 생성 */
export function buildRecommendPrompt(
  weather: TodayWeather,
  items: Item[],
  categoryMap: CategoryMap,
  profileNote?: string,
): string {
  const lines = itemLines(items, categoryMap);

  const diff = weather.temp_max - weather.temp_min;
  const grade = pm25Grade(weather.pm2_5);
  const weatherLines = [
    `- ${weather.condition}, 현재 ${weather.temp_now}°, 최저 ${weather.temp_min}° / 최고 ${weather.temp_max}° (일교차 ${diff}°)`,
    `- 강수확률 낮 ${weather.precipitation_prob}% / 저녁 ${weather.evening_rain_prob}%`,
    `- 자외선 지수 ${weather.uv_index}`,
  ];
  if (grade) weatherLines.push(`- 미세먼지(PM2.5) ${grade}`);

  return [
    "당신은 나의 개인 스타일리스트입니다. 아래 '오늘 날씨', '나의 스타일 프로필', '내 옷장 목록'을 참고해 오늘 입을 코디를 추천해 주세요.",
    "",
    "[규칙]",
    "- 반드시 아래 '내 옷장 목록'에 있는 아이템들로만 코디를 구성하세요. 목록에 없는 옷은 제안하지 마세요.",
    "- 서로 다른 무드의 코디 3세트를 제안하세요.",
    "- 각 세트마다: (1) 사용한 아이템 번호와 이름, (2) 추천 이유, (3) 스타일링 팁(소매 걷기/턱인 등) 한 줄을 포함하세요.",
    "- 기온·강수·일교차·자외선·미세먼지를 고려하고, 가능하면 나의 퍼스널컬러·선호 스타일에 맞춰 주세요.",
    "",
    "[오늘 날씨]",
    ...weatherLines,
    "",
    "[나의 스타일 프로필]",
    profileNote ? `- ${profileNote}` : "- (아직 입력된 정보 없음)",
    "",
    `[내 옷장 목록] (총 ${items.length}개)`,
    ...(lines.length ? lines : ["- (등록된 옷이 없습니다)"]),
    "",
    "위 옷들 중에서 골라 3세트를 추천해 주세요.",
  ].join("\n");
}
