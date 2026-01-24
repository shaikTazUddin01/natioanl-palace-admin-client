"use client";

import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

/* ---------------- Demo Supplier Due Data ---------------- */
type SupplierDueRow = {
  key: string;
  supplier: string;
  phone?: string;
  purchaseInvoiceNo: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: "Paid" | "Partial" | "Due" | "Overdue";
  note?: string;
};

const supplierDueData: SupplierDueRow[] = [
  {
    key: "1",
    supplier: "Global Wholesale",
    phone: "01822-111111",
    purchaseInvoiceNo: "PUR-50009",
    date: "2026-01-12",
    totalAmount: 32000,
    paidAmount: 20000,
    dueAmount: 12000,
    status: "Partial",
    note: "Will pay remaining next week",
  },
  {
    key: "2",
    supplier: "City Distributors",
    phone: "01715-333333",
    purchaseInvoiceNo: "PUR-50010",
    date: "2026-01-18",
    totalAmount: 18000,
    paidAmount: 18000,
    dueAmount: 0,
    status: "Paid",
    note: "Paid in cash",
  },
  {
    key: "3",
    supplier: "Rupa Suppliers",
    phone: "01911-444444",
    purchaseInvoiceNo: "PUR-50011",
    date: "2026-01-20",
    totalAmount: 54000,
    paidAmount: 0,
    dueAmount: 54000,
    status: "Due",
    note: "Invoice pending payment",
  },
  {
    key: "4",
    supplier: "Bazar Trading",
    phone: "01610-555555",
    purchaseInvoiceNo: "PUR-50012",
    date: "2026-01-05",
    totalAmount: 25000,
    paidAmount: 5000,
    dueAmount: 20000,
    status: "Overdue",
    note: "Overdue payment - follow up needed",
  },
];

/* ---------------- Table Columns ---------------- */
const columns: ColumnsType<SupplierDueRow> = [
  {
    title: "Supplier",
    dataIndex: "supplier",
    key: "supplier",
    fixed: "left",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
    render: (v) => v || "-",
  },
  {
    title: "Purchase Invoice",
    dataIndex: "purchaseInvoiceNo",
    key: "purchaseInvoiceNo",
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
          <h1 className="text-2xl font-bold text-slate-800">
            Supplier Due List
          </h1>
          <p className="text-slate-500">
            Track supplier outstanding dues from purchase invoices
          </p>
        </div>

        <Button
          type="primary"
          onClick={() => router.push("/supplier-due/create")}
        >
          Add Supplier Due
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={supplierDueData}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Page;
