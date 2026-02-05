"use client";

import { PaymentRow } from "@/src/types";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

type Props = {
  columns: ColumnsType<PaymentRow>;
  data: PaymentRow[];
  loading: boolean;
  isError: boolean;
};

export default function TotalAccountTable({ columns, data, loading, isError }: Props) {
  if (isError) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600">
        Failed to load account data. Please try again.
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: 1100 }}
      pagination={{ pageSize: 10 }}
    />
  );
}
