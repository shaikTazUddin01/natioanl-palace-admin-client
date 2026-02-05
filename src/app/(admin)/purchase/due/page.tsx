"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { toast } from "sonner";
import type { FieldValues, SubmitHandler } from "react-hook-form";
import {
  useGetPurchasesQuery,
  useDeletePurchaseMutation,
  useUpdatePurchaseMutation,
} from "@/src/redux/features/purchase/purchaseApi";
import { PaymentMethod, TSupplierDueRow } from "@/src/types";
import { getStatus } from "@/src/utils/supplierDue.utils";
import { buildInvoiceNo } from "@/src/utils/purchase.utils";
import SupplierDueFilters from "@/src/components/pages/supplierDue/Filters";
import SupplierDueTable from "@/src/components/pages/supplierDue/Table";
import SupplierDueViewModal from "@/src/components/pages/supplierDue/ViewModel";
import SupplierDuePaymentModal from "@/src/components/pages/supplierDue/PaymentModel";

export default function SupplierDuePage() {
  const { data, isLoading, isFetching, isError } = useGetPurchasesQuery(undefined);
  const [deletePurchase] = useDeletePurchaseMutation();
  const [updatePurchase] = useUpdatePurchaseMutation();

  // filters
  const [supplierFilter, setSupplierFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);

  // modals
  const [viewOpen, setViewOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selected, setSelected] = useState<TSupplierDueRow | null>(null);

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
      .filter((row) => row.dueAmount > 0);
  }, [rawPurchases]);

  const filteredData = useMemo(() => {
    return dueRows.filter((row) => {
      const matchSupplier = row.supplierName.toLowerCase().includes(supplierFilter.toLowerCase());
      const matchInvoice = row.purchaseInvoiceNo.toLowerCase().includes(invoiceFilter.toLowerCase());

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

  /* ---------------- Payment ---------------- */
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

    if (newPaid < 0) return toast.error("Paid amount cannot be negative");
    if (newPaid < prevPaid) return toast.error(`Paid amount cannot be less than previous paid (৳ ${prevPaid})`);
    if (newPaid > total) return toast.error(`Paid amount cannot exceed total amount (৳ ${total})`);

    const newDue = Math.max(total - newPaid, 0);

    const paymentMethod = newPaid > 0 ? (formData.paymentMethod ?? null) : null;
    if (newPaid > 0 && !paymentMethod) {
      return toast.error("Payment method is required when paid amount is greater than 0");
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
      } else {
        toast.error(res?.message || "Failed to update", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update", { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Supplier Due List</h1>
        <p className="text-slate-500">Only unpaid / due purchases are shown here</p>
      </div>

      {/* Filters */}
      <SupplierDueFilters
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        invoiceFilter={invoiceFilter}
        setInvoiceFilter={setInvoiceFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onReset={() => {
          setSupplierFilter("");
          setInvoiceFilter("");
          setDateRange(null);
        }}
      />

      {/* Table / Error / Empty */}
      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load supplier dues. Please try again.
        </div>
      ) : filteredData.length === 0 && !(isLoading || isFetching) ? (
        <div className="p-6 rounded-xl bg-slate-50 text-slate-600 text-center">
          ✅ No supplier due found. (All payments are cleared)
        </div>
      ) : (
        <SupplierDueTable
          data={filteredData}
          loading={isLoading || isFetching}
          onView={openView}
          onPayment={openPayment}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <SupplierDueViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        selected={selected}
      />

      <SupplierDuePaymentModal
        open={paymentOpen}
        onClose={closePayment}
        selected={selected}
        onSubmit={handleUpdatePayment}
      />
    </div>
  );
}
