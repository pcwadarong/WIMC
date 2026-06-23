import { ItemFormScreen } from "@/components/items/ItemFormScreen";
import { TopBar } from "@/components/layout/TopBar";
import { css } from "@/styled-system/css";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <TopBar title="아이템 수정" back />
      <div className={css({ paddingX: "5", paddingBottom: "10" })}>
        <ItemFormScreen itemId={id} />
      </div>
    </>
  );
}
