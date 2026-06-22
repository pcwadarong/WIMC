import { getProfile } from "@/lib/data/profile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { css } from "@/styled-system/css";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <PageContainer>
      <h1
        className={css({
          textStyle: "2xl",
          fontWeight: 700,
          color: "text.primary",
          marginBottom: "5",
        })}
      >
        마이
      </h1>
      <ProfileForm initial={profile} />
    </PageContainer>
  );
}
