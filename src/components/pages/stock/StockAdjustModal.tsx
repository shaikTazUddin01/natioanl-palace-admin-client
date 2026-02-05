"use client";

import { TStockRow } from "@/src/types";
import { Input, Modal, Select } from "antd";

type Props = {
  open: boolean;
  onClose: () => void;
  onOk: () => void;

  selected: TStockRow | null;

  adjustType: "IN" | "OUT";
  setAdjustType: (v: "IN" | "OUT") => void;

  adjustQty: number;
  setAdjustQty: (v: number) => void;
};

export default function StockAdjustModal({
  open,
  onClose,
  onOk,
  selected,
  adjustType,
  setAdjustType,
  adjustQty,
  setAdjustQty,
}: Props) {
  return (
    <Modal
      title="Stock Adjustment"
      open={open}
      onCancel={onClose}
      onOk={onOk}
      okText="Save"
      destroyOnHidden
    >
      {selected ? (
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            <div>
              <strong>{selected.productName}</strong> • <strong>{selected.sku}</strong>
            </div>
            <div>
              Current Stock:{" "}
              <strong className="text-blue-700">{selected.currentStock}</strong>
            </div>
          </div>

          <Select
            className="w-full"
            value={adjustType}
            onChange={(v) => setAdjustType(v)}
            options={[
              { label: "Stock In (Add)", value: "IN" },
              { label: "Stock Out (Remove)", value: "OUT" },
            ]}
          />

          <Input
            type="number"
            min={0}
            value={adjustQty}
            onChange={(e) => setAdjustQty(Number(e.target.value))}
            placeholder={adjustType === "IN" ? "Add Quantity" : "Remove Quantity"}
          />

          {adjustType === "OUT" && adjustQty > selected.currentStock ? (
            <div className="text-red-600 text-sm">
              Stock out cannot exceed current stock.
            </div>
          ) : null}
        </div>
      ) : (
        <div className="text-slate-500">Select a product from table to adjust stock.</div>
      )}
    </Modal>
  );
}
