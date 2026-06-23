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

const nav = css({
  position: "sticky",
  bottom: 0,
  zIndex: 50,
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  alignItems: "center",
  height: "var(--bottom-nav-height)",
  paddingBottom: "env(safe-area-inset-bottom)",
  bg: "surface",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "border",
});

const itemBase = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1",
  height: "100%",
  color: "text.tertiary",
  transition: "color 0.15s ease",
  _hover: { color: "text.secondary" },
});

const itemActive = css({ color: "brown.dark" });

const itemLabel = css({
  fontSize: "xs",
  letterSpacing: "-0.02em",
  fontWeight: 500,
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
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span className={itemLabel}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
