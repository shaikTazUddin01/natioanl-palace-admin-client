"use client";

import { MonthlyProfitRow } from "@/src/types";
import { money } from "@/src/utils/money.utils";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";


export default function ProfitTable({
  data,
  loading,
}: {
  data: MonthlyProfitRow[];
  loading: boolean;
}) {
  const columns: ColumnsType<MonthlyProfitRow> = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      fixed: "left",
      render: (m) => (
        <strong>
          {m === "Unknown" ? "Unknown" : dayjs(`${m}-01`).format("MMM YYYY")}
        </strong>
      ),
    },
    {
      title: "Total Sold Qty",
      dataIndex: "totalSoldQty",
      key: "totalSoldQty",
      render: (v) => <Tag color="blue">{Number(v).toLocaleString()}</Tag>,
    },
    {
      title: "Revenue (Sell)",
      dataIndex: "revenue",
      key: "revenue",
      render: (v) => money(Number(v)),
    },
    {
      title: "COGS (Buy)",
      dataIndex: "cogs",
      key: "cogs",
      render: (v) => money(Number(v)),
    },
    {
      title: "Profit",
      dataIndex: "profit",
      key: "profit",
      render: (v) => (
        <Tag color={Number(v) >= 0 ? "green" : "red"}>
          {money(Number(v))}
        </Tag>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: 1000 }}
      pagination={{ pageSize: 10 }}
    />
  );
}