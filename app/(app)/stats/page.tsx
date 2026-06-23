import { StatsView } from "@/components/stats/StatsView";
import { PageContainer } from "@/components/layout/PageContainer";
import { css } from "@/styled-system/css";

export default function StatsPage() {
  return (
    <PageContainer>
      <h1 className={css({ textStyle: "displayMd", color: "text.primary", marginBottom: "5" })}>
        Insights
      </h1>
      <StatsView />
    </PageContainer>
  );
}
