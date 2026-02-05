"use client";

import { TStockRow } from "@/src/types";
import { Modal } from "antd";

type Props = {
  open: boolean;
  onClose: () => void;
  selected: TStockRow | null;
};

export default function StockViewModal({ open, onClose, selected }: Props) {
  return (
    <Modal
      title="Stock Details"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {selected ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Product</span>
            <span className="font-medium">{selected.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">SKU</span>
            <span className="font-medium">{selected.sku}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Category</span>
            <span className="font-medium">{selected.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Stock In</span>
            <span className="font-medium">{selected.stockIn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Stock Out</span>
            <span className="font-medium">{selected.stockOut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Current Stock</span>
            <span className="font-medium text-blue-700">{selected.currentStock}</span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
