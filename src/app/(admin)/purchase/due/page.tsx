"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Space, Button, Modal, Input, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler } from "react-hook-form";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";

import {
  useGetPurchasesQuery,
  useDeletePurchaseMutation,
  useUpdatePurchaseMutation,
} from "@/src/redux/features/purchase/purchaseApi";

const { RangePicker } = DatePicker;

/* ---------------- Payment Options ---------------- */
const paymentMethods = [
  { label: "Cash", value: "CASH" },
  { label: "bKash", value: "BKASH" },
  { label: "Nagad", value: "NAGAD" },
  { label: "BANK", value: "BANK" },
];

/* ---------------- Validation ---------------- */
const dueValidation = z
  .object({
    paidAmount: z.coerce.number().min(0, "Paid amount must be 0 or more"),
    paymentMethod: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.paidAmount === 0 || Boolean(data.paymentMethod), {
    message: "Payment method is required when paid amount is greater than 0",
    path: ["paymentMethod"],
  });

type PaymentMethod = "CASH" | "BKASH" | "NAGAD" | "BANK";
type TDueStatus = "Paid" | "Partial" | "Due" | "Overdue";

type TSupplierDueRow = {
  key: string;
  _id?: string;

  supplierName: string;
  phone?: string;

  purchaseInvoiceNo: string;
  date: string;

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  status: TDueStatus;
  paymentMethod?: PaymentMethod | null;
  note?: string;

  createdAt?: string;
};

/* ---------------- Helpers ---------------- */
const formatDate = (d?: string) => {
  if (!d) return "-";
  return dayjs(d).format("YYYY-MM-DD");
};

const buildInvoiceNo = (createdAt?: string, index = 0) => {
  const base = createdAt
    ? new Date(createdAt).getTime().toString().slice(-5)
    : `${Date.now()}`.slice(-5);
  return `PUR-${base}${index}`;
};

// ✅ simple overdue: 7 days+
const isOverdue = (dateStr: string) => {
  if (!dateStr || dateStr === "-") return false;
  return dayjs().diff(dayjs(dateStr), "day") > 7;
};

const getStatus = (due: number, paid: number, dateStr: string): TDueStatus => {
  if (due <= 0) return "Paid";
  if (paid > 0 && due > 0) return isOverdue(dateStr) ? "Overdue" : "Partial";
  return isOverdue(dateStr) ? "Overdue" : "Due";
};

const Page = () => {
  const { data, isLoading, isFetching, isError } = useGetPurchasesQuery(undefined);
  const [deletePurchase] = useDeletePurchaseMutation();
  const [updatePurchase] = useUpdatePurchaseMutation();

  // filters (like customer due)
  const [supplierFilter, setSupplierFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);

  // modals
  const [viewOpen, setViewOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selected, setSelected] = useState<TSupplierDueRow | null>(null);

  // ✅ adjust based on your API response shape
  const rawPurchases = data?.data ?? data ?? [];

  const dueRows: TSupplierDueRow[] = useMemo(() => {
    if (!Array.isArray(rawPurchases)) return [];

    return rawPurchases
      .map((p: any, idx: number) => {
        const qty = Number(p?.quantity ?? 0);
        const price = Number(p?.purchasePrice ?? 0);

        const total = Number(p?.totalAmount ?? qty * price);
        const paid = Number(p?.paidAmount ?? 0);
        const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));

        const date = p?.date
          ? dayjs(p.date).format("YYYY-MM-DD")
          : p?.createdAt
          ? dayjs(p.createdAt).format("YYYY-MM-DD")
          : "-";

        const status = getStatus(due, paid, date);

        return {
          key: p?._id || p?.id || p?.invoiceNo || buildInvoiceNo(p?.createdAt, idx),
          _id: p?._id || p?.id,

          supplierName: p?.supplierName ?? "-",
          phone: p?.phone ?? p?.supplierPhone ?? undefined,

          purchaseInvoiceNo: p?.invoiceNo ?? buildInvoiceNo(p?.createdAt, idx),
          date,

          totalAmount: total,
          paidAmount: paid,
          dueAmount: due,

          status,
          paymentMethod: (p?.paymentMethod ?? null) as PaymentMethod | null,
          note: p?.note ?? "",

          createdAt: p?.createdAt,
        };
      })
      // ✅ main requirement: due 0 হলে show হবে না
      .filter((row) => row.dueAmount > 0);
  }, [rawPurchases]);

  const filteredData = useMemo(() => {
    return dueRows.filter((row) => {
      const matchSupplier = row.supplierName
        .toLowerCase()
        .includes(supplierFilter.toLowerCase());

      const matchInvoice = row.purchaseInvoiceNo
        .toLowerCase()
        .includes(invoiceFilter.toLowerCase());

      const matchDate =
        !dateRange ||
        (dayjs(row.date).isAfter(dayjs(dateRange[0]).subtract(1, "day")) &&
          dayjs(row.date).isBefore(dayjs(dateRange[1]).add(1, "day")));

      return matchSupplier && matchInvoice && matchDate;
    });
  }, [dueRows, supplierFilter, invoiceFilter, dateRange]);

  /* ---------------- Delete ---------------- */
  const handleDelete = async (id?: string) => {
    if (!id) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This due entry will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading("Deleting purchase...");

    try {
      const res = await deletePurchase(id).unwrap();
      if (res?.success) toast.success(res?.message || "Deleted successfully", { id: toastId });
      else toast.error(res?.message || "Failed to delete", { id: toastId });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete", { id: toastId });
    }
  };

  /* ---------------- View ---------------- */
  const openView = (row: TSupplierDueRow) => {
    setSelected(row);
    setViewOpen(true);
  };

  /* ---------------- Receive/Update Payment (like customer due) ---------------- */
  const openPayment = (row: TSupplierDueRow) => {
    setSelected(row);
    setPaymentOpen(true);
  };

  const closePayment = () => {
    setPaymentOpen(false);
    setSelected(null);
  };

  const handleUpdatePayment: SubmitHandler<FieldValues> = async (formData) => {
  const id = selected?._id;
  if (!id || !selected) return;

  const total = Number(selected.totalAmount ?? 0);
  const prevPaid = Number(selected.paidAmount ?? 0);
  const newPaid = Number(formData.paidAmount ?? 0);

  // ✅ 1) negative না
  if (newPaid < 0) {
    toast.error("Paid amount cannot be negative");
    return;
  }

  // ✅ 2) আগের paid এর চেয়ে কম দেওয়া যাবে না
  if (newPaid < prevPaid) {
    toast.error(`Paid amount cannot be less than previous paid (৳ ${prevPaid})`);
    return;
  }

  // ✅ 3) total এর চেয়ে বেশি দেওয়া যাবে না
  if (newPaid > total) {
    toast.error(`Paid amount cannot exceed total amount (৳ ${total})`);
    return;
  }

  // ✅ auto calculate due
  const newDue = Math.max(total - newPaid, 0);

  // ✅ payment method rule
  const paymentMethod =
    newPaid > 0 ? (formData.paymentMethod ?? null) : null;

  if (newPaid > 0 && !paymentMethod) {
    toast.error("Payment method is required when paid amount is greater than 0");
    return;
  }

  const confirm = await Swal.fire({
    title: "Confirm Payment Update?",
    html: `
      <div style="text-align:left; font-size:14px;">
        <p><b>Supplier:</b> ${selected.supplierName}</p>
        <p><b>Invoice:</b> ${selected.purchaseInvoiceNo}</p>
        <hr/>
        <p><b>Total:</b> ৳ ${total.toLocaleString()}</p>
        <p><b>Paid:</b> ৳ ${newPaid.toLocaleString()}</p>
        <p><b>Due:</b> ৳ ${newDue.toLocaleString()}</p>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, update",
    cancelButtonText: "Cancel",
  });

  if (!confirm.isConfirmed) return;

  const toastId = toast.loading("Updating payment...");

  try {
    const res = await updatePurchase({
      id,
      paidAmount: newPaid,
      dueAmount: newDue,
      paymentMethod,
      purchaseStatus: newDue > 0 ? "DUE" : "PAID",
      note: formData.note || "",
    }).unwrap();

    if (res?.success) {
      toast.success(res?.message || "Payment updated", { id: toastId });
      closePayment();
      // ✅ due 0 হলে filter এর জন্য row auto remove হবে
    } else {
      toast.error(res?.message || "Failed to update", { id: toastId });
    }
  } catch (error: any) {
    toast.error(error?.data?.message || "Failed to update", { id: toastId });
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
      title: "Invoice",
      dataIndex: "purchaseInvoiceNo",
      key: "purchaseInvoiceNo",
      render: (v) => <strong>{v}</strong>,
    },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v) => `৳ ${Number(v).toLocaleString()}`,
    },
    {
      title: "Paid",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (v) => `৳ ${Number(v).toLocaleString()}`,
    },
    {
      title: "Due",
      dataIndex: "dueAmount",
      key: "dueAmount",
      render: (v) => (
        <Tag color="volcano">৳ {Number(v).toLocaleString()}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: TDueStatus) => {
        const color =
          s === "Paid"
            ? "green"
            : s === "Partial"
            ? "gold"
            : s === "Overdue"
            ? "red"
            : "blue";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (v) => v || "-",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => openView(record)} />
          <Button size="small" icon={<EditOutlined />} type="primary" onClick={() => openPayment(record)} />
          <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record._id)} />
        </Space>
      ),
    },
  ];

  const defaultValues = selected
    ? {
        paidAmount: selected?.paidAmount ?? 0,
        paymentMethod: selected?.paymentMethod ?? undefined,
        note: selected?.note ?? "",
      }
    : undefined;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Supplier Due List</h1>
        <p className="text-slate-500">
          Only unpaid / due purchases are shown here
        </p>
      </div>

      {/* Filters (like customer due) */}
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

      {/* Table / Empty / Error */}
      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load supplier dues. Please try again.
        </div>
      ) : filteredData.length === 0 && !(isLoading || isFetching) ? (
        <div className="p-6 rounded-xl bg-slate-50 text-slate-600 text-center">
          ✅ No supplier due found. (All payments are cleared)
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
              <span className="font-medium">{selected.purchaseInvoiceNo}</span>
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
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-medium">{selected.paymentMethod || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Note</span>
              <span className="font-medium">{selected.note || "-"}</span>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Update Payment Modal */}
      <Modal
        title="Update Due Payment"
        open={paymentOpen}
        onCancel={closePayment}
        footer={null}
        destroyOnClose
      >
        {selected ? (
          <div className="pt-2">
            <TDForm
              key={selected._id}
              resolver={zodResolver(dueValidation)}
              onSubmit={handleUpdatePayment}
              defaultValues={defaultValues as any}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                <TDInput label="Paid Amount" name="paidAmount" type="number" required />

                <TDSelect
                  label="Payment Method"
                  name="paymentMethod"
                  options={paymentMethods}
                />

                <TDInput
                  label="Note (Optional)"
                  name="note"
                  placeholder="Any note"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={closePayment}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Update Payment
                </Button>
              </div>
            </TDForm>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Page;
