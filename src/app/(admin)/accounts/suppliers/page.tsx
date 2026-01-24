"use client";

import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

/* ---------------- Demo Supplier Payable Data ---------------- */
type SupplierPayableRow = {
  key: string;
  supplierName: string;
  phone?: string;
  purchaseInvoiceNo: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  payableAmount: number; // same as due (what you still need to pay)
  status: "Paid" | "Partial" | "Payable" | "Overdue";
  note?: string;
};

const supplierPayableData: SupplierPayableRow[] = [
  {
    key: "1",
    supplierName: "Global Wholesale",
    phone: "01822-111111",
    purchaseInvoiceNo: "PUR-50009",
    date: "2026-01-12",
    totalAmount: 32000,
    paidAmount: 20000,
    payableAmount: 12000,
    status: "Partial",
    note: "Pay remaining next week",
  },
  {
    key: "2",
    supplierName: "City Distributors",
    phone: "01715-333333",
    purchaseInvoiceNo: "PUR-50010",
    date: "2026-01-18",
    totalAmount: 18000,
    paidAmount: 18000,
    payableAmount: 0,
    status: "Paid",
    note: "Paid in cash",
  },
  {
    key: "3",
    supplierName: "Rupa Suppliers",
    phone: "01911-444444",
    purchaseInvoiceNo: "PUR-50011",
    date: "2026-01-20",
    totalAmount: 54000,
    paidAmount: 0,
    payableAmount: 54000,
    status: "Payable",
    note: "Pending payment approval",
  },
  {
    key: "4",
    supplierName: "Bazar Trading",
    phone: "01610-555555",
    purchaseInvoiceNo: "PUR-50012",
    date: "2026-01-05",
    totalAmount: 25000,
    paidAmount: 5000,
    payableAmount: 20000,
    status: "Overdue",
    note: "Overdue payable - urgent follow up",
  },
];

/* ---------------- Table Columns ---------------- */
const columns: ColumnsType<SupplierPayableRow> = [
  {
    title: "Supplier",
    dataIndex: "supplierName",
    key: "supplierName",
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
    title: "Payable",
    dataIndex: "payableAmount",
    key: "payableAmount",
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
          : "blue"; // Payable

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
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Supplier Payable
          </h1>
          <p className="text-slate-500">
            Track supplier payables from purchase invoices
          </p>
        </div>

        <Button type="primary">Add Payable</Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={supplierPayableData}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Page;
