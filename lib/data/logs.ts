import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DailyLog } from "@/types";

/** ym = "YYYY-MM" 한 달치 착용 기록 */
export async function getMonthLogs(ym: string): Promise<DailyLog[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [y, m] = ym.split("-").map(Number);
  const start = `${ym}-01`;
  const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;

  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", start)
    .lt("date", nextMonth)
    .order("date", { ascending: true });

  return (data as DailyLog[]) ?? [];
}

/** 전체 착용 기록 (통계용) */
export async function getAllLogs(): Promise<DailyLog[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id);

  return (data as DailyLog[]) ?? [];
}

export async function getLog(date: string): Promise<DailyLog | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  return (data as DailyLog) ?? null;
}
