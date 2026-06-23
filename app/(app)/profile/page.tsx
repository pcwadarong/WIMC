import { ProfileScreen } from "@/components/profile/ProfileScreen";
import { PageContainer } from "@/components/layout/PageContainer";
import { css } from "@/styled-system/css";

export default function ProfilePage() {
  return (
    <PageContainer>
      <h1 className={css({ textStyle: "displayMd", color: "text.primary", marginBottom: "5" })}>
        Profile
      </h1>
      <ProfileScreen />
    </PageContainer>
  );
}
