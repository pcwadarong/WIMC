import Link from "next/link";
import { Plus } from "lucide-react";
import { getOutfits } from "@/lib/data/outfits";
import { getItems } from "@/lib/data/items";
import { OutfitsList } from "@/components/outfits/OutfitsList";
import { PageContainer } from "@/components/layout/PageContainer";
import { indexById } from "@/lib/utils/item";
import { css } from "@/styled-system/css";

export default async function OutfitsPage() {
  const [outfits, items] = await Promise.all([getOutfits(), getItems()]);
  const itemsById = indexById(items);

  return (
    <PageContainer>
      <div
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "5",
        })}
      >
        <h1 className={css({ textStyle: "2xl", fontWeight: 700, color: "text.primary" })}>
          코디
        </h1>
        <Link
          href="/outfits/new"
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "1",
            height: "40px",
            paddingX: "4",
            borderRadius: "full",
            bg: "brown.dark",
            color: "white",
            fontSize: "sm",
            fontWeight: 600,
            _hover: { bg: "brown.mid" },
          })}
        >
          <Plus size={18} />
          만들기
        </Link>
      </div>

      {outfits.length === 0 ? (
        <div
          className={css({
            marginTop: "12",
            textAlign: "center",
            color: "text.tertiary",
            fontSize: "sm",
          })}
        >
          아직 만든 코디가 없어요. ‘만들기’로 옷을 조합해보세요.
        </div>
      ) : (
        <OutfitsList outfits={outfits} itemsById={itemsById} />
      )}
    </PageContainer>
  );
}
