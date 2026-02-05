"use client";

import { Button, DatePicker, Input, Select } from "antd";
import type { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

type Props = {
  search: string;
  setSearch: (v: string) => void;

  productFilter?: string;
  setProductFilter: (v: string | undefined) => void;

  productOptions: { label: string; value: string }[];

  dateRange: [Dayjs, Dayjs] | null;
  setDateRange: (v: [Dayjs, Dayjs] | null) => void;

  onReset: () => void;
};

export default function ProfitFilters({
  search,
  setSearch,
  productFilter,
  setProductFilter,
  productOptions,
  dateRange,
  setDateRange,
  onReset,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Input
        placeholder="Search invoice / customer / product"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
      />

      <Select
        allowClear
        showSearch
        placeholder="Filter by product"
        className="w-full"
        value={productFilter}
        onChange={(v) => setProductFilter(v)}
        options={productOptions}
        filterOption={(input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />

      <RangePicker
        className="w-full"
        value={dateRange as any}
        onChange={(v) => setDateRange((v as any) || null)}
      />

      <Button danger onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}