import { DayLogScreen } from "@/components/calendar/DayLogScreen";
import { TopBar } from "@/components/layout/TopBar";

export default function NewLogPage() {
  return (
    <>
      <TopBar back title="New Log" />
      <DayLogScreen pickDate />
    </>
  );
}
