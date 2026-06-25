import { TripForm } from "@/components/trips/TripForm";
import { TopBar } from "@/components/layout/TopBar";

export default function NewTripPage() {
  return (
    <>
      <TopBar back title="New Trip" />
      <TripForm />
    </>
  );
}
