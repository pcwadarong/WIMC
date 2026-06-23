import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const fraunces = readFileSync(join(process.cwd(), "app/_fonts/Fraunces-700-Italic.woff"));

// PWA/파비콘 — 그린→라벤더 그라디언트 + Fraunces 'WIMC'
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #CBE0BD, #D9CFEC)",
          borderRadius: 256,
          color: "#1A1A1A",
          fontFamily: "Fraunces",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 122,
        }}
      >
        WIMC
      </div>
    ),
    { ...size, fonts: [{ name: "Fraunces", data: fraunces, style: "italic", weight: 700 }] },
  );
}
