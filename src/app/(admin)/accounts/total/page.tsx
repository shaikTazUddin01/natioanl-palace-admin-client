"use client";

import { useMemo, useState } from "react";
import { Table, Tag, Space, Button, Input, DatePicker, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { useGetSalesQuery } from "@/src/redux/features/sales/salesApi";
import { useGetPurchasesQuery } from "@/src/redux/features/purchase/purchaseApi";

const { Option } = Select;

type PaymentRow = {
  key: string;
  type: "SALE" | "PURCHASE"; // ✅ transaction type
  partyName: string; // customer/supplier
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  method?: string | null; // CASH/BANK/BKASH/NAGAD
  amount: number; // paid amount
  due: number; // due amount
  note?: string;
};

const getDate = (d?: any) => {
  if (!d) return "-";
  return dayjs(d).format("YYYY-MM-DD");
};

const Page = () => {
  // filters
  const [partyQuery, setPartyQuery] = useState("");
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [date, setDate] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"SALE" | "PURCHASE" | undefined>(
    undefined
  );

  // ✅ API data
  const {
    data: salesRes,
    isLoading: salesLoading,
    isFetching: salesFetching,
    isError: salesError,
  } = useGetSalesQuery(undefined);

  const {
    data: purchaseRes,
    isLoading: purchaseLoading,
    isFetching: purchaseFetching,
    isError: purchaseError,
  } = useGetPurchasesQuery(undefined);

  const rawSales = salesRes?.data ?? salesRes ?? [];
  const rawPurchases = purchaseRes?.data ?? purchaseRes ?? [];

  // ✅ Build unified rows (payments history style)
  const allRows: PaymentRow[] = useMemo(() => {
    const rows: PaymentRow[] = [];

    if (Array.isArray(rawSales)) {
      rawSales.forEach((s: any) => {
        const total = Number(s?.totalAmount ?? 0);
        const paid = Number(s?.paidAmount ?? 0);
        const due = Number(s?.dueAmount ?? Math.max(total - paid, 0));

        rows.push({
          key: s?._id || s?.id || s?.invoiceNo || crypto.randomUUID(),
          type: "SALE",
          partyName: s?.customerName ?? "Walk-in Customer",
          invoiceNo: s?.invoiceNo ?? "-",
          date: getDate(s?.date || s?.createdAt),
          method: s?.paymentMethod ?? null,
          amount: paid,
          due,
          note: s?.note ?? "",
        });
      });
    }

    if (Array.isArray(rawPurchases)) {
      rawPurchases.forEach((p: any) => {
        const total = Number(p?.totalAmount ?? 0);
        const paid = Number(p?.paidAmount ?? 0);
        const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));

        rows.push({
          key: p?._id || p?.id || p?.invoiceNo || crypto.randomUUID(),
          type: "PURCHASE",
          partyName: p?.supplierName ?? "-",
          invoiceNo: p?.invoiceNo ?? "-",
          date: getDate(p?.date || p?.createdAt),
          method: p?.paymentMethod ?? null,
          amount: paid,
          due,
          note: p?.note ?? "",
        });
      });
    }

    // ✅ sort latest first
    return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [rawSales, rawPurchases]);

  // ✅ Summary حساب
  const summary = useMemo(() => {
    let totalSalesPaid = 0;
    let totalSalesDue = 0;

    let totalPurchasePaid = 0;
    let totalPurchaseDue = 0;

    if (Array.isArray(rawSales)) {
      rawSales.forEach((s: any) => {
        const total = Number(s?.totalAmount ?? 0);
        const paid = Number(s?.paidAmount ?? 0);
        const due = Number(s?.dueAmount ?? Math.max(total - paid, 0));

        totalSalesPaid += paid;
        totalSalesDue += due;
      });
    }

    if (Array.isArray(rawPurchases)) {
      rawPurchases.forEach((p: any) => {
        const total = Number(p?.totalAmount ?? 0);
        const paid = Number(p?.paidAmount ?? 0);
        const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));

        totalPurchasePaid += paid;
        totalPurchaseDue += due;
      });
    }

    const cashInHand = totalSalesPaid - totalPurchasePaid;

    return {
      cashInHand,
      receivable: totalSalesDue,
      payable: totalPurchaseDue,
      totalSalesPaid,
      totalPurchasePaid,
    };
  }, [rawSales, rawPurchases]);

  // ✅ Filters on table rows
  const filteredData = useMemo(() => {
    const partyQ = partyQuery.trim().toLowerCase();
    const invoiceQ = invoiceQuery.trim().toLowerCase();

    return allRows.filter((row) => {
      const matchParty =
        !partyQ || row.partyName.toLowerCase().includes(partyQ);

      const matchInvoice =
        !invoiceQ || row.invoiceNo.toLowerCase().includes(invoiceQ);

      const matchDate = !date || row.date === date;

      const matchType = !typeFilter || row.type === typeFilter;

      return matchParty && matchInvoice && matchDate && matchType;
    });
  }, [allRows, partyQuery, invoiceQuery, date, typeFilter]);

  const loading = salesLoading || salesFetching || purchaseLoading || purchaseFetching;
  const isError = salesError || purchaseError;

  // ✅ Table Columns
  const columns: ColumnsType<PaymentRow> = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (t) =>
        t === "SALE" ? <Tag color="green">SALE</Tag> : <Tag color="blue">PURCHASE</Tag>,
    },
    {
      title: "Customer / Supplier",
      dataIndex: "partyName",
      key: "partyName",
      fixed: "left",
    },
    {
      title: "Invoice No",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (v) => <strong>{v}</strong>,
    },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Paid Amount",
      dataIndex: "amount",
      key: "amount",
      render: (v) => `৳ ${Number(v).toLocaleString()}`,
    },
    {
      title: "Due",
      dataIndex: "due",
      key: "due",
      render: (v) => (
        <Tag color={Number(v) > 0 ? "volcano" : "green"}>
          ৳ {Number(v).toLocaleString()}
        </Tag>
      ),
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      render: (m) => (m ? <Tag>{m}</Tag> : <Tag color="red">DUE</Tag>),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (n) => n || "-",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Total Account</h1>
        <p className="text-slate-500">
          Cash In Hand, Receivable (Customer Due) and Payable (Supplier Due)
        </p>
      </div>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-slate-50 border">
          <div className="text-sm text-slate-500">Cash In Hand</div>
          <div className={`text-2xl font-bold ${summary.cashInHand < 0 ? "text-red-600" : "text-slate-900"}`}>
            ৳ {Number(summary.cashInHand).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Sales Paid − Purchase Paid
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border">
          <div className="text-sm text-slate-500">Receivable (Customer Due)</div>
          <div className="text-2xl font-bold text-orange-600">
            ৳ {Number(summary.receivable).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Total Due from Sales
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border">
          <div className="text-sm text-slate-500">Payable (Supplier Due)</div>
          <div className="text-2xl font-bold text-blue-700">
            ৳ {Number(summary.payable).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Total Due from Purchases
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">
            Customer / Supplier
          </div>
          <Input
            placeholder="Search name"
            value={partyQuery}
            onChange={(e) => setPartyQuery(e.target.value)}
            allowClear
          />
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">Invoice No</div>
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
            onChange={(_, dateString) => setDate(dateString ? String(dateString) : null)}
            allowClear
          />
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-1">Type</div>
          <Select
            className="w-full"
            placeholder="Select type"
            value={typeFilter}
            onChange={(v) => setTypeFilter(v)}
            allowClear
          >
            <Option value="SALE">SALE</Option>
            <Option value="PURCHASE">PURCHASE</Option>
          </Select>
        </div>
      </div>

      {/* Reset */}
      <div className="mb-4 flex justify-end">
        <Button
          danger
          onClick={() => {
            setPartyQuery("");
            setInvoiceQuery("");
            setDate(null);
            setTypeFilter(undefined);
          }}
        >
          Reset
        </Button>
      </div>

      {/* Table */}
      {isError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          Failed to load account data. Please try again.
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default Page;
