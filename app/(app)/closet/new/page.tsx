import { ItemFormScreen } from "@/components/items/ItemFormScreen";
import { TopBar } from "@/components/layout/TopBar";
import { css } from "@/styled-system/css";

export default function NewItemPage() {
  return (
    <>
      <TopBar title="New Item" back />
      <div className={css({ paddingX: "5", paddingBottom: "10" })}>
        <ItemFormScreen />
      </div>
    </>
  );
}
