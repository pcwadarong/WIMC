import { OutfitBuilderScreen } from "@/components/outfits/OutfitBuilderScreen";
import { TopBar } from "@/components/layout/TopBar";

export default function NewOutfitPage() {
  return (
    <>
      <TopBar title="New Outfit" back />
      <OutfitBuilderScreen />
    </>
  );
}
