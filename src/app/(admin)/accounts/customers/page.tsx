"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { toast } from "sonner";

import {
  useGetPurchasesQuery,
  useUpdatePurchaseMutation,
} from "@/src/redux/features/purchase/purchaseApi";
import { PaymentMethod, TCustomerDueRow, TDueStatus } from "@/src/types";

import { createCustomerDueColumns } from "@/src/components/pages/sales/dueManagement/colmuns";
import CustomerDueHeader from "@/src/components/pages/sales/dueManagement/CustomerDueHeader";
import CustomerDueFilters from "@/src/components/pages/sales/dueManagement/CustomerDueFilters";
import CustomerDueTable from "@/src/components/pages/sales/dueManagement/CustomerDueTable";
import CustomerDueViewModal from "@/src/components/pages/sales/dueManagement/CustomerDueViewModal";
import CustomerDuePayModal from "@/src/components/pages/sales/dueManagement/CustomerDuePayModal";
import { getStatus, isOverdue } from "@/src/utils/customerDue.utils";
import { useGetSalesQuery } from "@/src/redux/features/sales/salesApi";



export default function CustomerDuePageClient() {
  const { data, isLoading, isFetching, isError } = useGetSalesQuery(undefined);
  const [updatePurchase] = useUpdatePurchaseMutation();

  
  // filters
  const [customerFilter, setCustomerFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);

  // modals
  const [viewOpen, setViewOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selected, setSelected] = useState<TCustomerDueRow | null>(null);

  // payment modal fields
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod | undefined>();

  // ✅ adjust based on your API response
  const rawItems = data?.data ?? data ?? [];

  const dueRows: TCustomerDueRow[] = useMemo(() => {
    if (!Array.isArray(rawItems)) return [];

    return rawItems
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

          // ✅ fallback keeps your current API working
          customerName: p?.customerName ?? p?.supplierName ?? "Unknown Customer",
          customerNumber: p?.customerNumber ?? p?.customerNumber ?? p?.customerNumber ?? undefined,

          invoiceNo: p?.invoiceNo ?? p?.purchaseInvoiceNo ?? p?.salesInvoiceNo ?? "-",
          date,

          totalAmount: total,
          paidAmount: paid,
          dueAmount: due,

          status,
          paymentMethod: (p?.paymentMethod ?? null) as PaymentMethod | null,
          note: p?.note ?? "",
        };
      })
      .filter((r) => r.dueAmount > 0);
  }, [rawItems]);

  const filteredData = useMemo(() => {
    return dueRows.filter((row) => {
      const matchCustomer = row.customerName
        .toLowerCase()
        .includes(customerFilter.toLowerCase());

      const matchInvoice = row.invoiceNo
        .toLowerCase()
        .includes(invoiceFilter.toLowerCase());

      const matchDate =
        !dateRange ||
        (dayjs(row.date).isAfter(dayjs(dateRange[0]).subtract(1, "day")) &&
          dayjs(row.date).isBefore(dayjs(dateRange[1]).add(1, "day")));

      return matchCustomer && matchInvoice && matchDate;
    });
  }, [dueRows, customerFilter, invoiceFilter, dateRange]);

  const openView = (row: TCustomerDueRow) => {
    setSelected(row);
    setViewOpen(true);
  };

  const openPayment = (row: TCustomerDueRow) => {
    setSelected(row);
    setPayAmount(row.dueAmount);
    setPayMethod(undefined);
    setPaymentOpen(true);
  };

  const handleReceivePayment = async () => {
    if (!selected?._id) return;

    if (!payAmount || payAmount <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

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
      text: `Receive ৳ ${payAmount.toLocaleString()} from ${selected.customerName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, receive",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    const toastId = toast.loading("Updating customer payment...");

    try {
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
        toast.success(res?.message || "Payment updated successfully", { id: toastId });
        setPaymentOpen(false);
        setSelected(null);
      } else {
        toast.error(res?.message || "Failed to update payment", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update payment", { id: toastId });
    }
  };

  const columns = useMemo(
    () => createCustomerDueColumns(openView, openPayment),
    []
  );

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <CustomerDueHeader />

      <CustomerDueFilters
        customerFilter={customerFilter}
        setCustomerFilter={setCustomerFilter}
        invoiceFilter={invoiceFilter}
        setInvoiceFilter={setInvoiceFilter}
        setDateRange={setDateRange}
        onReset={() => {
          setCustomerFilter("");
          setInvoiceFilter("");
          setDateRange(null);
        }}
      />

      <CustomerDueTable
        columns={columns}
        data={filteredData}
        loading={isLoading || isFetching}
        isError={isError}
      />

      <CustomerDueViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        selected={selected}
      />

      <CustomerDuePayModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onOk={handleReceivePayment}
        selected={selected}
        payAmount={payAmount}
        setPayAmount={setPayAmount}
        payMethod={payMethod}
        setPayMethod={setPayMethod}
      />
    </div>
  );
}
