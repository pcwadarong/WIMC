"use client";

import { ProfileForm } from "@/components/profile/ProfileForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProfile } from "@/lib/queries/hooks";
import { css } from "@/styled-system/css";

export function ProfileScreen() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
        <Skeleton className={css({ height: "180px" })} />
        <Skeleton className={css({ height: "140px" })} />
      </div>
    );
  }

  return <ProfileForm initial={profile ?? null} />;
}
