"use client";

import { Button, DatePicker, Input } from "antd";

const { RangePicker } = DatePicker;

type Props = {
  customerFilter: string;
  setCustomerFilter: (v: string) => void;

  invoiceFilter: string;
  setInvoiceFilter: (v: string) => void;

  setDateRange: (v: any) => void;

  onReset: () => void;
};

export default function CustomerDueFilters({
  customerFilter,
  setCustomerFilter,
  invoiceFilter,
  setInvoiceFilter,
  setDateRange,
  onReset,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <RangePicker className="w-full" onChange={(val) => setDateRange(val)} />

      <Input
        placeholder="Customer Name"
        value={customerFilter}
        onChange={(e) => setCustomerFilter(e.target.value)}
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
