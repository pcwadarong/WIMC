"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, LayoutGrid, Calendar, User } from "lucide-react";
import { css, cx } from "@/styled-system/css";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  match: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  {
    href: "/closet",
    label: "Closet",
    icon: Shirt,
    match: (p) => p.startsWith("/closet"),
  },
  {
    href: "/outfits",
    label: "Outfits",
    icon: LayoutGrid,
    match: (p) => p.startsWith("/outfits"),
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
    match: (p) => p.startsWith("/calendar") || p.startsWith("/trips"),
  },
  {
    href: "/profile",
    label: "My",
    icon: User,
    match: (p) =>
      p.startsWith("/profile") || p.startsWith("/account") || p.startsWith("/stats"),
  },
];

// 떠 있는 섬(floating island) 네비 — 잉크 아웃라인 + 그림자
const nav = css({
  position: "fixed",
  bottom: "calc(env(safe-area-inset-bottom) + 14px)",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 50,
  width: "calc(min(100vw, token(sizes.app)) - 28px)",
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  alignItems: "center",
  gap: "1",
  height: "62px",
  paddingX: "1.5",
  bg: "surface",
  borderRadius: "full",
  boxShadow: "0 0 0 1.5px token(colors.brown.dark), 0 10px 28px rgba(0, 0, 0, 0.14)",
});

const itemBase = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5",
  height: "50px",
  borderRadius: "full",
  color: "text.tertiary",
  transition: "background 0.15s ease, color 0.15s ease",
  _hover: { color: "text.secondary" },
});

// 활성 = 잉크 채움 pill
const itemActive = css({
  bg: "brown.dark",
  color: "white",
  _hover: { color: "white" },
});

const itemLabel = css({
  fontSize: "10px",
  letterSpacing: "-0.02em",
  fontWeight: 600,
});

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={nav} aria-label="주요 메뉴">
      {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cx(itemBase, active && itemActive)}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
            <span className={itemLabel}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
