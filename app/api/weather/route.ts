import { NextRequest, NextResponse } from "next/server";

/** WMO weather code → 한글 상태 (Open-Meteo) */
function codeToCondition(code: number): string {
  if (code === 0) return "맑음";
  if (code <= 2) return "구름 조금";
  if (code === 3) return "흐림";
  if (code <= 48) return "안개";
  if (code <= 57) return "이슬비";
  if (code <= 67) return "비";
  if (code <= 77) return "눈";
  if (code <= 82) return "소나기";
  if (code <= 86) return "눈";
  if (code <= 99) return "뇌우";
  return "흐림";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "lat/lon이 필요합니다." }, { status: 400 });
  }

  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,cloud_cover` +
    `&hourly=precipitation_probability` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,uv_index_max` +
    `&timezone=auto&forecast_days=1`;

  const airUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
    `&current=pm2_5,pm10,european_aqi&timezone=auto`;

  try {
    const [fRes, aRes] = await Promise.all([
      fetch(forecastUrl, { next: { revalidate: 1800 } }),
      fetch(airUrl, { next: { revalidate: 1800 } }).catch(() => null),
    ]);
    if (!fRes.ok) {
      return NextResponse.json({ error: "날씨 조회 실패" }, { status: 502 });
    }
    const data = await fRes.json();
    const air = aRes && aRes.ok ? await aRes.json() : null;

    const code: number =
      data.current?.weather_code ?? data.daily?.weather_code?.[0] ?? 3;

    // 저녁(17~22시) 강수확률로 "저녁에 비" 판정
    const times: string[] = data.hourly?.time ?? [];
    const probs: number[] = data.hourly?.precipitation_probability ?? [];
    let eveningRain = 0;
    times.forEach((t, i) => {
      const h = Number(t.slice(11, 13));
      if (h >= 17 && h <= 22) eveningRain = Math.max(eveningRain, probs[i] ?? 0);
    });

    return NextResponse.json({
      temp_now: Math.round(
        data.current?.temperature_2m ?? data.daily.temperature_2m_max[0],
      ),
      temp_min: Math.round(data.daily.temperature_2m_min[0]),
      temp_max: Math.round(data.daily.temperature_2m_max[0]),
      condition: codeToCondition(code),
      code,
      cloud_cover: Math.round(data.current?.cloud_cover ?? 0),
      precipitation_prob: data.daily.precipitation_probability_max?.[0] ?? 0,
      evening_rain_prob: eveningRain,
      uv_index: Math.round(data.daily.uv_index_max?.[0] ?? 0),
      pm2_5: air?.current?.pm2_5 != null ? Math.round(air.current.pm2_5) : null,
      pm10: air?.current?.pm10 != null ? Math.round(air.current.pm10) : null,
      aqi: air?.current?.european_aqi ?? null,
    });
  } catch {
    return NextResponse.json({ error: "날씨 조회 실패" }, { status: 502 });
  }
}
