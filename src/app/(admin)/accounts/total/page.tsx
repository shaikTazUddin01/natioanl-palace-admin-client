"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Space, Button, Input, DatePicker, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Option } = Select;

/* ---------------- Demo Total Payment Data ---------------- */
type PaymentRow = {
  key: string;
  customerName: string;
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  paymentType: "Cash" | "Bank" | "Mobile Banking";
  amount: number;
  note?: string;
};

const paymentData: PaymentRow[] = [
  {
    key: "1",
    customerName: "Rahim Traders",
    invoiceNo: "SAL-260120-1023",
    date: "2026-01-20",
    paymentType: "Cash",
    amount: 5000,
    note: "Partial payment",
  },
  {
    key: "2",
    customerName: "Nabila Store",
    invoiceNo: "SAL-260122-1134",
    date: "2026-01-22",
    paymentType: "Mobile Banking",
    amount: 1000,
    note: "Bkash payment",
  },
  {
    key: "3",
    customerName: "Rahim Traders",
    invoiceNo: "SAL-260123-1401",
    date: "2026-01-23",
    paymentType: "Bank",
    amount: 4500,
    note: "Bank transfer",
  },
  {
    key: "4",
    customerName: "Walk-in Customer",
    invoiceNo: "SAL-260115-0977",
    date: "2026-01-15",
    paymentType: "Cash",
    amount: 18000,
    note: "Full paid",
  },
];

/* ---------------- Table Columns ---------------- */
const columns: ColumnsType<PaymentRow> = [
  {
    title: "Customer",
    dataIndex: "customerName",
    key: "customerName",
    fixed: "left",
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
    title: "Payment Type",
    dataIndex: "paymentType",
    key: "paymentType",
    render: (type) => {
      const color =
        type === "Cash" ? "green" : type === "Bank" ? "blue" : "purple";
      return <Tag color={color}>{type}</Tag>;
    },
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (amount) => `৳ ${amount}`,
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
        <Button size="small" icon={<DeleteOutlined />} danger />
      </Space>
    ),
  },
];

const Page = () => {
  const router = useRouter();

  const [customerQuery, setCustomerQuery] = useState<string>("");
  const [invoiceQuery, setInvoiceQuery] = useState<string>(""); // ✅ new
  const [date, setDate] = useState<string | null>(null); // YYYY-MM-DD
  const [paymentType, setPaymentType] = useState<string | undefined>(undefined);

  const filteredData = useMemo(() => {
    const customerQ = customerQuery.trim().toLowerCase();
    const invoiceQ = invoiceQuery.trim().toLowerCase();

    return paymentData.filter((row) => {
      const matchCustomer =
        !customerQ || row.customerName.toLowerCase().includes(customerQ);

      const matchInvoice =
        !invoiceQ || row.invoiceNo.toLowerCase().includes(invoiceQ);

      const matchDate = !date || row.date === date;

      const matchType = !paymentType || row.paymentType === paymentType;

      return matchCustomer && matchInvoice && matchDate && matchType;
    });
  }, [customerQuery, invoiceQuery, date, paymentType]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, row) => sum + (row.amount || 0), 0);
  }, [filteredData]);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Total Payment</h1>
          <p className="text-slate-500">
            Manage all customer payments with filters
          </p>
        </div>

        <Button type="primary" onClick={() => router.push("/payments/create")}>
          Add Payment
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">
            Customer Name
          </div>
          <Input
            placeholder="Search customer"
            value={customerQuery}
            onChange={(e) => setCustomerQuery(e.target.value)}
            allowClear
          />
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">
            Invoice No
          </div>
          <Input
            placeholder="Search invoice"
            value={invoiceQuery}
            onChange={(e) => setInvoiceQuery(e.target.value)}
            allowClear
          />
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">Date</div>
          <DatePicker
            className="w-full"
            onChange={(_, dateString) =>
              setDate(dateString ? String(dateString) : null)
            }
            allowClear
          />
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">
            Payment Type
          </div>
          <Select
            className="w-full"
            placeholder="Select type"
            value={paymentType}
            onChange={(v) => setPaymentType(v)}
            allowClear
          >
            <Option value="Cash">Cash</Option>
            <Option value="Bank">Bank</Option>
            <Option value="Mobile Banking">Mobile Banking</Option>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-slate-600 text-sm">
          Showing <span className="font-semibold">{filteredData.length}</span>{" "}
          record(s)
        </div>
        <div className="text-slate-800 font-semibold">Total: ৳ {totalAmount}</div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Page;
