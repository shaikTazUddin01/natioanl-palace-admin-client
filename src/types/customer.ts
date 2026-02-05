import { PaymentMethod, TDueStatus } from "./supplierDue";

export type TCustomerDueRow = {
  key: string;
  _id?: string;

  customerName: string;
  phone?: string;

  invoiceNo: string;
  date: string;

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  status: TDueStatus;
  paymentMethod?: PaymentMethod | null;

  note?: string;
};
