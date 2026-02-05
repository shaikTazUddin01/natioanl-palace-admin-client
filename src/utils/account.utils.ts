import dayjs from "dayjs";
import { AccountSummary, PaymentRow } from "../types";

export const getDate = (d?: any) => {
  if (!d) return "-";
  return dayjs(d).format("YYYY-MM-DD");
};

export const buildAllRows = (rawSales: any[], rawPurchases: any[]): PaymentRow[] => {
  const rows: PaymentRow[] = [];

  if (Array.isArray(rawSales)) {
    rawSales.forEach((s: any) => {
      const total = Number(s?.totalAmount ?? 0);
      const paid = Number(s?.paidAmount ?? 0);
      const due = Number(s?.dueAmount ?? Math.max(total - paid, 0));

      rows.push({
        key: s?._id || s?.id || s?.invoiceNo || crypto.randomUUID(),
        type: "SALE",
        partyName: s?.customerName ?? "Walk-in Customer",
        invoiceNo: s?.invoiceNo ?? "-",
        date: getDate(s?.date || s?.createdAt),
        method: s?.paymentMethod ?? null,
        amount: paid,
        due,
        note: s?.note ?? "",
      });
    });
  }

  if (Array.isArray(rawPurchases)) {
    rawPurchases.forEach((p: any) => {
      const total = Number(p?.totalAmount ?? 0);
      const paid = Number(p?.paidAmount ?? 0);
      const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));

      rows.push({
        key: p?._id || p?.id || p?.invoiceNo || crypto.randomUUID(),
        type: "PURCHASE",
        partyName: p?.supplierName ?? "-",
        invoiceNo: p?.invoiceNo ?? "-",
        date: getDate(p?.date || p?.createdAt),
        method: p?.paymentMethod ?? null,
        amount: paid,
        due,
        note: p?.note ?? "",
      });
    });
  }

  // ✅ sort latest first
  return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
};

export const buildSummary = (rawSales: any[], rawPurchases: any[]): AccountSummary => {
  let totalSalesPaid = 0;
  let totalSalesDue = 0;

  let totalPurchasePaid = 0;
  let totalPurchaseDue = 0;

  if (Array.isArray(rawSales)) {
    rawSales.forEach((s: any) => {
      const total = Number(s?.totalAmount ?? 0);
      const paid = Number(s?.paidAmount ?? 0);
      const due = Number(s?.dueAmount ?? Math.max(total - paid, 0));

      totalSalesPaid += paid;
      totalSalesDue += due;
    });
  }

  if (Array.isArray(rawPurchases)) {
    rawPurchases.forEach((p: any) => {
      const total = Number(p?.totalAmount ?? 0);
      const paid = Number(p?.paidAmount ?? 0);
      const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));

      totalPurchasePaid += paid;
      totalPurchaseDue += due;
    });
  }

  const cashInHand = totalSalesPaid - totalPurchasePaid;

  return {
    cashInHand,
    receivable: totalSalesDue,
    payable: totalPurchaseDue,
    totalSalesPaid,
    totalPurchasePaid,
  };
};
