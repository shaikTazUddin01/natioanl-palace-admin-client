"use client";

import { Button, DatePicker, Input, Select } from "antd";

const { Option } = Select;

type Props = {
  partyQuery: string;
  setPartyQuery: (v: string) => void;

  invoiceQuery: string;
  setInvoiceQuery: (v: string) => void;

  setDate: (v: string | null) => void;

  typeFilter: "SALE" | "PURCHASE" | undefined;
  setTypeFilter: (v: "SALE" | "PURCHASE" | undefined) => void;

  onReset: () => void;
};

export default function TotalAccountFilters({
  partyQuery,
  setPartyQuery,
  invoiceQuery,
  setInvoiceQuery,
  setDate,
  typeFilter,
  setTypeFilter,
  onReset,
}: Props) {
  return (
    <>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">
            Customer / Supplier
          </div>
          <Input
            placeholder="Search name"
            value={partyQuery}
            onChange={(e) => setPartyQuery(e.target.value)}
            allowClear
          />
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">Invoice No</div>
          <Input
            placeholder="Search invoice"
            value={invoiceQuery}
            onChange={(e) => setInvoiceQuery(e.target.value)}
            allowClear
          />
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">Date</div>
          <DatePicker
            className="w-full"
            onChange={(_, dateString) => setDate(dateString ? String(dateString) : null)}
            allowClear
          />
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">Type</div>
          <Select
            className="w-full"
            placeholder="Select type"
            value={typeFilter}
            onChange={(v) => setTypeFilter(v)}
            allowClear
          >
            <Option value="SALE">SALE</Option>
            <Option value="PURCHASE">PURCHASE</Option>
          </Select>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <Button danger onClick={onReset}>
          Reset
        </Button>
      </div>
    </>
  );
}
