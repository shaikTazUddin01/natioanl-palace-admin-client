"use client";

import { Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

/* ---------------- Demo Customer Due Data ---------------- */
type CustomerDueRow = {
  key: string;
  customerName: string;
  phone?: string;
  saleInvoiceNo: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: "Paid" | "Partial" | "Due" | "Overdue";
  note?: string;
};

const customerDueData: CustomerDueRow[] = [
  {
    key: "1",
    customerName: "Rahim Traders",
    phone: "01711-000000",
    saleInvoiceNo: "SAL-260120-1023",
    date: "2026-01-20",
    totalAmount: 14500,
    paidAmount: 5000,
    dueAmount: 9500,
    status: "Partial",
    note: "Customer promised to pay soon",
  },
  {
    key: "2",
    customerName: "Nabila Store",
    phone: "01933-222222",
    saleInvoiceNo: "SAL-260122-1134",
    date: "2026-01-22",
    totalAmount: 2100,
    paidAmount: 0,
    dueAmount: 2100,
    status: "Due",
    note: "New invoice",
  },
  {
    key: "3",
    customerName: "Walk-in Customer",
    saleInvoiceNo: "SAL-260115-0977",
    date: "2026-01-15",
    totalAmount: 18000,
    paidAmount: 18000,
    dueAmount: 0,
    status: "Paid",
    note: "Cash payment",
  },
  {
    key: "4",
    customerName: "Karim Store",
    phone: "01844-333333",
    saleInvoiceNo: "SAL-260110-0554",
    date: "2026-01-10",
    totalAmount: 32000,
    paidAmount: 12000,
    dueAmount: 20000,
    status: "Overdue",
    note: "Overdue – follow up required",
  },
];

/* ---------------- Table Columns ---------------- */
const columns: ColumnsType<CustomerDueRow> = [
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
    title: "Sale Invoice",
    dataIndex: "saleInvoiceNo",
    key: "saleInvoiceNo",
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
      <Tag color={amount > 0 ? "volcano" : "green"}>
        ৳ {amount}
      </Tag>
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
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Customer Due List
          </h1>
          <p className="text-slate-500">
            Track outstanding customer payments from sales
          </p>
        </div>

        <Button type="primary">Add Customer Due</Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={customerDueData}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Page;
