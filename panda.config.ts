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
          brown: {
            dark: { value: "#2C1A0E" }, // 키컬러, 주요 텍스트, 버튼
            mid: { value: "#6B3F2A" }, // 보조 액센트, 호버
            light: { value: "#C4956A" }, // 서브 액센트, 아이콘
          },
          bg: { value: "#FAFAF8" }, // 전체 배경
          surface: {
            DEFAULT: { value: "#FFFFFF" }, // 카드, 모달
            muted: { value: "#F4F2EE" }, // 필터칩, 인풋 배경
          },
          text: {
            primary: { value: "#1A1208" },
            secondary: { value: "#6B6560" },
            tertiary: { value: "#B0ABA6" },
          },
          border: {
            DEFAULT: { value: "#E8E4DE" },
            focus: { value: "#2C1A0E" },
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
        },
        fonts: {
          sans: {
            value:
              "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif",
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
          sm: { value: "5px" }, // 인풋, 작은 요소 (각진 톤)
          md: { value: "7px" }, // 카드, 이미지
          lg: { value: "12px" }, // 바텀시트
          full: { value: "9999px" }, // 버튼, 칩, 배지(필)
        },
        shadows: {
          // 미니멀 모노: 떠 있는 그림자 대신 1px 아웃라인으로 깊이 표현
          card: { value: "0 0 0 1px #E8E4DE" },
          modal: { value: "0 12px 40px rgba(44, 26, 14, 0.18)" },
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
      },
      // 타이포 텍스트 스타일 (자간 좁게 / 행간 넓게)
      textStyles: {
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
