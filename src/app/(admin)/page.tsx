"use client";

import React, { useMemo, useState } from "react";
import dayjs from "dayjs";

// RTK hooks
import { useGetProductsQuery } from "@/src/redux/features/product/productApi";
import { useGetPurchasesQuery } from "@/src/redux/features/purchase/purchaseApi";
import { useGetSalesQuery } from "@/src/redux/features/sales/salesApi";
import DashboardHeader from "@/src/components/pages/dashboard/DashboardHeader";
import DashboardError from "@/src/components/pages/dashboard/DashboardError";
import MetricCards from "@/src/components/pages/dashboard/MetricCards";
import ExtraStatsCards from "@/src/components/pages/dashboard/ExtraStatsCards";
import DashboardCharts from "@/src/components/pages/dashboard/DashboardCharts";
import RecentSalesTable from "@/src/components/pages/dashboard/RecentSalesTable";
import StockAndDues from "@/src/components/pages/dashboard/StockAndDues";
import DashboardFooterNote from "@/src/components/pages/dashboard/DashboardFooterNote";

// Components


type PaymentMethod = "CASH" | "BANK" | "BKASH" | "NAGAD" | null | undefined;

const safeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const toDateStr = (d?: any) => {
  if (!d) return "";
  return dayjs(d).format("YYYY-MM-DD");
};

const getLastNDays = (n = 7) => {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(dayjs().subtract(i, "day").format("YYYY-MM-DD"));
  }
  return days;
};

export type DashboardComputed = {
  totalProducts: number;
  totalStockQty: number;
  totalPurchaseInvoices: number;
  totalSalesInvoices: number;

  salesPaidTotal: number;
  salesDueTotal: number;
  purchasePaidTotal: number;
  purchaseDueTotal: number;

  cashBalance: number;
  bankBalance: number;

  lowStockList: { _id: string; name: string; sku: string; qty: number }[];
  outOfStockList: { _id: string; name: string; sku: string; qty: number }[];

  topCustomerDue: { key: string; customer: string; amount: number }[];
  topSupplierDue: { key: string; supplier: string; amount: number }[];

  recentSales: any[];
  chart: { day: string; date: string; sales: number; purchase: number; net: number }[];
};

const DashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<any>(null);
  const [search, setSearch] = useState("");

  // Fetch all data
  const {
    data: productsRes,
    isLoading: productLoading,
    isFetching: productFetching,
    isError: productError,
  } = useGetProductsQuery(undefined);

  const {
    data: purchasesRes,
    isLoading: purchaseLoading,
    isFetching: purchaseFetching,
    isError: purchaseError,
  } = useGetPurchasesQuery(undefined);

  const {
    data: salesRes,
    isLoading: salesLoading,
    isFetching: salesFetching,
    isError: salesError,
  } = useGetSalesQuery(undefined);

  const loading = productLoading || productFetching || purchaseLoading || purchaseFetching || salesLoading || salesFetching;
  const isError = productError || purchaseError || salesError;

  const rawProducts = productsRes?.data ?? productsRes ?? [];
  const rawPurchases = purchasesRes?.data ?? purchasesRes ?? [];
  const rawSales = salesRes?.data ?? salesRes ?? [];

  // date filter
  const inRange = (d: string) => {
    if (!dateRange) return true;
    const start = dayjs(dateRange?.[0]);
    const end = dayjs(dateRange?.[1]);
    const x = dayjs(d);
    return x.isAfter(start.subtract(1, "day")) && x.isBefore(end.add(1, "day"));
  };

  const computed: DashboardComputed = useMemo(() => {
    // Products
    const products = Array.isArray(rawProducts) ? rawProducts : [];
    const totalProducts = products.length;

    const totalStockQty = products.reduce((sum: number, p: any) => sum + Number(p?.quantity ?? p?.stock ?? 0), 0);

    const lowStockList = products
      .map((p: any) => ({
        _id: p?._id || p?.id || safeId(),
        name: p?.name ?? p?.productName ?? "-",
        sku: p?.sku ?? "-",
        qty: Number(p?.quantity ?? p?.stock ?? 0),
      }))
      .filter((x) => x.qty > 0 && x.qty <= 5)
      .slice(0, 8);

    const outOfStockList = products
      .map((p: any) => ({
        _id: p?._id || p?.id || safeId(),
        name: p?.name ?? p?.productName ?? "-",
        sku: p?.sku ?? "-",
        qty: Number(p?.quantity ?? p?.stock ?? 0),
      }))
      .filter((x) => x.qty === 0)
      .slice(0, 8);

    // Purchases
    const purchases = Array.isArray(rawPurchases) ? rawPurchases : [];
    const filteredPurchases = purchases.filter((p: any) => {
      const d = toDateStr(p?.date || p?.createdAt);
      return d ? inRange(d) : true;
    });

    const totalPurchaseInvoices = filteredPurchases.length;

    let purchasePaidTotal = 0;
    let purchaseDueTotal = 0;
    let bankPurchasePaid = 0;

    filteredPurchases.forEach((p: any) => {
      const total = Number(p?.totalAmount ?? 0);
      const paid = Number(p?.paidAmount ?? 0);
      const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));
      purchasePaidTotal += paid;
      purchaseDueTotal += due;

      const method = (p?.paymentMethod ?? null) as PaymentMethod;
      if (method === "BANK") bankPurchasePaid += paid;
    });

    // Sales
    const sales = Array.isArray(rawSales) ? rawSales : [];
    const filteredSales = sales.filter((s: any) => {
      const d = toDateStr(s?.date || s?.createdAt);
      return d ? inRange(d) : true;
    });

    const totalSalesInvoices = filteredSales.length;

    let salesPaidTotal = 0;
    let salesDueTotal = 0;
    let bankSalesPaid = 0;

    filteredSales.forEach((s: any) => {
      const total = Number(s?.totalAmount ?? 0);
      const paid = Number(s?.paidAmount ?? 0);
      const due = Number(s?.dueAmount ?? Math.max(total - paid, 0));
      salesPaidTotal += paid;
      salesDueTotal += due;

      const method = (s?.paymentMethod ?? null) as PaymentMethod;
      if (method === "BANK") bankSalesPaid += paid;
    });

    const cashBalance = salesPaidTotal - purchasePaidTotal;
    const bankBalance = bankSalesPaid - bankPurchasePaid;

    // Customer Due
    const customerDueMap = new Map<string, number>();
    filteredSales.forEach((s: any) => {
      const name = (s?.customerName ?? "Walk-in Customer") as string;
      const total = Number(s?.totalAmount ?? 0);
      const paid = Number(s?.paidAmount ?? 0);
      const due = Number(s?.dueAmount ?? Math.max(total - paid, 0));
      if (due > 0) customerDueMap.set(name, (customerDueMap.get(name) ?? 0) + due);
    });

    const topCustomerDue = Array.from(customerDueMap.entries())
      .map(([customer, amount]) => ({ key: customer, customer, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    // Supplier Due
    const supplierDueMap = new Map<string, number>();
    filteredPurchases.forEach((p: any) => {
      const name = (p?.supplierName ?? "-") as string;
      const total = Number(p?.totalAmount ?? 0);
      const paid = Number(p?.paidAmount ?? 0);
      const due = Number(p?.dueAmount ?? Math.max(total - paid, 0));
      if (due > 0) supplierDueMap.set(name, (supplierDueMap.get(name) ?? 0) + due);
    });

    const topSupplierDue = Array.from(supplierDueMap.entries())
      .map(([supplier, amount]) => ({ key: supplier, supplier, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    // Recent Sales
    const recentSales = filteredSales
      .map((s: any) => ({
        key: s?._id || s?.id || safeId(),
        date: toDateStr(s?.date || s?.createdAt) || "-",
        invoiceNo: s?.invoiceNo ?? "-",
        customerName: s?.customerName ?? "Walk-in Customer",
        productName: s?.productName ?? "-",
        quantity: Number(s?.quantity ?? 0),
        totalAmount: Number(s?.totalAmount ?? 0),
        paidAmount: Number(s?.paidAmount ?? 0),
        dueAmount: Number(s?.dueAmount ?? Math.max(Number(s?.totalAmount ?? 0) - Number(s?.paidAmount ?? 0), 0)),
        paymentMethod: (s?.paymentMethod ?? null) as PaymentMethod,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 8);

    // Charts (last 7 days)
    const days = getLastNDays(7);
    const chart = days.map((d) => {
      let salesTotal = 0;
      let purchaseTotal = 0;

      sales.forEach((s: any) => {
        const dd = toDateStr(s?.date || s?.createdAt);
        if (dd === d) salesTotal += Number(s?.totalAmount ?? 0);
      });

      purchases.forEach((p: any) => {
        const dd = toDateStr(p?.date || p?.createdAt);
        if (dd === d) purchaseTotal += Number(p?.totalAmount ?? 0);
      });

      return {
        day: dayjs(d).format("ddd"),
        date: d,
        sales: salesTotal,
        purchase: purchaseTotal,
        net: salesTotal - purchaseTotal,
      };
    });

    return {
      totalProducts,
      totalStockQty,
      totalPurchaseInvoices,
      totalSalesInvoices,
      salesPaidTotal,
      salesDueTotal,
      purchasePaidTotal,
      purchaseDueTotal,
      cashBalance,
      bankBalance,
      lowStockList,
      outOfStockList,
      topCustomerDue,
      topSupplierDue,
      recentSales,
      chart,
    };
  }, [rawProducts, rawPurchases, rawSales, dateRange]);

  // Search filter
  const searchQ = search.trim().toLowerCase();
  const lowStockFiltered = useMemo(() => {
    if (!searchQ) return computed.lowStockList;
    return computed.lowStockList.filter((x) => x.name.toLowerCase().includes(searchQ) || x.sku.toLowerCase().includes(searchQ));
  }, [computed.lowStockList, searchQ]);

  const outOfStockFiltered = useMemo(() => {
    if (!searchQ) return computed.outOfStockList;
    return computed.outOfStockList.filter((x) => x.name.toLowerCase().includes(searchQ) || x.sku.toLowerCase().includes(searchQ));
  }, [computed.outOfStockList, searchQ]);

  return (
    <div className="p-6 min-h-screen">
      <DashboardHeader
        search={search}
        setSearch={setSearch}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <DashboardError isError={!!isError} />

      <MetricCards computed={computed} loading={loading} />
      <ExtraStatsCards computed={computed} loading={loading} />
      <DashboardCharts computed={computed} />

      <RecentSalesTable computed={computed} loading={loading} />

      <StockAndDues
        loading={loading}
        lowStockFiltered={lowStockFiltered}
        outOfStockFiltered={outOfStockFiltered}
        topCustomerDue={computed.topCustomerDue}
        topSupplierDue={computed.topSupplierDue}
      />

      <DashboardFooterNote />
    </div>
  );
};

export default DashboardPage;
