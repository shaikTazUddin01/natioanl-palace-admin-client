"use client";

import { Button } from "antd";

type Props = {
  onOpenAdjust: () => void;
};

export default function StockHeader({ onOpenAdjust }: Props) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Current Stock</h1>
        <p className="text-slate-500">Monitor stock, movement and inventory value</p>
      </div>

      <Button type="primary" onClick={onOpenAdjust}>
        Stock Adjustment
      </Button>
    </div>
  );
}
