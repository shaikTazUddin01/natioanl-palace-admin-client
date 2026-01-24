"use client";

import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

/* ---------------- Demo Purchase Data ---------------- */
type PurchaseRow = {
  key: string;
  invoiceNo: string;
  supplier: string;
  date: string;
  totalItems: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: "Paid" | "Partial" | "Due";
  note?: string;
};

const purchaseData: PurchaseRow[] = [
  {
    key: "1",
    invoiceNo: "PUR-50009",
    supplier: "Global Wholesale",
    date: "2026-01-12",
    totalItems: 8,
    totalAmount: 32000,
    paidAmount: 20000,
    dueAmount: 12000,
    paymentStatus: "Partial",
    note: "Payment due next week",
  },
  {
    key: "2",
    invoiceNo: "PUR-50010",
    supplier: "City Distributors",
    date: "2026-01-18",
    totalItems: 4,
    totalAmount: 18000,
    paidAmount: 18000,
    dueAmount: 0,
    paymentStatus: "Paid",
    note: "Paid in cash",
  },
  {
    key: "3",
    invoiceNo: "PUR-50011",
    supplier: "Rupa Suppliers",
    date: "2026-01-20",
    totalItems: 12,
    totalAmount: 54000,
    paidAmount: 0,
    dueAmount: 54000,
    paymentStatus: "Due",
    note: "Invoice pending approval",
  },
];

/* ---------------- Table Columns ---------------- */
const columns: ColumnsType<PurchaseRow> = [
  {
    title: "Invoice No",
    dataIndex: "invoiceNo",
    key: "invoiceNo",
    fixed: "left",
  },
  {
    title: "Supplier",
    dataIndex: "supplier",
    key: "supplier",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Items",
    dataIndex: "totalItems",
    key: "totalItems",
    render: (items) => <Tag>{items}</Tag>,
  },
  {
    title: "Total Amount",
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
    title: "Payment Status",
    dataIndex: "paymentStatus",
    key: "paymentStatus",
    render: (status) => {
      const color =
        status === "Paid" ? "green" : status === "Partial" ? "gold" : "red";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Note",
    dataIndex: "note",
    key: "note",
    ellipsis: true,
    render: (note) => note || "-",
  },
  {
    title: "Action",
    key: "action",
    fixed: "right",
    render: () => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} />
        <Button size="small" icon={<EditOutlined />} type="primary" />
        <Button size="small" icon={<DeleteOutlined />} danger />
      </Space>
    ),
  },
];

const Page = () => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Purchases</h1>
          <p className="text-slate-500">
            View, edit and manage your purchase invoices
          </p>
        </div>

        <Button type="primary" onClick={() => router.push("/purchases/create")}>
          Add Purchase
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={purchaseData}
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Page;
