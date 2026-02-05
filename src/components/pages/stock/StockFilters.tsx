"use client";

import { StockStatus } from "@/src/types";
import { Button, Input, Select } from "antd";

type Props = {
  search: string;
  setSearch: (v: string) => void;

  categoryFilter: string | undefined;
  setCategoryFilter: (v: string | undefined) => void;

  statusFilter: StockStatus | undefined;
  setStatusFilter: (v: StockStatus | undefined) => void;

  categoryOptions: { label: string; value: string }[];

  onReset: () => void;
};

export default function StockFilters({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  categoryOptions,
  onReset,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Input
        placeholder="Search product / SKU / category"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Select
        allowClear
        placeholder="Category"
        className="w-full"
        value={categoryFilter}
        onChange={(v) => setCategoryFilter(v)}
        options={categoryOptions}
      />

      <Select
        allowClear
        placeholder="Stock Status"
        className="w-full"
        value={statusFilter}
        onChange={(v) => setStatusFilter(v)}
        options={[
          { label: "In Stock", value: "In Stock" },
          { label: "Low Stock", value: "Low Stock" },
          { label: "Out of Stock", value: "Out of Stock" },
        ]}
      />

      <Button danger onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
