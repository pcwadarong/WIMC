import { OutfitsList } from "@/components/outfits/OutfitsList";
import { PageContainer } from "@/components/layout/PageContainer";
import { Fab } from "@/components/ui/Fab";
import { css } from "@/styled-system/css";

export default function OutfitsPage() {
  return (
    <PageContainer>
      <h1 className={css({ textStyle: "displayMd", color: "text.primary", marginBottom: "5" })}>
        Outfits
      </h1>
      <OutfitsList />
      <Fab href="/outfits/new" label="코디 만들기" />
    </PageContainer>
  );
}
