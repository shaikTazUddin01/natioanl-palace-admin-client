import dayjs from "dayjs";
import { TDueStatus } from "../types";


export const getStatus = (due: number, paid: number): TDueStatus => {
  if (due <= 0) return "Paid";
  if (paid > 0 && due > 0) return "Partial";
  return "Due";
};

export const isOverdue = (dateStr: string) => {
  // ✅ Simple rule: 7 days over = overdue
  const d = dayjs(dateStr);
  return dayjs().diff(d, "day") > 7;
};
