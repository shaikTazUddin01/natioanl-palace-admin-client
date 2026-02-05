import { AccountSummary } from "@/src/types";

type Props = {
  summary: AccountSummary;
};

export default function TotalAccountSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-5 rounded-2xl bg-slate-50 border">
        <div className="text-sm text-slate-500">Cash In Hand</div>
        <div
          className={`text-2xl font-bold ${
            summary.cashInHand < 0 ? "text-red-600" : "text-slate-900"
          }`}
        >
          ৳ {Number(summary.cashInHand).toLocaleString()}
        </div>
        <div className="text-xs text-slate-500 mt-2">Sales Paid − Purchase Paid</div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 border">
        <div className="text-sm text-slate-500">Receivable (Customer Due)</div>
        <div className="text-2xl font-bold text-orange-600">
          ৳ {Number(summary.receivable).toLocaleString()}
        </div>
        <div className="text-xs text-slate-500 mt-2">Total Due from Sales</div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 border">
        <div className="text-sm text-slate-500">Payable (Supplier Due)</div>
        <div className="text-2xl font-bold text-blue-700">
          ৳ {Number(summary.payable).toLocaleString()}
        </div>
        <div className="text-xs text-slate-500 mt-2">Total Due from Purchases</div>
      </div>
    </div>
  );
}
