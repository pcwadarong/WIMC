import type { UserLocation } from "@/types";

export interface City {
  name: string;
  lat: number;
  lon: number;
}
export interface CityGroup {
  region: string;
  cities: City[];
}

/** 위치 설정용 — 8도 + 제주 + 특별·광역시 (Open-Meteo 좌표) */
export const CITY_GROUPS: CityGroup[] = [
  {
    region: "특별·광역시",
    cities: [
      { name: "서울", lat: 37.5665, lon: 126.978 },
      { name: "부산", lat: 35.1796, lon: 129.0756 },
      { name: "인천", lat: 37.4563, lon: 126.7052 },
      { name: "대구", lat: 35.8714, lon: 128.6014 },
      { name: "대전", lat: 36.3504, lon: 127.3845 },
      { name: "광주", lat: 35.1595, lon: 126.8526 },
      { name: "울산", lat: 35.5384, lon: 129.3114 },
      { name: "세종", lat: 36.4801, lon: 127.289 },
    ],
  },
  {
    region: "경기",
    cities: [
      { name: "수원", lat: 37.2636, lon: 127.0286 },
      { name: "고양", lat: 37.6584, lon: 126.832 },
      { name: "용인", lat: 37.2411, lon: 127.1776 },
      { name: "성남", lat: 37.42, lon: 127.1265 },
      { name: "부천", lat: 37.5034, lon: 126.766 },
      { name: "안산", lat: 37.3219, lon: 126.8309 },
      { name: "남양주", lat: 37.636, lon: 127.2165 },
      { name: "평택", lat: 36.9921, lon: 127.1129 },
      { name: "의정부", lat: 37.7381, lon: 127.0337 },
    ],
  },
  {
    region: "강원",
    cities: [
      { name: "춘천", lat: 37.8813, lon: 127.7298 },
      { name: "원주", lat: 37.3422, lon: 127.9202 },
      { name: "강릉", lat: 37.7519, lon: 128.8761 },
      { name: "속초", lat: 38.207, lon: 128.5918 },
    ],
  },
  {
    region: "충북",
    cities: [
      { name: "청주", lat: 36.6424, lon: 127.489 },
      { name: "충주", lat: 36.991, lon: 127.9259 },
      { name: "제천", lat: 37.1326, lon: 128.191 },
    ],
  },
  {
    region: "충남",
    cities: [
      { name: "천안", lat: 36.8151, lon: 127.1139 },
      { name: "아산", lat: 36.7898, lon: 127.0018 },
      { name: "서산", lat: 36.7849, lon: 126.4503 },
      { name: "공주", lat: 36.4465, lon: 127.1189 },
    ],
  },
  {
    region: "전북",
    cities: [
      { name: "전주", lat: 35.8242, lon: 127.148 },
      { name: "익산", lat: 35.9483, lon: 126.9577 },
      { name: "군산", lat: 35.9676, lon: 126.7369 },
    ],
  },
  {
    region: "전남",
    cities: [
      { name: "여수", lat: 34.7604, lon: 127.6622 },
      { name: "순천", lat: 34.9506, lon: 127.4872 },
      { name: "목포", lat: 34.8118, lon: 126.3922 },
    ],
  },
  {
    region: "경북",
    cities: [
      { name: "포항", lat: 36.019, lon: 129.3435 },
      { name: "경주", lat: 35.8562, lon: 129.2247 },
      { name: "안동", lat: 36.5684, lon: 128.7294 },
      { name: "구미", lat: 36.1195, lon: 128.3446 },
    ],
  },
  {
    region: "경남",
    cities: [
      { name: "창원", lat: 35.228, lon: 128.6811 },
      { name: "진주", lat: 35.18, lon: 128.1076 },
      { name: "김해", lat: 35.2342, lon: 128.8894 },
      { name: "통영", lat: 34.8544, lon: 128.4331 },
    ],
  },
  {
    region: "제주",
    cities: [
      { name: "제주시", lat: 33.4996, lon: 126.5312 },
      { name: "서귀포", lat: 33.2541, lon: 126.5601 },
    ],
  },
];

export function cityLabel(region: string, name: string): string {
  return region === "특별·광역시" ? name : `${region} ${name}`;
}

export function findCity(label: string): UserLocation | null {
  for (const g of CITY_GROUPS) {
    for (const c of g.cities) {
      if (cityLabel(g.region, c.name) === label) {
        return { label, lat: c.lat, lon: c.lon };
      }
    }
  }
  return null;
}
