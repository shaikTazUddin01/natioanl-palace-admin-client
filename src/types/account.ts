export type PaymentRow = {
  key: string;
  type: "SALE" | "PURCHASE";
  partyName: string;
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  method?: string | null;
  amount: number;
  due: number;
  note?: string;
};

export type AccountSummary = {
  cashInHand: number;
  receivable: number;
  payable: number;
  totalSalesPaid: number;
  totalPurchasePaid: number;
};
