export type PaymentStatus = "Paid" | "Partial" | "Due";

export type PurchaseRow = {
  key: string;
  _id?: string;

  invoiceNo: string;
  supplierName: string;
  productName: string;

  date: string;

  totalItems: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  note?: string;

  createdAt?: string;
};
