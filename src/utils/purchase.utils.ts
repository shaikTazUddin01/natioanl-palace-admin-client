import { PaymentStatus } from "../types";


export const formatDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toISOString().slice(0, 10);
};

export const buildInvoiceNo = (createdAt?: string, index = 0) => {
  const base = createdAt
    ? new Date(createdAt).getTime().toString().slice(-5)
    : `${Date.now()}`.slice(-5);

  return `PUR-${base}${index}`;
};

export const getPaymentStatus = (
  due: number,
  paid: number,
  total: number
): PaymentStatus => {
  if (total <= 0) return "Due";
  if (due === 0 && paid >= total) return "Paid";
  if (paid > 0 && due > 0) return "Partial";
  return "Due";
};
