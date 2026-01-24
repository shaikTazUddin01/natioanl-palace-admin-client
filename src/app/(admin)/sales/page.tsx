"use client";

import { useState } from "react";
import { Table, Tag, Button, Space, Select, DatePicker, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

/* ---------------- Types ---------------- */

type Sale = {
  key: string;
  date: string;
  invoiceNo: string;
  customerName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod?: "CASH" | "BANK" | "BKASH" | "NAGAD";
  status: "PAID" | "DUE";
};

/* ---------------- Demo Data ---------------- */

const salesData: Sale[] = [
  {
    key: "1",
    date: "2025-01-12",
    invoiceNo: "INV-1001",
    customerName: "Walk-in Customer",
    productName: "iPhone 13",
    quantity: 1,
    totalAmount: 92000,
    paidAmount: 92000,
    dueAmount: 0,
    paymentMethod: "CASH",
    status: "PAID",
  },
  {
    key: "2",
    date: "2025-01-13",
    invoiceNo: "INV-1002",
    customerName: "Rahim Uddin",
    productName: "Redmi Note 12",
    quantity: 2,
    totalAmount: 49000,
    paidAmount: 30000,
    dueAmount: 19000,
    paymentMethod: "BKASH",
    status: "DUE",
  },
  {
    key: "3",
    date: "2025-01-15",
    invoiceNo: "INV-1003",
    customerName: "Karim Store",
    productName: "Samsung A15",
    quantity: 3,
    totalAmount: 55500,
    paidAmount: 0,
    dueAmount: 55500,
    status: "DUE",
  },
];

/* ---------------- Page ---------------- */

const SalesManagePage = () => {
  const [paymentFilter, setPaymentFilter] = useState<string | undefined>();
  const [customerFilter, setCustomerFilter] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);

  /* ---------------- Filter Logic ---------------- */

  const filteredData = salesData.filter((sale) => {
    const matchPayment =
      !paymentFilter ||
      (paymentFilter === "DUE" && sale.status === "DUE") ||
      sale.paymentMethod === paymentFilter;

    const matchCustomer = sale.customerName
      .toLowerCase()
      .includes(customerFilter.toLowerCase());

    const matchDate =
      !dateRange ||
      (dayjs(sale.date).isAfter(dateRange[0], "day") &&
        dayjs(sale.date).isBefore(dateRange[1], "day"));

    return matchPayment && matchCustomer && matchDate;
  });

  /* ---------------- Columns ---------------- */

  const columns: ColumnsType<Sale> = [
    { title: "Date", dataIndex: "date" },
    {
      title: "Invoice",
      dataIndex: "invoiceNo",
      render: (v) => <strong>{v}</strong>,
    },
    { title: "Customer", dataIndex: "customerName" },
    { title: "Product", dataIndex: "productName" },
    { title: "Qty", dataIndex: "quantity", align: "center" },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (v) => `৳ ${v.toLocaleString()}`,
    },
    {
      title: "Paid",
      dataIndex: "paidAmount",
      render: (v) => `৳ ${v.toLocaleString()}`,
    },
    {
      title: "Due",
      dataIndex: "dueAmount",
      render: (v) => (
        <span className={v > 0 ? "text-red-500 font-semibold" : ""}>
          ৳ {v.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
      render: (m) =>
        m ? <Tag color="blue">{m}</Tag> : <Tag color="red">DUE</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) =>
        s === "PAID" ? (
          <Tag color="green">PAID</Tag>
        ) : (
          <Tag color="volcano">DUE</Tag>
        ),
    },
    {
      title: "Action",
      render: () => (
        <Space>
          <Button size="small" type="primary">
            View
          </Button>
          <Button size="small">Invoice</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          All Sales Products
        </h1>
        <p className="text-slate-500">
          Filter sales by date, payment method, and customer
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <RangePicker
          className="w-full"
          onChange={(value) => setDateRange(value)}
        />

        <Select
          allowClear
          placeholder="Payment Method"
          className="w-full"
          onChange={(value) => setPaymentFilter(value)}
          options={[
            { label: "Cash", value: "CASH" },
            { label: "Bank", value: "BANK" },
            { label: "Bkash", value: "BKASH" },
            { label: "Nagad", value: "NAGAD" },
            { label: "Due", value: "DUE" },
          ]}
        />

        <Input
          placeholder="Customer Name"
          onChange={(e) => setCustomerFilter(e.target.value)}
        />

        <Button
          danger
          onClick={() => {
            setPaymentFilter(undefined);
            setCustomerFilter("");
            setDateRange(null);
          }}
        >
          Reset
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        bordered
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
};

export default SalesManagePage;
