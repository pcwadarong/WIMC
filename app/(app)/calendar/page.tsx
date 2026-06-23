import { Suspense } from "react";
import { CalendarView } from "@/components/calendar/CalendarView";
import { PageContainer } from "@/components/layout/PageContainer";

export default function CalendarPage() {
  return (
    <PageContainer>
      <Suspense>
        <CalendarView />
      </Suspense>
    </PageContainer>
  );
}
