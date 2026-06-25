import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { HomeView } from "@/components/home/HomeView";

export default function HomePage() {
  return (
    <PageContainer>
      <PageHeader title="What to wear?" size="lg" />
      <HomeView />
    </PageContainer>
  );
}
