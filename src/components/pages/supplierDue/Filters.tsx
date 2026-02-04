"use client";

import { Button, DatePicker, Input } from "antd";

const { RangePicker } = DatePicker;

type Props = {
  supplierFilter: string;
  setSupplierFilter: (v: string) => void;

  invoiceFilter: string;
  setInvoiceFilter: (v: string) => void;

  dateRange: any;
  setDateRange: (v: any) => void;

  onReset: () => void;
};

export default function SupplierDueFilters({
  supplierFilter,
  setSupplierFilter,
  invoiceFilter,
  setInvoiceFilter,
  dateRange,
  setDateRange,
  onReset,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <RangePicker className="w-full" value={dateRange} onChange={(val) => setDateRange(val)} />

      <Input
        placeholder="Supplier Name"
        value={supplierFilter}
        onChange={(e) => setSupplierFilter(e.target.value)}
      />

      <Input
        placeholder="Invoice No"
        value={invoiceFilter}
        onChange={(e) => setInvoiceFilter(e.target.value)}
      />

      <Button danger onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
