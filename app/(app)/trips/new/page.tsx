import { TripForm } from "@/components/trips/TripForm";
import { TopBar } from "@/components/layout/TopBar";

export default function NewTripPage() {
  return (
    <>
      <TopBar back title="여행 만들기" />
      <TripForm />
    </>
  );
}
