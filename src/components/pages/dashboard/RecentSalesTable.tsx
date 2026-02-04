"use client";

import React from "react";
import { Card, Table, Empty, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DashboardComputed } from "@/src/app/(admin)/page";


const RecentSalesTable = ({ computed, loading }: { computed: DashboardComputed; loading: boolean }) => {
  const recentSalesColumns: ColumnsType<any> = [
    { title: "Date", dataIndex: "date", key: "date", width: 110 },
    { title: "Invoice", dataIndex: "invoiceNo", key: "invoiceNo", render: (v) => <strong>{v}</strong> },
    { title: "Customer", dataIndex: "customerName", key: "customerName" },
    { title: "Product", dataIndex: "productName", key: "productName" },
    { title: "Qty", dataIndex: "quantity", key: "quantity", align: "center", width: 70 },
    { title: "Total", dataIndex: "totalAmount", key: "totalAmount", render: (v) => `৳ ${Number(v).toLocaleString()}` },
    { title: "Paid", dataIndex: "paidAmount", key: "paidAmount", render: (v) => `৳ ${Number(v).toLocaleString()}` },
    {
      title: "Due",
      dataIndex: "dueAmount",
      key: "dueAmount",
      render: (v) => <Tag color={Number(v) > 0 ? "volcano" : "green"}>৳ {Number(v).toLocaleString()}</Tag>,
    },
  ];

  return (
    <Card title="Recent Sells" className="mb-6" variant='borderless' style={{ borderRadius: 14 }}>
      <Table
        columns={recentSalesColumns}
        dataSource={computed.recentSales}
        loading={loading}
        pagination={false}
        scroll={{ x: 1100 }}
        locale={{ emptyText: <Empty description="No sales found" /> }}
      />
    </Card>
  );
};

export default RecentSalesTable;
