import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WIMC — What's In My Closet",
    short_name: "WIMC",
    description: "내 옷장 · 코디 기록 · 데일리 스타일 로그",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F5F5F3",
    theme_color: "#F5F5F3",
    orientation: "portrait",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
