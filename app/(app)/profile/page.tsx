import { getProfile } from "@/lib/data/profile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { TopBar } from "@/components/layout/TopBar";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getProfile();

  return (
    <>
      <TopBar title="마이페이지" />
      <ProfileForm initial={profile} email={user?.email ?? ""} />
    </>
  );
}
