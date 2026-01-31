"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Space, Button, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
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

/* ---------------- Payment Options ---------------- */
const paymentMethods = [
  { label: "Cash", value: "CASH" },
  { label: "bKash", value: "BKASH" },
  { label: "Nagad", value: "NAGAD" },
  { label: "BANK", value: "BANK" },
];

/* ---------------- Validation (same logic as create) ---------------- */
const purchaseValidation = z
  .object({
    supplierName: z.string().min(1, "Supplier name is required"),
    productName: z.string().min(1, "Product name is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    purchasePrice: z.coerce.number().min(0, "Purchase price must be 0 or more"),
    paidAmount: z.coerce.number().min(0, "Paid amount must be 0 or more"),
    paymentMethod: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.paidAmount === 0 || Boolean(data.paymentMethod), {
    message: "Payment method is required when paid amount is greater than 0",
    path: ["paymentMethod"],
  });

type PaymentStatus = "Paid" | "Partial" | "Due";

type PurchaseRow = {
  [x: string]: any;
  key: string;
  _id?: string;

  invoiceNo: string;
  supplierName: string;
  productName: string;

  date: string;

  totalItems: number; // mapped from quantity
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  note?: string;

  createdAt?: string;
};

const formatDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toISOString().slice(0, 10); // yyyy-mm-dd
};

const buildInvoiceNo = (createdAt?: string, index = 0) => {
  // simple demo invoice number: PUR- + last 5 digits of time + row index
  const base = createdAt ? new Date(createdAt).getTime().toString().slice(-5) : `${Date.now()}`.slice(-5);
  return `PUR-${base}${index}`;
};

const getPaymentStatus = (due: number, paid: number, total: number): PaymentStatus => {
  if (total <= 0) return "Due";
  if (due === 0 && paid >= total) return "Paid";
  if (paid > 0 && due > 0) return "Partial";
  return "Due";
};

const Page = () => {
  const router = useRouter();

  const { data, isLoading, isFetching, isError } = useGetPurchasesQuery(undefined);
  const [deletePurchase] = useDeletePurchaseMutation();
  const [updatePurchase] = useUpdatePurchaseMutation();

  const [viewOpen, setViewOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  // ✅ adjust based on your API response shape
  const rawPurchases = data?.data ?? data ?? [];

  const purchaseData: PurchaseRow[] = Array.isArray(rawPurchases)
    ? rawPurchases.map((p: any, idx: number) => {
        const qty = Number(p?.quantity ?? 0);
        const price = Number(p?.purchasePrice ?? 0);
        const total = Number(p?.totalAmount ?? qty * price);
        const paid = Number(p?.paidAmount ?? 0);
        const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));

        return {
          key: p?._id || p?.id || buildInvoiceNo(p?.createdAt, idx),
          _id: p?._id || p?.id,

          invoiceNo: p?.invoiceNo || buildInvoiceNo(p?.createdAt, idx),
          supplierName: p?.supplierName ?? "-",
          productName: p?.productName ?? "-",

          date: formatDate(p?.createdAt),

          totalItems: qty,
          totalAmount: total,
          paidAmount: paid,
          dueAmount: due,

          paymentStatus: getPaymentStatus(due, paid, total),
          paymentMethod: p?.paymentMethod ?? null,
          note: p?.note ?? "",

          createdAt: p?.createdAt,
        };
      })
    : [];

  /* ---------------- Delete ---------------- */
  const handleDelete = async (id?: string) => {
    if (!id) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This purchase will be deleted permanently!",
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
      if (res?.success) {
        toast.success(res?.message || "Purchase deleted successfully", { id: toastId });
      } else {
        toast.error(res?.message || "Failed to delete purchase", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete purchase", { id: toastId });
    }
  };

  /* ---------------- View Modal ---------------- */
  const openView = (row: PurchaseRow) => {
    const raw =
      Array.isArray(rawPurchases) &&
      rawPurchases.find((p: any) => (p?._id || p?.id) === row._id);

    setSelected(raw || row);
    setViewOpen(true);
  };

  const closeView = () => {
    setViewOpen(false);
    setSelected(null);
  };

  /* ---------------- Update Modal ---------------- */
  const openUpdate = (row: PurchaseRow) => {
    const raw =
      Array.isArray(rawPurchases) &&
      rawPurchases.find((p: any) => (p?._id || p?.id) === row._id);

    // normalize selected object for form prefill
    const normalized = raw || {
      _id: row._id,
      supplierName: row.supplierName,
      productName: row.productName,
      quantity: row.totalItems,
      purchasePrice: row.purchasePrice,
      paidAmount: row.paidAmount,
      paymentMethod: row.paymentMethod,
      note: row.note,
    };

    setSelected(normalized);
    setUpdateOpen(true);
  };

  const closeUpdate = () => {
    setUpdateOpen(false);
    setSelected(null);
  };

  const handleUpdate: SubmitHandler<FieldValues> = async (formData) => {
    const id = selected?._id || selected?.id;
    if (!id) return;

    const toastId = toast.loading("Updating purchase...");

    try {
      const res = await updatePurchase({ id, ...formData }).unwrap();

      if (res?.success) {
        toast.success(res?.message || "Purchase updated successfully", { id: toastId });
        closeUpdate();
      } else {
        toast.error(res?.message || "Failed to update purchase", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update purchase", { id: toastId });
    }
  };

  const columns: ColumnsType<PurchaseRow> = useMemo(
    () => [
      {
        title: "Invoice No",
        dataIndex: "invoiceNo",
        key: "invoiceNo",
        fixed: "left",
      },
      {
        title: "Supplier",
        dataIndex: "supplierName",
        key: "supplierName",
      },
      {
        title: "Product",
        dataIndex: "productName",
        key: "productName",
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
        render: (status: PaymentStatus) => {
          const color = status === "Paid" ? "green" : status === "Partial" ? "gold" : "red";
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
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<EyeOutlined />} onClick={() => openView(record)} />
            <Button size="small" icon={<EditOutlined />} type="primary" onClick={() => openUpdate(record)} />
            <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record._id)} />
          </Space>
        ),
      },
    ],
    []
  );

  const defaultValues = selected
    ? {
        supplierName: selected?.supplierName ?? "",
        productName: selected?.productName ?? "",
        quantity: selected?.quantity ?? 1,
        purchasePrice: selected?.purchasePrice ?? 0,
        paidAmount: selected?.paidAmount ?? 0,
        paymentMethod: selected?.paymentMethod ?? undefined,
        note: selected?.note ?? "",
      }
    : undefined;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Purchases</h1>
          <p className="text-slate-500">View, edit and manage your purchase invoices</p>
        </div>

        <Button type="primary" onClick={() => router.push("/purchase/create")}>
          Add Purchase
        </Button>
      </div>

      {/* Error */}
      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load purchases. Please try again.
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={purchaseData}
          loading={isLoading || isFetching}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* View Modal */}
      <Modal
        title="Purchase Details"
        open={viewOpen}
        onCancel={closeView}
        footer={null}
        destroyOnHidden
      >
        {selected ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Supplier</span>
              <span className="font-medium">{selected?.supplierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Product</span>
              <span className="font-medium">{selected?.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Quantity</span>
              <span className="font-medium">{selected?.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purchase Price</span>
              <span className="font-medium">৳ {selected?.purchasePrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid</span>
              <span className="font-medium">৳ {selected?.paidAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-medium">{selected?.paymentMethod || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Note</span>
              <span className="font-medium">{selected?.note || "-"}</span>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Update Modal */}
      <Modal
        title="Update Purchase"
        open={updateOpen}
        onCancel={closeUpdate}
        footer={null}
        destroyOnClose
      >
        {selected ? (
          <div className="pt-2">
            <TDForm
              key={selected?._id || selected?.id}
              resolver={zodResolver(purchaseValidation)}
              onSubmit={handleUpdate}
              defaultValues={defaultValues as any}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                <TDInput label="Supplier Name" name="supplierName" required />
                <TDInput label="Product Name" name="productName" required />
                <TDInput label="Quantity" name="quantity" type="number" required />
                <TDInput label="Purchase Price (per unit)" name="purchasePrice" type="number" required />
                <TDInput label="Paid Amount" name="paidAmount" type="number" required />
                <TDSelect label="Payment Method" name="paymentMethod" options={paymentMethods} />
                <TDInput label="Note (Optional)" name="note" />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={closeUpdate}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Update Purchase
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
