import { ClosetView } from "@/components/items/ClosetView";
import { PageContainer } from "@/components/layout/PageContainer";
import { Fab } from "@/components/ui/Fab";

export default function ClosetPage() {
  return (
    <PageContainer>
      <ClosetView />
      <Fab href="/closet/new" label="아이템 추가" />
    </PageContainer>
  );
}
