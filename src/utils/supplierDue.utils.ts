import dayjs from "dayjs";
import { TDueStatus } from "../types";

export const formatDate = (d?: string) => {
  if (!d) return "-";
  return dayjs(d).format("YYYY-MM-DD");
};

export const buildInvoiceNo = (createdAt?: string, index = 0) => {
  const base = createdAt
    ? new Date(createdAt).getTime().toString().slice(-5)
    : `${Date.now()}`.slice(-5);
  return `PUR-${base}${index}`;
};

// ✅ simple overdue: 7 days+
export const isOverdue = (dateStr: string) => {
  if (!dateStr || dateStr === "-") return false;
  return dayjs().diff(dayjs(dateStr), "day") > 7;
};

export const getStatus = (due: number, paid: number, dateStr: string): TDueStatus => {
  if (due <= 0) return "Paid";
  if (paid > 0 && due > 0) return isOverdue(dateStr) ? "Overdue" : "Partial";
  return isOverdue(dateStr) ? "Overdue" : "Due";
};
