import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import "./globals.css";

export const metadata: Metadata = {
  title: "WIMC — 나만의 옷장",
  description: "개인 옷장 관리 · 코디 기록 · AI 스타일 추천",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WIMC",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F5F5F3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <ToastProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </ToastProvider>
        </QueryProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
