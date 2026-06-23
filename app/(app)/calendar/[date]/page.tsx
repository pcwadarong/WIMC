import { notFound } from "next/navigation";
import { DayLogScreen } from "@/components/calendar/DayLogScreen";
import { TopBar } from "@/components/layout/TopBar";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  const title = `${m}월 ${d}일 (${weekday})`;

  return (
    <>
      <TopBar back title={title} />
      <DayLogScreen date={date} />
    </>
  );
}
