export type PaymentMethod = "CASH" | "BKASH" | "NAGAD" | "BANK";
export type TDueStatus = "Paid" | "Partial" | "Due" | "Overdue";

export type TSupplierDueRow = {
  key: string;
  _id?: string;

  supplierName: string;
  phone?: string;

  purchaseInvoiceNo: string;
  date: string;

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  status: TDueStatus;
  paymentMethod?: PaymentMethod | null;
  note?: string;

  createdAt?: string;
};
