import { PageContainer } from "@/components/layout/PageContainer";
import { css } from "@/styled-system/css";

/** 아직 구현 전인 페이지용 임시 화면 */
export function Placeholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <PageContainer>
      <h1
        className={css({
          textStyle: "2xl",
          fontWeight: 700,
          color: "text.primary",
        })}
      >
        {title}
      </h1>
      <p
        className={css({
          marginTop: "3",
          textStyle: "base",
          color: "text.secondary",
        })}
      >
        {description ?? "준비 중입니다."}
      </p>
    </PageContainer>
  );
}
