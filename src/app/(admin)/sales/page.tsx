"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";



import { useGetSalesQuery, useDeleteSaleMutation } from "@/src/redux/features/sales/salesApi";
import { TSaleRow } from "@/src/types/sales";
import SalesFilters from "@/src/components/pages/sales/salesManagement/salesFilter";
import SalesTable from "@/src/components/pages/sales/salesManagement/SalesTable";
import SaleViewModal from "@/src/components/pages/sales/salesManagement/salesViewModal";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function SalesManagePage() {
  const { data, isLoading, isFetching, isError } = useGetSalesQuery(undefined);
  const [deleteSale] = useDeleteSaleMutation();

  const [paymentFilter, setPaymentFilter] = useState<string>();
  const [customerFilter, setCustomerFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<TSaleRow | null>(null);

  const rawSales = data?.data ?? data ?? [];

  const salesData: TSaleRow[] = useMemo(() => rawSales.map((s: any) => {
    const qty = Number(s?.quantity ?? 0);
    const total = Number(s?.totalAmount ?? 0);
    const paid = Number(s?.paidAmount ?? 0);
    const due = Number(s?.dueAmount ?? Math.max(total - paid, 0));

    return {
      key: s?._id ?? s?.id ?? s?.invoiceNo ?? crypto.randomUUID(),
      _id: s?._id ?? s?.id,
      date: s?.date ? dayjs(s.date).format("YYYY-MM-DD") : "-",
      invoiceNo: s?.invoiceNo ?? "-",
      customerName: s?.customerName ?? "-",
      productName: s?.productName ?? "-",
      quantity: qty,
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due,
      paymentMethod: s?.paymentMethod ?? null,
      status: (s?.paymentStatus ?? (due <= 0 ? "PAID" : paid > 0 ? "PARTIAL" : "DUE")) as any,
      note: s?.note ?? "",
    };
  }), [rawSales]);

  const filteredData = useMemo(() => salesData.filter((sale) => {
    const matchPayment = !paymentFilter || (paymentFilter === "DUE" ? sale.dueAmount > 0 : sale.paymentMethod === paymentFilter);
    const matchCustomer = sale.customerName.toLowerCase().includes(customerFilter.toLowerCase());
    const matchInvoice = sale.invoiceNo.toLowerCase().includes(invoiceFilter.toLowerCase());
    const matchDate = !dateRange || (dayjs(sale.date).isSameOrAfter(dateRange[0], "day") && dayjs(sale.date).isSameOrBefore(dateRange[1], "day"));
    return matchPayment && matchCustomer && matchInvoice && matchDate;
  }), [salesData, paymentFilter, customerFilter, invoiceFilter, dateRange]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const result = await Swal.fire({ title: "Are you sure?", text: "This sale will be deleted permanently!", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete", cancelButtonText: "Cancel", confirmButtonColor: "#d33" });
    if (!result.isConfirmed) return;
    const toastId = toast.loading("Deleting sale...");
    try { const res = await deleteSale(id).unwrap(); if (res?.success) toast.success(res?.message || "Deleted successfully", { id: toastId }); else toast.error(res?.message || "Failed to delete", { id: toastId }); } 
    catch (error: any) { toast.error(error?.data?.message || "Failed to delete", { id: toastId }); }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Sales Products</h1>
        <p className="text-slate-500">Filter sales by date, payment method, customer and invoice</p>
      </div>

      <SalesFilters
        customerFilter={customerFilter}
        invoiceFilter={invoiceFilter}
        paymentFilter={paymentFilter}
        dateRange={dateRange}
        setCustomerFilter={setCustomerFilter}
        setInvoiceFilter={setInvoiceFilter}
        setPaymentFilter={setPaymentFilter}
        setDateRange={setDateRange}
      />

      {isError ? <div className="p-4 rounded-lg bg-red-50 text-red-600">Failed to load sales. Please try again.</div> :
        <SalesTable data={filteredData} loading={isLoading || isFetching} onView={setSelected.bind(null)} onDelete={handleDelete} />
      }

      <SaleViewModal open={!!selected} onClose={() => setSelected(null)} sale={selected} />
    </div>
  );
}
