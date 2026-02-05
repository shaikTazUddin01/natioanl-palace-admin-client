"use client";

import { TCustomerDueRow } from "@/src/types";
import { Modal } from "antd";

type Props = {
  open: boolean;
  onClose: () => void;
  selected: TCustomerDueRow | null;
};

export default function CustomerDueViewModal({ open, onClose, selected }: Props) {
  return (
    <Modal
      title="Due Details"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {selected ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Invoice</span>
            <span className="font-medium">{selected.invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Customer</span>
            <span className="font-medium">{selected.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-medium">{selected.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total</span>
            <span className="font-medium">
              ৳ {selected.totalAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Paid</span>
            <span className="font-medium">
              ৳ {selected.paidAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Due</span>
            <span className="font-medium text-red-600">
              ৳ {selected.dueAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className="font-medium">{selected.status}</span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
