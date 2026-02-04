"use client";

import { Modal } from "antd";

type Props = {
  open: boolean;
  selected: any;
  onClose: () => void;
};

const PurchaseViewModal = ({ open, selected, onClose }: Props) => {
  return (
    <Modal
      title="Purchase Details"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {selected ? (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Supplier</span>
            <span className="font-medium">{selected?.supplierName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Product</span>
            <span className="font-medium">{selected?.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Quantity</span>
            <span className="font-medium">{selected?.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Purchase Price</span>
            <span className="font-medium">৳ {selected?.purchasePrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Paid</span>
            <span className="font-medium">৳ {selected?.paidAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Method</span>
            <span className="font-medium">{selected?.paymentMethod || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Note</span>
            <span className="font-medium">{selected?.note || "-"}</span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default PurchaseViewModal;
