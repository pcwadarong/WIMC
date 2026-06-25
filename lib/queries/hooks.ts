"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/queries/fetcher";
import { qk } from "@/lib/queries/keys";
import type { ItemFilters } from "@/lib/data/items";
import type { Stats } from "@/lib/data/stats";
import type {
  Item,
  Outfit,
  DailyLog,
  CategoryNode,
  Profile,
  Trip,
  TripDay,
} from "@/types";

function itemsUrl(f?: ItemFilters) {
  const p = new URLSearchParams();
  if (f?.categoryIds?.length) p.set("category", f.categoryIds.join(","));
  if (f?.favorite) p.set("favorite", "1");
  if (f?.status) p.set("status", f.status);
  if (f?.search?.trim()) p.set("search", f.search.trim());
  const qs = p.toString();
  return `/api/items${qs ? `?${qs}` : ""}`;
}

export function useItems(filters?: ItemFilters, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: qk.items(filters),
    queryFn: () => fetchJson<Item[]>(itemsUrl(filters)),
    enabled: opts?.enabled ?? true,
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: qk.item(id),
    queryFn: () => fetchJson<Item | null>(`/api/items/${id}`),
    enabled: !!id,
  });
}

export function useItemWears(id: string) {
  return useQuery({
    queryKey: qk.itemWears(id),
    queryFn: () => fetchJson<{ total: number; month: number }>(`/api/items/${id}/wears`),
    enabled: !!id,
  });
}

export function useMonthItemSummary(ym: string) {
  return useQuery({
    queryKey: qk.monthItemSummary(ym),
    queryFn: () =>
      fetchJson<{ added: number; spend: number }>(
        `/api/items/month-summary?ym=${ym}`,
      ),
  });
}

export function useOutfits(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: qk.outfits(),
    queryFn: () => fetchJson<Outfit[]>("/api/outfits"),
    enabled: opts?.enabled ?? true,
  });
}

export function useOutfit(id: string) {
  return useQuery({
    queryKey: qk.outfit(id),
    queryFn: () => fetchJson<Outfit | null>(`/api/outfits/${id}`),
    enabled: !!id,
  });
}

export function useMonthLogs(ym: string) {
  return useQuery({
    queryKey: qk.monthLogs(ym),
    queryFn: () => fetchJson<DailyLog[]>(`/api/logs?ym=${ym}`),
  });
}

export function useLog(date: string) {
  return useQuery({
    queryKey: qk.log(date),
    queryFn: () => fetchJson<DailyLog | null>(`/api/logs/${date}`),
    enabled: !!date,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: qk.categories(),
    queryFn: () => fetchJson<CategoryNode[]>("/api/categories"),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: qk.profile(),
    queryFn: () => fetchJson<Profile | null>("/api/profile"),
  });
}

export function useTrips() {
  return useQuery({
    queryKey: qk.trips(),
    queryFn: () => fetchJson<Trip[]>("/api/trips"),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: qk.trip(id),
    queryFn: () =>
      fetchJson<{ trip: Trip; days: TripDay[] } | null>(`/api/trips/${id}`),
    enabled: !!id,
  });
}

export function useStats() {
  return useQuery({
    queryKey: qk.stats(),
    queryFn: () => fetchJson<Stats>("/api/stats"),
  });
}
