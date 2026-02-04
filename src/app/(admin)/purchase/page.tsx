"use client";

import { useState } from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { FieldValues, SubmitHandler } from "react-hook-form";


import {
  useGetPurchasesQuery,
  useDeletePurchaseMutation,
  useUpdatePurchaseMutation,
} from "@/src/redux/features/purchase/purchaseApi";
import { PurchaseRow } from "@/src/types";
import { buildInvoiceNo, formatDate, getPaymentStatus } from "@/src/utils/purchase.utils";
import PurchaseTable from "@/src/components/pages/purchase/PurchaseTable";
import PurchaseViewModal from "@/src/components/pages/purchase/PurchaseViewModel";
import PurchaseUpdateModal from "@/src/components/pages/purchase/PurchaseUpdateModel";

const Page = () => {
  const router = useRouter();

  const { data, isLoading, isFetching, isError } = useGetPurchasesQuery(undefined);
  const [deletePurchase] = useDeletePurchaseMutation();
  const [updatePurchase] = useUpdatePurchaseMutation();

  const [viewOpen, setViewOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

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
      if (res?.success) toast.success(res?.message || "Purchase deleted successfully", { id: toastId });
      else toast.error(res?.message || "Failed to delete purchase", { id: toastId });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete purchase", { id: toastId });
    }
  };

  /* ---------------- View ---------------- */
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

  /* ---------------- Update ---------------- */
  const openUpdate = (row: PurchaseRow) => {
    const raw =
      Array.isArray(rawPurchases) &&
      rawPurchases.find((p: any) => (p?._id || p?.id) === row._id);

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

      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load purchases. Please try again.
        </div>
      ) : (
        <PurchaseTable
          data={purchaseData}
          loading={isLoading || isFetching}
          onView={openView}
          onEdit={openUpdate}
          onDelete={handleDelete}
        />
      )}

      <PurchaseViewModal open={viewOpen} selected={selected} onClose={closeView} />

      <PurchaseUpdateModal
        open={updateOpen}
        selected={selected}
        onClose={closeUpdate}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default Page;
