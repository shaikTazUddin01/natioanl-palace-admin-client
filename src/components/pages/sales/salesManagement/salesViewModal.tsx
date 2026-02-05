"use client";
import { TSaleRow } from "@/src/types";
import { Modal } from "antd";


type Props = {
  open: boolean;
  onClose: () => void;
  sale: TSaleRow | null;
};

export default function SaleViewModal({ open, onClose, sale }: Props) {
  if (!sale) return null;

  return (
    <Modal title="Sale Details" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      <div className="space-y-2 text-sm">
        {Object.entries({
          Invoice: sale.invoiceNo,
          Date: sale.date,
          Customer: sale.customerName,
          Product: sale.productName,
          Quantity: sale.quantity,
          Total: `৳ ${sale.totalAmount}`,
          Paid: `৳ ${sale.paidAmount}`,
          Due: `৳ ${sale.dueAmount}`,
          Method: sale.paymentMethod || "DUE",
          Note: sale.note || "-",
        }).map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-slate-500">{label}</span>
            <span className={`font-medium ${label === "Due" ? "text-red-600" : ""}`}>{value}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
