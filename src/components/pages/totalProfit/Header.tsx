"use client";

export default function ProfitHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-800">Monthly Profit</h1>
      <p className="text-slate-500">
        Profit = (Unit Sell Price − Buying Price) × Sold Quantity
      </p>
    </div>
  );
}