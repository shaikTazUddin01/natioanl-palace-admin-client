"use client";

import { RangePickerProps } from "antd/es/date-picker";
import { DatePicker, Select, Input, Button } from "antd";

const { RangePicker } = DatePicker;

type Props = {
  customerFilter: string;
  invoiceFilter: string;
  paymentFilter?: string;
  dateRange: any;
  setCustomerFilter: (v: string) => void;
  setInvoiceFilter: (v: string) => void;
  setPaymentFilter: (v?: string) => void;
  setDateRange: (v: any) => void;
};

export default function SalesFilters({
  customerFilter,
  invoiceFilter,
  paymentFilter,
  dateRange,
  setCustomerFilter,
  setInvoiceFilter,
  setPaymentFilter,
  setDateRange,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <RangePicker className="w-full" onChange={setDateRange} value={dateRange} />
      <Select
        allowClear
        placeholder="Payment Method"
        className="w-full"
        value={paymentFilter}
        onChange={setPaymentFilter}
        options={[
          { label: "Cash", value: "CASH" },
          { label: "Bank", value: "BANK" },
          { label: "Bkash", value: "BKASH" },
          { label: "Nagad", value: "NAGAD" },
          { label: "Due", value: "DUE" },
        ]}
      />
      <Input placeholder="Customer Name" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} />
      <Input placeholder="Invoice No" value={invoiceFilter} onChange={(e) => setInvoiceFilter(e.target.value)} />
      <Button danger onClick={() => { setPaymentFilter(undefined); setCustomerFilter(""); setInvoiceFilter(""); setDateRange(null); }}>
        Reset
      </Button>
    </div>
  );
}
