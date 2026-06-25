import { ProfileScreen } from "@/components/profile/ProfileScreen";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ProfilePage() {
  return (
    <PageContainer>
      <PageHeader title="Profile" />
      <ProfileScreen />
    </PageContainer>
  );
}
