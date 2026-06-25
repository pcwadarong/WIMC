import { OutfitsList } from "@/components/outfits/OutfitsList";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default function OutfitsPage() {
  return (
    <PageContainer>
      <PageHeader title="Outfits" />
      <OutfitsList />
    </PageContainer>
  );
}
