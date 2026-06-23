import { css, cx } from "@/styled-system/css";

const base = css({
  borderRadius: "md",
  bg: "surface.muted",
  animation: "pulse 1.4s ease-in-out infinite",
});

/** 데이터 로딩 중 표시하는 펄스 블록 */
export function Skeleton({
  className,
  ...rest
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(base, className)} aria-hidden {...rest} />;
}

/** 3열 이미지 그리드 스켈레톤 (옷장/코디 목록용) */
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className={css({
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "3",
      })}
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={css({ aspectRatio: "1" })} />
      ))}
    </div>
  );
}
