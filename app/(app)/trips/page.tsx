import { TripsList } from "@/components/trips/TripsList";
import { PageContainer } from "@/components/layout/PageContainer";
import { Fab } from "@/components/ui/Fab";
import { TopBar } from "@/components/layout/TopBar";

export default function TripsPage() {
  return (
    <>
      <TopBar back title="Trips" />
      <PageContainer>
        <TripsList />
        <Fab href="/trips/new" label="여행 추가" />
      </PageContainer>
    </>
  );
}
