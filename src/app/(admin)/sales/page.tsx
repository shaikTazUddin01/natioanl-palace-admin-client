"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Button, Space, Select, DatePicker, Input, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import Swal from "sweetalert2";
import { toast } from "sonner";

import {
  useGetSalesQuery,
  useDeleteSaleMutation,
} from "@/src/redux/features/sales/salesApi";

const { RangePicker } = DatePicker;

/* ---------------- Types ---------------- */

type TSaleRow = {
  key: string;
  _id?: string;

  date: string;
  invoiceNo: string;

  customerName: string;
  productName: string;

  quantity: number;

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  paymentMethod?: "CASH" | "BANK" | "BKASH" | "NAGAD" | null;
  status: "PAID" | "DUE" | "PARTIAL";
  note?: string;
};

const calcStatus = (total: number, paid: number) => {
  const due = total - paid;
  if (due <= 0) return "PAID";
  if (paid > 0 && due > 0) return "PARTIAL";
  return "DUE";
};

const SalesManagePage = () => {
  const { data, isLoading, isFetching, isError } = useGetSalesQuery(undefined);
  const [deleteSale] = useDeleteSaleMutation();

  const [paymentFilter, setPaymentFilter] = useState<string | undefined>();
  const [customerFilter, setCustomerFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<TSaleRow | null>(null);

  // ✅ adjust based on your API response
  const rawSales = data?.data ?? data ?? [];

  const salesData: TSaleRow[] = useMemo(() => {
    if (!Array.isArray(rawSales)) return [];

    return rawSales.map((s: any) => {
      const qty = Number(s?.quantity ?? 0);
      const unitPrice = Number(s?.unitPrice ?? 0);
      const total = Number(s?.totalAmount ?? qty * unitPrice);
      const paid = Number(s?.paidAmount ?? 0);
      const due = Number(s?.dueAmount ?? Math.max(total - paid, 0));

      return {
        key: s?._id || s?.id || s?.invoiceNo || crypto.randomUUID(),
        _id: s?._id || s?.id,

        date: s?.date
          ? dayjs(s.date).format("YYYY-MM-DD")
          : s?.createdAt
          ? dayjs(s.createdAt).format("YYYY-MM-DD")
          : "-",

        invoiceNo: s?.invoiceNo ?? "-",

        customerName: s?.customerName ?? "-",
        productName: s?.productName ?? "-",

        quantity: qty,

        totalAmount: total,
        paidAmount: paid,
        dueAmount: due,

        paymentMethod: s?.paymentMethod ?? null,
        status: (s?.paymentStatus ?? calcStatus(total, paid)) as any,
        note: s?.note ?? "",
      };
    });
  }, [rawSales]);

  /* ---------------- Filter Logic ---------------- */
  const filteredData = useMemo(() => {
    return salesData.filter((sale) => {
      // ✅ Payment filter: DUE means status DUE/PARTIAL (optional)
      const matchPayment =
        !paymentFilter ||
        (paymentFilter === "DUE" ? sale.dueAmount > 0 : sale.paymentMethod === paymentFilter);

      const matchCustomer = sale.customerName
        .toLowerCase()
        .includes(customerFilter.toLowerCase());

      const matchInvoice = sale.invoiceNo
        .toLowerCase()
        .includes(invoiceFilter.toLowerCase());

      const matchDate =
        !dateRange ||
        (dayjs(sale.date).isSameOrAfter(dateRange[0], "day") &&
          dayjs(sale.date).isSameOrBefore(dateRange[1], "day"));

      return matchPayment && matchCustomer && matchInvoice && matchDate;
    });
  }, [salesData, paymentFilter, customerFilter, invoiceFilter, dateRange]);

  /* ---------------- Actions ---------------- */
  const handleView = (row: TSaleRow) => {
    setSelected(row);
    setViewOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This sale will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading("Deleting sale...");

    try {
      const res = await deleteSale(id).unwrap();
      if (res?.success) toast.success(res?.message || "Deleted successfully", { id: toastId });
      else toast.error(res?.message || "Failed to delete", { id: toastId });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete", { id: toastId });
    }
  };

const handleInvoice = (row: TSaleRow) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Invoice ${row.invoiceNo}</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          background: #f5f6fa;
          padding: 30px;
        }
        .invoice {
          max-width: 800px;
          margin: auto;
          background: #fff;
          padding: 30px;
          border-radius: 8px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #eee;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .company h2 {
          margin: 0;
          color: #390dff;
        }
        .company p {
          margin: 4px 0;
          font-size: 13px;
          color: #555;
        }
        .invoice-info {
          text-align: right;
          font-size: 14px;
        }
        .section {
          margin-bottom: 24px;
        }
        .section h4 {
          margin-bottom: 8px;
          font-size: 15px;
          color: #333;
        }
        .bill-to p {
          margin: 4px 0;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        table thead {
          background: #f0f2ff;
        }
        table th,
        table td {
          padding: 10px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
          text-align: left;
        }
        table th {
          font-weight: 600;
        }
        .text-right {
          text-align: right;
        }
        .summary {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
        .summary table {
          width: 300px;
        }
        .summary td {
          padding: 8px;
        }
        .summary tr:last-child td {
          font-weight: bold;
          border-top: 2px solid #000;
        }
        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
        }
        .paid {
          background: #22c55e;
        }
        .due {
          background: #ef4444;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
        .print-btn {
          margin-top: 20px;
          text-align: center;
        }
        .print-btn button {
          background: #390dff;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }
        @media print {
          body {
            background: #fff;
            padding: 0;
          }
          .print-btn {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <!-- Header -->
        <div class="header">
          <div class="company">
            <h2>National Palace</h2>
            <p>Dhaka, Bangladesh</p>
            <p>Phone: 01XXXXXXXXX</p>
          </div>
          <div class="invoice-info">
            <p><strong>Invoice:</strong> ${row.invoiceNo}</p>
            <p><strong>Date:</strong> ${row.date}</p>
            <span class="status ${row.dueAmount > 0 ? "due" : "paid"}">
              ${row.dueAmount > 0 ? "DUE" : "PAID"}
            </span>
          </div>
        </div>

        <!-- Customer -->
        <div class="section bill-to">
          <h4>Bill To</h4>
          <p><strong>${row.customerName}</strong></p>
        </div>

        <!-- Items -->
        <div class="section">
          <h4>Product Details</h4>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${row.productName}</td>
                <td class="text-right">${row.quantity}</td>
                <td class="text-right">৳ ${row.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div class="summary">
          <table>
            <tr>
              <td>Total</td>
              <td class="text-right">৳ ${row.totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Paid</td>
              <td class="text-right">৳ ${row.paidAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Due</td>
              <td class="text-right">৳ ${row.dueAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div class="footer">
          Thank you for your business 🙏
        </div>

        <!-- Print -->
        <div class="print-btn">
          <button onclick="window.print()">Print Invoice</button>
        </div>
      </div>
    </body>
  </html>
  `;

  const w = window.open("", "_blank");
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
};


  /* ---------------- Columns ---------------- */
  const columns: ColumnsType<TSaleRow> = [
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
      render: (v) => `৳ ${Number(v).toLocaleString()}`,
    },
    {
      title: "Paid",
      dataIndex: "paidAmount",
      render: (v) => `৳ ${Number(v).toLocaleString()}`,
    },
    {
      title: "Due",
      dataIndex: "dueAmount",
      render: (v) => (
        <span className={Number(v) > 0 ? "text-red-500 font-semibold" : ""}>
          ৳ {Number(v).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
      render: (m) => (m ? <Tag color="blue">{m}</Tag> : <Tag color="red">DUE</Tag>),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) =>
        s === "PAID" ? (
          <Tag color="green">PAID</Tag>
        ) : s === "PARTIAL" ? (
          <Tag color="gold">PARTIAL</Tag>
        ) : (
          <Tag color="volcano">DUE</Tag>
        ),
    },
    {
      title: "Action",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button size="small" type="primary" onClick={() => handleView(record)}>
            View
          </Button>
          <Button size="small" onClick={() => handleInvoice(record)}>
            Invoice
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Sales Products</h1>
        <p className="text-slate-500">Filter sales by date, payment method, customer and invoice</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <RangePicker className="w-full" onChange={(value) => setDateRange(value)} />

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
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
        />

        <Input
          placeholder="Invoice No"
          value={invoiceFilter}
          onChange={(e) => setInvoiceFilter(e.target.value)}
        />

        <Button
          danger
          onClick={() => {
            setPaymentFilter(undefined);
            setCustomerFilter("");
            setInvoiceFilter("");
            setDateRange(null);
          }}
        >
          Reset
        </Button>
      </div>

      {/* Table */}
      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">Failed to load sales. Please try again.</div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          scroll={{ x: 1200 }}
          loading={isLoading || isFetching}
          pagination={{ pageSize: 8 }}
        />
      )}

      {/* View Modal */}
      <Modal
        title="Sale Details"
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        destroyOnHidden
      >
        {selected ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice</span>
              <span className="font-medium">{selected.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium">{selected.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer</span>
              <span className="font-medium">{selected.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Product</span>
              <span className="font-medium">{selected.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Quantity</span>
              <span className="font-medium">{selected.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total</span>
              <span className="font-medium">৳ {selected.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid</span>
              <span className="font-medium">৳ {selected.paidAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due</span>
              <span className="font-medium text-red-600">৳ {selected.dueAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Method</span>
              <span className="font-medium">{selected.paymentMethod || "DUE"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Note</span>
              <span className="font-medium">{selected.note || "-"}</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default SalesManagePage;
