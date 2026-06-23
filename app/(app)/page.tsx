import { PageContainer } from "@/components/layout/PageContainer";
import { HomeView } from "@/components/home/HomeView";
import { css } from "@/styled-system/css";

export default function HomePage() {
  return (
    <PageContainer>
      <h1 className={css({ textStyle: "displayLg", color: "text.primary" })}>
        What to wear?
      </h1>
      <HomeView />
    </PageContainer>
  );
}
