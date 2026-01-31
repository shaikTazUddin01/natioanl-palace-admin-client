"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Space, Button, Modal, Input, Select, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { toast } from "sonner";

import {
  useGetPurchasesQuery,
  useUpdatePurchaseMutation,
} from "@/src/redux/features/purchase/purchaseApi";

const { RangePicker } = DatePicker;

type PaymentMethod = "CASH" | "BANK" | "BKASH" | "NAGAD";
type TDueStatus = "Paid" | "Partial" | "Due" | "Overdue";

type TSupplierDueRow = {
  key: string;
  _id?: string;

  supplierName: string;
  phone?: string;

  invoiceNo: string;
  date: string;

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  status: TDueStatus;
  paymentMethod?: PaymentMethod | null;

  note?: string;
};

const getStatus = (due: number, paid: number): TDueStatus => {
  if (due <= 0) return "Paid";
  if (paid > 0 && due > 0) return "Partial";
  return "Due";
};

const isOverdue = (dateStr: string) => {
  // ✅ Simple rule: 7 days over = overdue
  const d = dayjs(dateStr);
  return dayjs().diff(d, "day") > 7;
};

const Page = () => {
  const { data, isLoading, isFetching, isError } = useGetPurchasesQuery(undefined);
  const [updatePurchase] = useUpdatePurchaseMutation();

  // filters
  const [supplierFilter, setSupplierFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);

  // modals
  const [viewOpen, setViewOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selected, setSelected] = useState<TSupplierDueRow | null>(null);

  // payment modal fields
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod | undefined>();

  // ✅ adjust based on your API response
  const rawPurchases = data?.data ?? data ?? [];

  const dueRows: TSupplierDueRow[] = useMemo(() => {
    if (!Array.isArray(rawPurchases)) return [];

    return rawPurchases
      .map((p: any) => {
        const total = Number(p?.totalAmount ?? 0);
        const paid = Number(p?.paidAmount ?? 0);
        const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));

        const date = p?.date
          ? dayjs(p.date).format("YYYY-MM-DD")
          : p?.createdAt
          ? dayjs(p.createdAt).format("YYYY-MM-DD")
          : "-";

        const baseStatus = getStatus(due, paid);
        const status: TDueStatus =
          baseStatus !== "Paid" && date !== "-" && isOverdue(date)
            ? "Overdue"
            : baseStatus;

        return {
          key: p?._id || p?.id || p?.invoiceNo || crypto.randomUUID(),
          _id: p?._id || p?.id,

          supplierName: p?.supplierName ?? "Unknown Supplier",
          phone: p?.phone ?? p?.supplierPhone ?? undefined,

          invoiceNo: p?.invoiceNo ?? p?.purchaseInvoiceNo ?? "-",
          date,

          totalAmount: total,
          paidAmount: paid,
          dueAmount: due,

          status,
          paymentMethod: (p?.paymentMethod ?? null) as PaymentMethod | null,
          note: p?.note ?? "",
        };
      })
      // ✅ Only show due > 0
      .filter((r: TSupplierDueRow) => r.dueAmount > 0);
  }, [rawPurchases]);

  const filteredData = useMemo(() => {
    return dueRows.filter((row) => {
      const matchSupplier = row.supplierName
        .toLowerCase()
        .includes(supplierFilter.toLowerCase());

      const matchInvoice = row.invoiceNo
        .toLowerCase()
        .includes(invoiceFilter.toLowerCase());

      const matchDate =
        !dateRange ||
        (dayjs(row.date).isAfter(dayjs(dateRange[0]).subtract(1, "day")) &&
          dayjs(row.date).isBefore(dayjs(dateRange[1]).add(1, "day")));

      return matchSupplier && matchInvoice && matchDate;
    });
  }, [dueRows, supplierFilter, invoiceFilter, dateRange]);

  // ---------------- View ----------------
  const openView = (row: TSupplierDueRow) => {
    setSelected(row);
    setViewOpen(true);
  };

  // ---------------- Receive Payment ----------------
  const openPayment = (row: TSupplierDueRow) => {
    setSelected(row);
    setPayAmount(row.dueAmount); // ✅ default: full due payment auto-filled
    setPayMethod(undefined);
    setPaymentOpen(true);
  };

  const handleReceivePayment = async () => {
    if (!selected?._id) return;

    if (!payAmount || payAmount <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    // ✅ due এর চেয়ে বেশি নেবে না
    if (payAmount > selected.dueAmount) {
      toast.error("Payment amount cannot exceed due amount");
      return;
    }

    if (!payMethod) {
      toast.error("Payment method is required");
      return;
    }

    const confirm = await Swal.fire({
      title: "Confirm Payment?",
      text: `Pay ৳ ${payAmount.toLocaleString()} to ${selected.supplierName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, pay",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    const toastId = toast.loading("Updating supplier payment...");

    try {
      // ✅ new paid amount = old paid + payAmount
      const newPaid = Number(selected.paidAmount) + Number(payAmount);
      const newDue = Math.max(Number(selected.totalAmount) - newPaid, 0);

      const res = await updatePurchase({
        id: selected._id,
        paidAmount: newPaid,
        dueAmount: newDue,
        paymentMethod: payMethod,
        purchaseStatus: newDue > 0 ? "DUE" : "PAID",
      }).unwrap();

      if (res?.success) {
        toast.success(res?.message || "Payment updated successfully", {
          id: toastId,
        });
        setPaymentOpen(false);
        setSelected(null);
        // ✅ due 0 হলে row auto hide হবে (filter dueAmount > 0)
      } else {
        toast.error(res?.message || "Failed to update payment", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update payment", {
        id: toastId,
      });
    }
  };

  /* ---------------- Columns ---------------- */
  const columns: ColumnsType<TSupplierDueRow> = [
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
      title: "Invoice No",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (v) => <strong>{v}</strong>,
    },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `৳ ${Number(amount).toLocaleString()}`,
    },
    {
      title: "Paid",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (amount) => `৳ ${Number(amount).toLocaleString()}`,
    },
    {
      title: "Due",
      dataIndex: "dueAmount",
      key: "dueAmount",
      render: (amount) => (
        <Tag color={Number(amount) > 0 ? "volcano" : "green"}>
          ৳ {Number(amount).toLocaleString()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: TDueStatus) => {
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
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => openView(record)} />
          <Button size="small" icon={<EditOutlined />} type="primary" onClick={() => openPayment(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Supplier Due Management
          </h1>
          <p className="text-slate-500">
            Track and manage outstanding supplier payments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <RangePicker className="w-full" onChange={(val) => setDateRange(val)} />

        <Input
          placeholder="Supplier Name"
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
        />

        <Input
          placeholder="Invoice No"
          value={invoiceFilter}
          onChange={(e) => setInvoiceFilter(e.target.value)}
        />

        <Button
          danger
          onClick={() => {
            setSupplierFilter("");
            setInvoiceFilter("");
            setDateRange(null);
          }}
        >
          Reset
        </Button>
      </div>

      {/* Table */}
      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load supplier dues. Please try again.
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={isLoading || isFetching}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* View Modal */}
      <Modal
        title="Due Details"
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        destroyOnClose
      >
        {selected ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice</span>
              <span className="font-medium">{selected.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Supplier</span>
              <span className="font-medium">{selected.supplierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium">{selected.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total</span>
              <span className="font-medium">
                ৳ {selected.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid</span>
              <span className="font-medium">
                ৳ {selected.paidAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due</span>
              <span className="font-medium text-red-600">
                ৳ {selected.dueAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className="font-medium">{selected.status}</span>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Receive Payment Modal (same design as customer due) */}
      <Modal
        title="Pay Supplier"
        open={paymentOpen}
        onCancel={() => setPaymentOpen(false)}
        onOk={handleReceivePayment}
        okText="Pay"
        destroyOnClose
      >
        {selected ? (
          <div className="space-y-4">
            {/* ✅ top summary like customer page */}
            <div className="text-sm text-slate-600">
              <div>
                <strong>{selected.supplierName}</strong> • Invoice{" "}
                <strong>{selected.invoiceNo}</strong>
              </div>
              <div>
                Due:{" "}
                <strong className="text-red-600">
                  ৳ {selected.dueAmount.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* ✅ auto filled amount */}
            <Input
              type="number"
              min={1}
              max={selected.dueAmount}
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              placeholder="Payment Amount"
            />

            <Select
              className="w-full"
              placeholder="Payment Method"
              value={payMethod}
              onChange={(v) => setPayMethod(v)}
              options={[
                { label: "Cash", value: "CASH" },
                { label: "Bank", value: "BANK" },
                { label: "Bkash", value: "BKASH" },
                { label: "Nagad", value: "NAGAD" },
              ]}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Page;
