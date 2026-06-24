import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // CSS reset
  preflight: true,

  // 스타일 선언을 탐색할 위치
  include: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],

  exclude: [],

  // `styled` 팩토리 사용을 위해 React 지정
  jsxFramework: "react",

  // 디자인 토큰 (design.md §2)
  theme: {
    extend: {
      tokens: {
        colors: {
          // 모노톤 잉크 (갈색 제거). 이름은 호환 위해 brown 유지 — 값은 중립 그레이.
          brown: {
            dark: { value: "#1A1A1A" }, // 잉크: 아웃라인/버튼/제목
            mid: { value: "#555555" }, // 호버/보조
            light: { value: "#9A9A9A" }, // 아이콘/서브
          },
          bg: { value: "#F5F5F3" }, // 전체 배경 (중립 오프화이트)
          surface: {
            DEFAULT: { value: "#FFFFFF" }, // 카드, 모달
            muted: { value: "#EFEFED" }, // 필터칩, 인풋 배경 (중립)
          },
          text: {
            primary: { value: "#1A1A1A" },
            secondary: { value: "#6A6A6A" },
            tertiary: { value: "#A6A6A6" },
          },
          border: {
            DEFAULT: { value: "#8A8A8A" }, // 기본 보더 = 다크 그레이(또렷)
            focus: { value: "#000000" }, // 포커스 = 블랙
          },
          error: { value: "#C0392B" },
          success: { value: "#27AE60" },
          // 이미지 위 오버레이/스크림 (하드코딩 rgba 대신 토큰 사용)
          overlay: { value: "rgba(0, 0, 0, 0.55)" }, // 이미지 위 배지 배경
          overlayStrong: { value: "rgba(0, 0, 0, 0.6)" },
          scrim: { value: "rgba(0, 0, 0, 0.4)" }, // 모달/시트 딤
          whiteMuted: { value: "rgba(255, 255, 255, 0.7)" },
          tint: {
            error: { value: "#FF9B8A" }, // 다크 배경 위 에러 아이콘
            success: { value: "#86E5A8" }, // 다크 배경 위 성공 아이콘
          },
          // 즐겨찾기(분홍)·위시리스트(자주) 강조색
          like: { value: "#E8568C" },
          wish: { value: "#7E57C2" },
          // 파스텔 액센트 (카테고리·활성칩·카드 포인트). 위에 brown.dark 텍스트.
          accent: {
            peach: { value: "#F0D2B4" },
            pink: { value: "#F1CEDA" },
            lavender: { value: "#D9CFEC" },
            blue: { value: "#C5D8EC" },
            green: { value: "#CBE0BD" },
            yellow: { value: "#F2DE82" }, // 활성 하이라이트(레퍼런스 옐로)
          },
        },
        fonts: {
          sans: {
            value:
              "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif",
          },
          // 에디토리얼 제목용 세리프 (Fraunces, globals.css에서 CDN 로드)
          serif: {
            value: "'Fraunces', 'Pretendard Variable', Georgia, serif",
          },
        },
        fontSizes: {
          xs: { value: "11px" },
          sm: { value: "13px" },
          base: { value: "15px" },
          lg: { value: "17px" },
          xl: { value: "20px" },
          "2xl": { value: "24px" },
          "3xl": { value: "30px" },
        },
        radii: {
          xs: { value: "2px" }, // 인풋/버튼 — 거의 각진(최소)
          sm: { value: "5px" },
          md: { value: "7px" }, // 카드, 이미지
          lg: { value: "12px" }, // 바텀시트
          full: { value: "9999px" }, // 칩, 배지(필)
        },
        shadows: {
          // 에디토리얼: 또렷한 잉크 아웃라인 — 종이/스티커 느낌(전 카드 통일)
          card: { value: "0 0 0 1.5px #1A1A1A" },
          outline: { value: "0 0 0 1.5px #1A1A1A" },
          modal: { value: "0 12px 40px rgba(0, 0, 0, 0.18)" },
        },
        sizes: {
          app: { value: "430px" }, // 모바일 퍼스트 최대 너비
        },
      },
      keyframes: {
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        toastIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        sheetUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      // 타이포 텍스트 스타일 (자간 좁게 / 행간 넓게)
      textStyles: {
        // 에디토리얼 세리프 제목 (Playfair Display italic)
        displayLg: {
          value: {
            fontFamily: "serif",
            fontStyle: "italic",
            fontWeight: "700",
            fontSize: "3xl",
            lineHeight: "1.1",
            letterSpacing: "-0.01em",
          },
        },
        displayMd: {
          value: {
            fontFamily: "serif",
            fontStyle: "italic",
            fontWeight: "700",
            fontSize: "2xl",
            lineHeight: "1.15",
            letterSpacing: "-0.01em",
          },
        },
        displaySm: {
          value: {
            fontFamily: "serif",
            fontStyle: "italic",
            fontWeight: "700",
            fontSize: "xl",
            lineHeight: "1.2",
            letterSpacing: "0",
          },
        },
        xs: {
          value: { fontSize: "xs", lineHeight: "1.6", letterSpacing: "-0.02em" },
        },
        sm: {
          value: { fontSize: "sm", lineHeight: "1.6", letterSpacing: "-0.02em" },
        },
        base: {
          value: {
            fontSize: "base",
            lineHeight: "1.7",
            letterSpacing: "-0.025em",
          },
        },
        lg: {
          value: { fontSize: "lg", lineHeight: "1.6", letterSpacing: "-0.03em" },
        },
        xl: {
          value: { fontSize: "xl", lineHeight: "1.4", letterSpacing: "-0.03em" },
        },
        "2xl": {
          value: {
            fontSize: "2xl",
            lineHeight: "1.3",
            letterSpacing: "-0.035em",
          },
        },
        "3xl": {
          value: {
            fontSize: "3xl",
            lineHeight: "1.2",
            letterSpacing: "-0.04em",
          },
        },
      },
    },
  },

  // 전역 기본 스타일
  globalCss: {
    "html, body": {
      bg: "bg",
      color: "text.primary",
      fontFamily: "sans",
      textStyle: "base",
      WebkitFontSmoothing: "antialiased",
    },
    "*": {
      WebkitTapHighlightColor: "transparent",
    },
  },

  outdir: "styled-system",
});
