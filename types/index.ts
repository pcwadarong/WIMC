// ============================================
// WIMC 전체 타입 정의 (design.md §3 스키마 기준)
// ============================================

// ---------- 공통 ----------
export type UUID = string;
/** ISO date 문자열 (YYYY-MM-DD) */
export type DateString = string;
/** ISO timestamp 문자열 */
export type Timestamp = string;

export type Season = "all" | "summer_winter" | "summer" | "winter";

export const SEASON_LABELS: Record<Season, string> = {
  all: "사계절",
  summer_winter: "봄가을",
  summer: "여름",
  winter: "겨울",
};

export type ItemStatus = "owned" | "wishlist" | "ordered" | "sold";

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  owned: "보유중",
  wishlist: "구매고민",
  ordered: "배송중",
  sold: "판매함",
};

// ---------- 색상 ----------
export interface ColorValue {
  label: string; // 예: "버터"
  hex: string; // 예: "#F5E6C8"
}

// ---------- 사이즈 ----------
export interface SizeMeasurements {
  // 상의
  chest?: number; // 가슴둘레
  shoulder?: number; // 어깨너비
  length?: number; // 총장
  sleeve?: number; // 소매길이
  // 하의
  waist?: number; // 허리둘레
  hip?: number; // 힙둘레
  thigh?: number; // 허벅지둘레
  hem?: number; // 밑단둘레
  rise?: number; // 밑위
  inseam?: number; // 인심
  // 신발
  foot?: number; // 발 길이(mm)
}

export interface SizeInfo {
  label?: string; // S/M/L/XL 또는 커스텀
  numeric?: string; // 26/28...
  us?: string;
  uk?: string;
  jp?: string;
  eu?: string;
  measurements?: SizeMeasurements;
}

// ---------- 이미지 ----------
export interface ItemImage {
  url: string;
  is_primary: boolean;
  bg_removed: boolean;
}

// ---------- 프로필 ----------
export interface SizeGuideTop {
  label?: string;
  chest?: number;
  shoulder?: number;
}
export interface SizeGuideBottom {
  label?: string;
  waist?: number;
  hip?: number;
  thigh?: number;
  hem?: number;
  rise?: number;
}
export interface SizeGuideShoes {
  label?: string;
  us?: string;
  uk?: string;
  eu?: string;
}
export interface SizeGuide {
  top?: SizeGuideTop;
  bottom?: SizeGuideBottom;
  shoes?: SizeGuideShoes;
  preferred_fit?: string;
}

export interface UserLocation {
  label: string;
  lat: number;
  lon: number;
}

export interface ProfilePhotos {
  full?: string | null; // 전신
  face?: string | null; // 얼굴
}

export interface Profile {
  id: UUID;
  username: string | null;
  avatar_url: string | null;

  skin_tone: string | null;
  personal_color: string | null;
  body_type: string | null;
  style_keywords: string[] | null;
  preferred_colors: string[] | null;
  avoid_colors: string[] | null;
  notes: string | null;

  size_guide: SizeGuide | null;
  location: UserLocation | null;
  profile_photos: ProfilePhotos | null;

  created_at: Timestamp;
  updated_at: Timestamp;
}

// ---------- 카테고리 ----------
export interface Category {
  id: UUID;
  user_id: UUID;
  name: string;
  parent_id: UUID | null;
  sort_order: number;
  created_at: Timestamp;
}

/** 부모-자식이 결합된 트리 노드 (UI용) */
export interface CategoryNode extends Category {
  children: Category[];
}

// ---------- 아이템 ----------
export interface Item {
  id: UUID;
  user_id: UUID;
  category_id: UUID | null;

  name: string;
  brand: string | null;
  purchase_from: string | null;
  purchase_price: number | null;
  purchase_date: DateString | null;
  memo: string | null;

  colors: ColorValue[] | null;
  material: string | null;
  season: Season | null;
  size_info: SizeInfo | null;

  is_favorite: boolean;
  is_archived: boolean;
  status: ItemStatus;

  images: ItemImage[] | null;

  created_at: Timestamp;
  updated_at: Timestamp;
}

// ---------- 코디 ----------
export interface OutfitLayoutCell {
  item_id: UUID;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Outfit {
  id: UUID;
  user_id: UUID;
  name: string | null;
  memo: string | null;

  item_ids: UUID[] | null;
  layout: OutfitLayoutCell[] | null;

  cover_image: string | null;
  ai_generated: boolean;
  tags: string[] | null;

  created_at: Timestamp;
  updated_at: Timestamp;
}

// ---------- 날씨 ----------
export interface Weather {
  temp_min: number;
  temp_max: number;
  condition: string;
  location?: string;
}

// ---------- 착용 기록 ----------
export interface DailyLog {
  id: UUID;
  user_id: UUID;
  date: DateString;
  outfit_id: UUID | null;
  photo_url: string | null;
  weather: Weather | null;
  memo: string | null;
  created_at: Timestamp;
}

// ---------- 여행 ----------
export interface Trip {
  id: UUID;
  user_id: UUID;
  name: string;
  destination: string | null;
  start_date: DateString | null;
  end_date: DateString | null;
  cover_image: string | null;
  memo: string | null;
  created_at: Timestamp;
}

export interface TripDay {
  id: UUID;
  trip_id: UUID;
  date: DateString;
  outfit_id: UUID | null;
  weather: Weather | null;
  memo: string | null;
}

// ============================================
// API 페이로드 (design.md §7)
// ============================================
export interface AIRecommendRequest {
  weather: Weather;
  recent_logs: DailyLog[];
  user_profile: Profile;
  available_items: Item[];
}

export interface AIRecommendedOutfit {
  items: UUID[];
  reason: string;
}

export interface AIRecommendResponse {
  outfits: AIRecommendedOutfit[];
}

// ============================================
// Supabase Storage 버킷
// ============================================
export type StorageBucket = "items" | "outfits" | "logs" | "trips" | "avatars";
