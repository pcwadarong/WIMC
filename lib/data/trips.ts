import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import type { Trip, TripDay } from "@/types";

export async function getTrips(): Promise<Trip[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const { data } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  return (data as Trip[]) ?? [];
}

export async function getTrip(
  id: string,
): Promise<{ trip: Trip; days: TripDay[] } | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!trip) return null;

  const { data: days } = await supabase
    .from("trip_days")
    .select("*")
    .eq("trip_id", id)
    .order("date", { ascending: true });

  return { trip: trip as Trip, days: (days as TripDay[]) ?? [] };
}
