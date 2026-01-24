"use client";

import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";

/* ---------------- Demo Customer Due Data ---------------- */
type CustomerDue = {
  key: string;
  customerName: string;
  phone?: string;
  invoiceNo: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: "Paid" | "Partial" | "Due" | "Overdue";
};

const customerDueData: CustomerDue[] = [
  {
    key: "1",
    customerName: "Rahim Traders",
    phone: "01711-000000",
    invoiceNo: "SAL-1001",
    date: "2026-01-15",
    totalAmount: 14500,
    paidAmount: 5000,
    dueAmount: 9500,
    status: "Partial",
  },
  {
    key: "2",
    customerName: "Nabila Store",
    phone: "01933-222222",
    invoiceNo: "SAL-1005",
    date: "2026-01-18",
    totalAmount: 2100,
    paidAmount: 0,
    dueAmount: 2100,
    status: "Due",
  },
  {
    key: "3",
    customerName: "Walk-in Customer",
    invoiceNo: "SAL-1008",
    date: "2026-01-20",
    totalAmount: 18000,
    paidAmount: 18000,
    dueAmount: 0,
    status: "Paid",
  },
  {
    key: "4",
    customerName: "Karim Store",
    phone: "01844-333333",
    invoiceNo: "SAL-0995",
    date: "2026-01-05",
    totalAmount: 32000,
    paidAmount: 12000,
    dueAmount: 20000,
    status: "Overdue",
  },
];

/* ---------------- Table Columns ---------------- */
const columns: ColumnsType<CustomerDue> = [
  {
    title: "Customer",
    dataIndex: "customerName",
    key: "customerName",
    fixed: "left",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
    render: (v) => v || "-",
  },
  {
    title: "Invoice No",
    dataIndex: "invoiceNo",
    key: "invoiceNo",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Total",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (amount) => `৳ ${amount}`,
  },
  {
    title: "Paid",
    dataIndex: "paidAmount",
    key: "paidAmount",
    render: (amount) => `৳ ${amount}`,
  },
  {
    title: "Due",
    dataIndex: "dueAmount",
    key: "dueAmount",
    render: (amount) => (
      <Tag color={amount > 0 ? "volcano" : "green"}>৳ {amount}</Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const color =
        status === "Paid"
          ? "green"
          : status === "Partial"
          ? "gold"
          : status === "Overdue"
          ? "red"
          : "blue";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Action",
    key: "action",
    fixed: "right",
    render: () => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} />
        <Button size="small" icon={<EditOutlined />} type="primary" />
      </Space>
    ),
  },
];

const Page = () => {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Customer Due Management
          </h1>
          <p className="text-slate-500">
            Track and manage outstanding customer payments
          </p>
        </div>

        <Button type="primary">Receive Payment</Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={customerDueData}
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Page;
