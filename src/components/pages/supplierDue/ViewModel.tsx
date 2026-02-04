"use client";

import { TSupplierDueRow } from "@/src/types";
import { Modal } from "antd";

type Props = {
  open: boolean;
  onClose: () => void;
  selected: TSupplierDueRow | null;
};

export default function SupplierDueViewModal({ open, onClose, selected }: Props) {
  return (
    <Modal title="Due Details" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      {selected ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Invoice</span>
            <span className="font-medium">{selected.purchaseInvoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Supplier</span>
            <span className="font-medium">{selected.supplierName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-medium">{selected.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total</span>
            <span className="font-medium">৳ {selected.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Paid</span>
            <span className="font-medium">৳ {selected.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Due</span>
            <span className="font-medium text-red-600">৳ {selected.dueAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className="font-medium">{selected.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Method</span>
            <span className="font-medium">{selected.paymentMethod || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Note</span>
            <span className="font-medium">{selected.note || "-"}</span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
